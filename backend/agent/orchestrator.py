"""
Agent orchestrator — Groq (LLaMA) agentic loop with tool calling.

Flow:
1. Load user profile from DB → serialize to dict
2. Build system prompt with injected profile
3. Convert conversation history to OpenAI messages format
4. Call Groq chat.completions.create with tools
5. If response has tool_calls → dispatch tool → append tool result → call again
6. Repeat until no more tool calls (up to 10 iterations)
7. Yield final text tokens for SSE streaming

Error handling:
- Rate limits / API errors: retry with backoff
- All retries exhausted: yield a structured error sentinel the frontend can detect
"""
import asyncio
import json
import logging
from collections.abc import AsyncGenerator
from typing import Any

from groq import Groq
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from agent.system_prompt import get_system_prompt
from agent.tool_runner import dispatch
from agent.tools import get_groq_tools
from config import settings
from models.chat_message import ChatMessage
from models.profile import UserProfile

logger = logging.getLogger(__name__)

# ─── Model config ─────────────────────────────────────────────────────────────
GROQ_MODEL = "llama-3.3-70b-versatile"

# Retry config
_MAX_RETRIES = 3


# ─── Profile helpers ──────────────────────────────────────────────────────────

def _profile_to_dict(profile: UserProfile | None) -> dict[str, Any] | None:
    """Convert ORM profile row to a plain dict for system prompt injection."""
    if not profile:
        return None
    data = {}
    for col in UserProfile.__table__.columns:
        val = getattr(profile, col.name)
        if col.name == "available_equipment" and val:
            try:
                val = json.loads(val)
            except (json.JSONDecodeError, TypeError):
                pass
        data[col.name] = val
    return data


# ─── History builder ──────────────────────────────────────────────────────────

async def _load_history_from_db(
    db: AsyncSession,
    user_id: str,
    limit: int = 10,
) -> list[dict[str, str]]:
    """
    Load the last `limit` chat messages from DB for this user, oldest first.
    Returns a list of {role, content} dicts compatible with Groq messages format.
    """
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    db_messages = result.scalars().all()
    db_messages = list(reversed(db_messages))  # oldest first
    return [{"role": m.role, "content": m.content} for m in db_messages]


def _build_messages(
    system_prompt: str,
    history: list[dict[str, str]],
    user_message: str,
) -> list[dict]:
    """
    Build an OpenAI-compatible messages list:
      [system, ...history, user_message]
    """
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})
    return messages


# ─── Retry Groq caller ───────────────────────────────────────────────────────

async def _call_groq_with_retry(
    client: Groq,
    messages: list[dict],
    tools: list[dict],
    max_retries: int = _MAX_RETRIES,
) -> Any:
    """
    Call Groq chat completions with retry on rate limits / transient errors.
    Runs the synchronous Groq client in a thread to avoid blocking the event loop.
    """
    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                client.chat.completions.create,
                model=GROQ_MODEL,
                messages=messages,
                tools=tools if tools else None,
                tool_choice="auto" if tools else None,
                max_tokens=2048,
                temperature=0.7,
            )
            return response
        except Exception as e:
            error_str = str(e)
            # Retry on rate limits
            if "429" in error_str or "rate_limit" in error_str.lower():
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 5
                    logger.warning(f"[RETRY] Groq rate limited, waiting {wait_time}s...")
                    await asyncio.sleep(wait_time)
                    continue
            # Retry on server errors
            if "503" in error_str or "500" in error_str or "unavailable" in error_str.lower():
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 3
                    logger.warning(f"[RETRY] Groq unavailable, waiting {wait_time}s...")
                    await asyncio.sleep(wait_time)
                    continue
            raise

    raise RuntimeError("__GROQ_UNAVAILABLE__: All retries exhausted")


# ─── Main agentic loop ────────────────────────────────────────────────────────

