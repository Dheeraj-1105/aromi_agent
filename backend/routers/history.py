"""
Chat history router — GET and DELETE /history endpoints.

GET  /history        — fetch messages for the current user (paginated)
DELETE /history      — clear all chat history for the current user
"""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.chat_message import ChatMessage
from models.user import User
from routers.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["history"])


@router.get("")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
):
    """Fetch chat messages for the current user, oldest first, with pagination."""
    # Total count for pagination awareness
    count_result = await db.execute(
        select(func.count()).select_from(ChatMessage).where(
            ChatMessage.user_id == current_user.id
        )
    )
    total = count_result.scalar()

    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    messages = result.scalars().all()
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
    }


@router.delete("")
async def clear_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Permanently delete all chat messages for the current user."""
    await db.execute(
        delete(ChatMessage).where(ChatMessage.user_id == current_user.id)
    )
    await db.commit()
    return {"status": "cleared"}
