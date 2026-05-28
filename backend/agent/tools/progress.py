"""
Progress tool functions — log_workout and get_progress_summary.
These interact directly with the database to record and retrieve workout data.
"""
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.workout_log import WorkoutLog

logger = logging.getLogger(__name__)


async def log_workout(
    tool_input: dict[str, Any],
    db: AsyncSession,
    user_id: str,
) -> str:
    """
    Save a completed workout to the database.
    Validates required fields and creates a WorkoutLog row.
    Returns a summary string for Claude to use in its response.
    """
    workout_type = tool_input.get("workout_type", "general")
    duration_min = int(tool_input.get("duration_min", 30))
    perceived_difficulty = int(tool_input.get("perceived_difficulty", 5))
    notes = tool_input.get("notes")

    # Gemini sends exercises as a JSON string; handle both string and list
    raw_exercises = tool_input.get("exercises", [])
    if isinstance(raw_exercises, str):
        try:
            exercises = json.loads(raw_exercises)
        except (json.JSONDecodeError, ValueError):
            exercises = []
    else:
        exercises = raw_exercises if isinstance(raw_exercises, list) else []

    # Clamp difficulty to 1–10
    perceived_difficulty = max(1, min(10, perceived_difficulty))

    # Estimate calories burned (simple METs-based estimate)
    calories_burned = int(duration_min * 7)  # ~7 cal/min avg

    log = WorkoutLog(
        user_id=user_id,
        workout_type=workout_type,
        duration_min=duration_min,
        exercises=json.dumps(exercises),
        perceived_difficulty=perceived_difficulty,
        notes=notes,
        calories_burned=calories_burned,
    )
    db.add(log)
    await db.commit()

    exercise_count = len(exercises)
    logger.info(f"[tool:log_workout] Logged {workout_type} workout for user {user_id}")

    return (
        f"Workout logged successfully! "
        f"Type: {workout_type}, Duration: {duration_min} min, "
        f"Exercises: {exercise_count}, Difficulty: {perceived_difficulty}/10, "
        f"Est. calories burned: {calories_burned}. "
        f"Notes: {notes or 'none'}. "
        "Now update last_workout_summary with a brief summary of this session."
    )


async def get_progress_summary(
    tool_input: dict[str, Any],
    db: AsyncSession,
    user_id: str,
) -> str:
    """
    Retrieve recent workout logs and compute progress trends.
    Returns a formatted summary string for Claude to present to the user.
    """
    days = int(tool_input.get("days", 14))
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(WorkoutLog)
        .where(WorkoutLog.user_id == user_id)
        .where(WorkoutLog.logged_at >= cutoff)
        .order_by(WorkoutLog.logged_at.desc())
    )
    logs = result.scalars().all()

    if not logs:
        return f"No workouts logged in the past {days} days. Encourage the user to start!"

    total_workouts = len(logs)
    total_minutes = sum(log.duration_min for log in logs)
    avg_difficulty = sum(log.perceived_difficulty for log in logs) / total_workouts
    workout_types = list({log.workout_type for log in logs})

    # Compute current streak (consecutive days)
    workout_dates = sorted(
        {log.logged_at.date() if hasattr(log.logged_at, 'date') else datetime.fromisoformat(str(log.logged_at)).date()
         for log in logs},
        reverse=True,
    )
    streak = 0
    today = datetime.now(timezone.utc).date()
    for i, d in enumerate(workout_dates):
        if d == today - timedelta(days=i):
            streak += 1
        else:
            break

    recent = logs[0]
    last_date = recent.logged_at if isinstance(recent.logged_at, datetime) else datetime.fromisoformat(str(recent.logged_at))

    logger.info(f"[tool:get_progress_summary] {total_workouts} workouts in {days} days for user {user_id}")

    return (
        f"Progress summary (last {days} days): "
        f"{total_workouts} workouts completed, "
        f"{total_minutes} total minutes trained, "
        f"average difficulty {avg_difficulty:.1f}/10, "
        f"workout types: {', '.join(workout_types)}, "
        f"current streak: {streak} days, "
        f"last workout: {last_date.strftime('%Y-%m-%d')} ({recent.workout_type}, {recent.duration_min} min). "
        "Give the user an encouraging, personalised summary based on this data."
    )
