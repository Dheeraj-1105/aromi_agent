"""
WorkoutLog ORM model — stores individual workout sessions.
Used by the agent to track progress and compute streaks.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    workout_type: Mapped[str] = mapped_column(String(100), nullable=False)
    duration_min: Mapped[int] = mapped_column(Integer, nullable=False)
    exercises: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    perceived_difficulty: Mapped[int] = mapped_column(Integer, nullable=False)  # 1–10
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    calories_burned: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="workout_logs")  # noqa: F821
