"""
User ORM model — stores authentication credentials.
Profile is stored separately in UserProfile.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    profile: Mapped["UserProfile"] = relationship(  # noqa: F821
        "UserProfile", back_populates="user", uselist=False, lazy="select"
    )
    workout_logs: Mapped[list["WorkoutLog"]] = relationship(  # noqa: F821
        "WorkoutLog", back_populates="user", lazy="select"
    )
    messages: Mapped[list["ChatMessage"]] = relationship(  # noqa: F821
        "ChatMessage",
        back_populates="user",
        order_by="ChatMessage.created_at",
        cascade="all, delete-orphan",
        lazy="select",
    )
