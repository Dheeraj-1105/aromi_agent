"""
Profile router — GET and PUT for the current user's UserProfile.
Used by the onboarding form and ProgressSidebar.
"""
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.profile import UserProfile
from models.user import User
from routers.deps import get_current_user
from schemas.profile import ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/profile", tags=["profile"])


async def _get_or_404(db: AsyncSession, user_id: str) -> UserProfile:
    """Helper — load profile or raise 404."""
    # Eager load the user relation to access full_name cleanly
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(UserProfile)
        .where(UserProfile.user_id == user_id)
        .options(selectinload(UserProfile.user))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


def _profile_to_response(profile: UserProfile) -> ProfileResponse:
    """Convert ORM model to Pydantic response, parsing JSON equipment list."""
    equipment = None
    if profile.available_equipment:
        try:
            equipment = json.loads(profile.available_equipment)
        except (json.JSONDecodeError, TypeError):
            equipment = [profile.available_equipment]

    # Retrieve full_name from relationship
    full_name = profile.user.full_name if profile.user else None

    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=full_name,
        primary_goal=profile.primary_goal,
        target_weight_kg=profile.target_weight_kg,
        age=profile.age,
        gender=profile.gender,
        height_cm=profile.height_cm,
        current_weight_kg=profile.current_weight_kg,
        fitness_level=profile.fitness_level,
        available_equipment=equipment,
        workout_days_per_week=profile.workout_days_per_week,
        preferred_workout_duration_min=profile.preferred_workout_duration_min,
        injuries_or_conditions=profile.injuries_or_conditions,
        dietary_restrictions=profile.dietary_restrictions,
        daily_calorie_target=profile.daily_calorie_target,
        last_workout_summary=profile.last_workout_summary,
        current_week_plan=profile.current_week_plan,
        notes_for_agent=profile.notes_for_agent,
    )


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the full UserProfile for the authenticated user."""
    profile = await _get_or_404(db, current_user.id)
    return _profile_to_response(profile)


@router.put("", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update profile fields (partial update — only non-None fields are applied).
    Used by the onboarding form and by the agent via the update_profile tool.
    """
    profile = await _get_or_404(db, current_user.id)

    update_data = body.model_dump(exclude_none=True)

    # Handle full_name update on the User model
    if "full_name" in update_data:
        full_name_val = update_data.pop("full_name")
        current_user.full_name = full_name_val
        db.add(current_user)

    # Serialize list fields to JSON strings for SQLite storage
    if "available_equipment" in update_data:
        update_data["available_equipment"] = json.dumps(update_data["available_equipment"])

    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    # Re-fetch profile to load updated user relationship properly
    profile = await _get_or_404(db, current_user.id)
    return _profile_to_response(profile)
