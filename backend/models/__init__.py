"""
models/__init__.py — re-export all models so Alembic autogenerate finds them.
"""
from models.chat_message import ChatMessage  # noqa: F401
from models.profile import UserProfile  # noqa: F401
from models.user import User  # noqa: F401
from models.workout_log import WorkoutLog  # noqa: F401

__all__ = ["User", "UserProfile", "WorkoutLog", "ChatMessage"]
