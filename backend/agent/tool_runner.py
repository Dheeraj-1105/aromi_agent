"""
Tool runner — dispatches Groq tool_call blocks to the correct tool function.
Every tool call name, input, and output is logged for debugging.
"""
import json
import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from agent.tools.coaching import generate_workout_plan
from agent.tools.nutrition import generate_meal_plan, lookup_food
from agent.tools.profile_tool import get_profile, update_profile
from agent.tools.progress import get_progress_summary, log_workout
from agent.tools.calculators import calculate_bmr, calculate_tdee, calculate_calorie_goal, calculate_macros

logger = logging.getLogger(__name__)


async def dispatch(
    tool_name: str,
    tool_input: dict[str, Any],
    db: AsyncSession,
    user_id: str,
    profile: dict[str, Any],
) -> str:
    """
    Route a Groq tool_call to the correct tool function.
    Returns a string result appended to the conversation as a tool response.

    All tool calls are logged with [TOOL CALLED] / [TOOL INPUT] / [TOOL OUTPUT] tags.
    """
    logger.info(f"[TOOL CALLED] {tool_name}")
    logger.info(f"[TOOL INPUT] {json.dumps(tool_input, indent=2, default=str)}")

    try:
        if tool_name == "generate_workout_plan":
            result = generate_workout_plan(tool_input, profile)

        elif tool_name == "log_workout":
            result = await log_workout(tool_input, db, user_id)

        elif tool_name == "get_progress_summary":
            result = await get_progress_summary(tool_input, db, user_id)

        elif tool_name == "generate_meal_plan":
            result = generate_meal_plan(tool_input, profile)

        elif tool_name == "lookup_food":
            result = lookup_food(tool_input, profile)

        elif tool_name == "update_profile":
            result = await update_profile(tool_input, db, user_id)

        elif tool_name == "get_profile":
            result = await get_profile(tool_input, db, user_id)

        elif tool_name == "calculate_bmr":
            bmr = calculate_bmr(
                weight_kg=float(tool_input["weight_kg"]),
                height_cm=float(tool_input["height_cm"]),
                age=int(tool_input["age"]),
                gender=tool_input["gender"]
            )
            result = json.dumps({"bmr": bmr})

        elif tool_name == "calculate_tdee":
            tdee = calculate_tdee(
                bmr=float(tool_input["bmr"]),
                activity_level=tool_input["activity_level"]
            )
            result = json.dumps({"tdee": tdee})

        elif tool_name == "calculate_calorie_goal":
            goal_cal = calculate_calorie_goal(
                tdee=int(tool_input["tdee"]),
                goal=tool_input["goal"]
            )
            result = json.dumps({"calorie_goal": goal_cal})

        elif tool_name == "calculate_macros":
            macros = calculate_macros(
                calorie_goal=int(tool_input["calorie_goal"]),
                goal=tool_input["goal"]
            )
            result = json.dumps(macros)

        else:
            result = f"Unknown tool: {tool_name}"

    except Exception as e:
        result = f"Tool '{tool_name}' failed: {str(e)}"
        logger.error(f"[TOOL ERROR] {result}")

    logger.info(f"[TOOL OUTPUT] {str(result)[:300]}")
    return result
