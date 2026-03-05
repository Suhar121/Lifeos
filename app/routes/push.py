from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.push_subscription import PushSubscription
from app.utils.security import get_current_user
from app.services.push_service import send_push_to_user
import os

router = APIRouter()


class FCMSubscriptionCreate(BaseModel):
    fcm_token: str


@router.post("/subscribe")
def subscribe_push(
    sub: FCMSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register an FCM token for the current user."""
    # Check if this FCM token already exists
    existing = db.query(PushSubscription).filter(
        PushSubscription.fcm_token == sub.fcm_token
    ).first()

    if existing:
        # Update user if changed
        existing.user_id = current_user.id
        db.commit()
        return {"message": "FCM subscription updated"}

    new_sub = PushSubscription(
        user_id=current_user.id,
        fcm_token=sub.fcm_token
    )
    db.add(new_sub)
    db.commit()
    return {"message": "FCM subscription created"}


@router.delete("/unsubscribe")
def unsubscribe_push(
    fcm_token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an FCM subscription."""
    sub = db.query(PushSubscription).filter(
        PushSubscription.fcm_token == fcm_token,
        PushSubscription.user_id == current_user.id
    ).first()

    if sub:
        db.delete(sub)
        db.commit()
    return {"message": "Unsubscribed"}


@router.post("/test")
def test_push(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a test push notification to the current user."""
    send_push_to_user(
        db, current_user.id,
        title="🔔 LifeOS Test",
        body="Firebase push notifications are working! You'll get medicine & event reminders even when the app is closed.",
        icon="🔔",
        url="/calendar",
        tag="test"
    )
    return {"message": "Test notification sent"}
