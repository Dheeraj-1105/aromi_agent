"""
UserProfile ORM model — the heart of the agent's memory.
Every field feeds into the system prompt so the agent knows who it's talking to.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), unique=True, nullable=False
    )

    # Goals
    primary_goal: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Physical stats
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Fitness
    fitness_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    available_equipment: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # JSON string list
    workout_days_per_week: Mapped[int | None] = mapped_column(Integer, nullable=True)
    preferred_workout_duration_min: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Health
    injuries_or_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    dietary_restrictions: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Nutrition
    daily_calorie_target: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Agent memory — AroMi writes here after every session
    last_workout_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_week_plan: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON blob
    notes_for_agent: Mapped[str | None] = mapped_column(Text, nullable=True)  # freeform memory

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="profile")  # noqa: F821
