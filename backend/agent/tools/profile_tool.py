"""
Profile tool functions — get_profile and update_profile.
These let the agent read and write the user's profile memory.
"""
import json
import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.profile import UserProfile

logger = logging.getLogger(__name__)

# Fields the agent is allowed to update (whitelist for safety)
ALLOWED_PROFILE_FIELDS = {
    "primary_goal",
    "target_weight_kg",
    "age",
    "gender",
    "height_cm",
    "current_weight_kg",
    "fitness_level",
    "available_equipment",
    "workout_days_per_week",
    "preferred_workout_duration_min",
    "injuries_or_conditions",
    "dietary_restrictions",
    "daily_calorie_target",
    "last_workout_summary",
    "current_week_plan",
    "notes_for_agent",
}


async def get_profile(
    tool_input: dict[str, Any],
    db: AsyncSession,
    user_id: str,
) -> str:
    """
    Load the user profile from the database and return it as JSON string.
    Used when the agent needs to re-read current state mid-conversation.
    """
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        return "No profile found for this user."

    data = {col.name: getattr(profile, col.name) for col in UserProfile.__table__.columns}
    return json.dumps(data, default=str)


async def update_profile(
    tool_input: dict[str, Any],
    db: AsyncSession,
    user_id: str,
) -> str:
    """
    Update a single profile field. This is how AroMi remembers new information.
    Only whitelisted fields can be updated for safety.
    """
    field = tool_input.get("field", "")
    value = tool_input.get("value")

    if field not in ALLOWED_PROFILE_FIELDS:
        return f"Error: '{field}' is not an updatable profile field. Allowed: {sorted(ALLOWED_PROFILE_FIELDS)}"

    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        return "Error: Profile not found."

    # Handle list values — serialize to JSON for SQLite
    if isinstance(value, list):
        value = json.dumps(value)

    # Append to notes_for_agent instead of overwriting (memory accumulation)
    if field == "notes_for_agent" and profile.notes_for_agent:
        existing = profile.notes_for_agent
        value = f"{existing}\n{value}"

    setattr(profile, field, value)
    await db.commit()

    logger.info(f"[tool:update_profile] Updated {field} for user {user_id}")
    return f"Profile updated: {field} = {value}"
