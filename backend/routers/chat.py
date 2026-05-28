"""
Chat router — POST /chat returns a Server-Sent Events stream.

SSE event format:
  data: {"type": "token", "data": "...text chunk..."}
  data: {"type": "done"}

The frontend uses native EventSource to consume this stream.
After streaming completes, both the user message and the full
assistant response are persisted to the chat_messages table.

Rate limited to 20 requests/minute per IP address.
"""
import json

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from agent.orchestrator import run_agent
from database import get_db
from models.chat_message import ChatMessage
from models.user import User
from routers.deps import get_current_user
from schemas.chat import ChatRequest

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
@limiter.limit("20/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Main chat endpoint — streams AroMi's response as SSE events.

    Accepts: { message: string, history: [{role, content}] }
    Streams: data: {type: "token", data: "..."} events, then data: {type: "done"}
    After streaming, saves both messages to DB for persistent history.

    Rate limited to 20 messages per minute per IP address.
    """

    async def event_generator():
        accumulated_response = []
        try:
            async for token in run_agent(
                user_message=body.message,
                db=db,
                user_id=current_user.id,
            ):
                accumulated_response.append(token)
                event_data = json.dumps({"type": "token", "data": token})
                yield f"data: {event_data}\n\n"
        except Exception as e:
            error_data = json.dumps({"type": "error", "data": str(e)})
            yield f"data: {error_data}\n\n"
        finally:
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            # Save both messages to DB for persistent history
            full_response = "".join(accumulated_response).strip()
            if full_response:
                try:
                    db.add(ChatMessage(
                        user_id=current_user.id,
                        role="user",
                        content=body.message,
                    ))
                    db.add(ChatMessage(
                        user_id=current_user.id,
                        role="assistant",
                        content=full_response,
                    ))
                    await db.commit()
                except Exception:
                    await db.rollback()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
