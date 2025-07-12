# routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from schemas import UserResponse, NotificationResponse
from crud import get_user_by_username, get_unread_notifications, mark_notification_as_read
from core.security import get_current_active_user, get_current_user_admin
from models import User

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/{username}", response_model=UserResponse)
async def read_user(username: str, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_username(db, username=username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.get("/me/notifications", response_model=List[NotificationResponse])
async def get_my_notifications(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    notifications = await get_unread_notifications(db, current_user.id)
    return notifications

@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    notification = await mark_notification_as_read(db, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found or not authorized")
    return notification

# Admin specific routes (placeholder for now)
@router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users_admin(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user_admin), # Requires admin role
    db: AsyncSession = Depends(get_db)
):
    # This would typically fetch all users, potentially with filtering and pagination
    # For now, it just shows an example of an admin-only endpoint
    # You would implement specific CRUD operations for admin on users here
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Admin user management not yet implemented")

# TODO: Add routes for banning users, rejecting content (admin), downloading reports
