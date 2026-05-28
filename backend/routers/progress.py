"""
Progress router — returns workout stats, weekly calendar, and streak information.
"""
import datetime
import json
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from models.workout_log import WorkoutLog
from routers.deps import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("")
async def get_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve statistics, streak, weekly calendar, and recent workouts for the current user.
    """
    result = await db.execute(
        select(WorkoutLog)
        .where(WorkoutLog.user_id == current_user.id)
        .order_by(WorkoutLog.logged_at.desc())
    )
    logs = result.scalars().all()

    # 1. Total workouts
    total_workouts = len(logs)

    # 2. Avg duration
    avg_duration = sum(log.duration_min for log in logs) / len(logs) if logs else 0.0

    # 3. Weekly calendar (Monday to Sunday of the current week)
    today = datetime.date.today()
    monday = today - datetime.timedelta(days=today.weekday())  # weekday() is 0 for Mon, 6 for Sun
    week_dates = [monday + datetime.timedelta(days=i) for i in range(7)]

    # Check which dates have at least one workout
    workout_dates = {log.logged_at.date() for log in logs}

    weekly_calendar = []
    for d in week_dates:
        weekly_calendar.append({
            "date": d.isoformat(),
            "completed": d in workout_dates
        })

    # 4. Workouts this week
    this_week = sum(1 for d in week_dates if d in workout_dates)

    # 5. Current streak
    current_streak = 0
    check_date = today

    if check_date in workout_dates:
        while check_date in workout_dates:
            current_streak += 1
            check_date -= datetime.timedelta(days=1)
    else:
        yesterday = today - datetime.timedelta(days=1)
        if yesterday in workout_dates:
            check_date = yesterday
            while check_date in workout_dates:
                current_streak += 1
                check_date -= datetime.timedelta(days=1)

    # 6. Recent workouts (last 10)
    recent_workouts = []
    for log in logs[:10]:
        # Try parsing exercises JSON if possible
        exercises_parsed = []
        if log.exercises:
            try:
                exercises_parsed = json.loads(log.exercises)
            except Exception:
                exercises_parsed = log.exercises

        recent_workouts.append({
            "id": log.id,
            "logged_at": log.logged_at.isoformat(),
            "workout_type": log.workout_type,
            "duration_min": log.duration_min,
            "perceived_difficulty": log.perceived_difficulty,
            "notes": log.notes,
            "calories_burned": log.calories_burned,
            "exercises": exercises_parsed
        })

    return {
        "total_workouts": total_workouts,
        "this_week": this_week,
        "current_streak": current_streak,
        "avg_duration": round(avg_duration, 1),
        "recent_workouts": recent_workouts,
        "weekly_calendar": weekly_calendar
    }