async def run_agent(
    user_message: str,
    db: AsyncSession,
    user_id: str,
) -> AsyncGenerator[str, None]:
    """
    Groq agentic loop — yields text chunks for SSE streaming.

    Falls back gracefully if GROQ_API_KEY is not set in .env.
    On persistent API failure, yields the sentinel string __GROQ_UNAVAILABLE__
    so the frontend can render a clean error UI instead of raw JSON.
    """
    # ── 1. Load profile ───────────────────────────────────────────────────────
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile_orm = result.scalar_one_or_none()
    profile_dict = _profile_to_dict(profile_orm)

    # ── 2. System prompt with profile injected ────────────────────────────────
    system_instruction = get_system_prompt(profile_dict)

    # ── 3. Guard: API key check ───────────────────────────────────────────────
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY.startswith("YOUR_"):
        yield (
            "⚠️ **AroMi is not connected to Groq yet.**\n\n"
            "Add your `GROQ_API_KEY` to `aromi/backend/.env` and restart the server.\n\n"
            "Once connected, I can create personalised workout plans, track your progress, "
            "and adapt to your feedback in real time! 💪"
        )
        return

    # ── 4. Initialise Groq client ─────────────────────────────────────────────
    client = Groq(api_key=settings.GROQ_API_KEY)

    groq_tools = get_groq_tools()  # list of OpenAI-format tool dicts

    # ── 5. Load history from DB and build conversation messages ─────────────────
    history = await _load_history_from_db(db, user_id)
    messages = _build_messages(system_instruction, history, user_message)

    # ── 6. Agentic loop ───────────────────────────────────────────────────────
    max_iterations = 10

    for iteration in range(max_iterations):
        logger.info(f"[orchestrator] Groq call #{iteration + 1}, messages in context: {len(messages)}")

        try:
            response = await _call_groq_with_retry(
                client=client,
                messages=messages,
                tools=groq_tools,
            )
        except RuntimeError as e:
            error_str = str(e)
            if "__GROQ_UNAVAILABLE__" in error_str:
                yield "__GROQ_UNAVAILABLE__"
            else:
                yield f"\n\n⚠️ Error communicating with Groq: {error_str}"
            return
        except Exception as e:
            yield f"\n\n⚠️ Error communicating with Groq: {str(e)}"
            return

        # ── Parse response ────────────────────────────────────────────────────
        message = response.choices[0].message

        logger.info(f"[orchestrator] content={'yes' if message.content else 'no'}, "
              f"tool_calls={len(message.tool_calls) if message.tool_calls else 0}")

        # ── Stream text content if present ────────────────────────────────────
        if message.content:
            text_to_stream = message.content
            words = text_to_stream.split(" ")
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")
                await asyncio.sleep(0.01)
            if message.tool_calls:
                yield "\n\n"

        # ── If no tool calls, we are done ─────────────────────────────────────
        if not message.tool_calls:
            return

        # ── Append assistant's turn (with tool_calls) to messages ─────────────
        assistant_msg = {
            "role": "assistant",
            "content": message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in message.tool_calls
            ],
        }
        messages.append(assistant_msg)

        # ── Execute tool calls and collect responses ──────────────────────────
        for tc in message.tool_calls:
            tool_name = tc.function.name
            try:
                tool_input = json.loads(tc.function.arguments)
            except json.JSONDecodeError:
                tool_input = {}

            logger.info(f"[orchestrator] -> Tool: {tool_name}  args={json.dumps(tool_input, default=str)}")

            try:
                tool_result = await dispatch(
                    tool_name=tool_name,
                    tool_input=tool_input,
                    db=db,
                    user_id=user_id,
                    profile=profile_dict or {},
                )
            except Exception as e:
                tool_result = f"Tool error: {str(e)}"

            logger.info(f"[orchestrator] <- Result preview: {str(tool_result)[:150]}")

            # Append tool result as a tool message
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": str(tool_result),
            })

    yield "\n\n⚠️ Agent reached max iterations. Please try again."
