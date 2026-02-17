from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.push_subscription import PushSubscription
from app.utils.security import get_current_user
from app.services.push_service import send_push_to_user, VAPID_PUBLIC_KEY
import os

router = APIRouter()


class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh: str
    auth: str


@router.get("/vapid-public-key")
def get_vapid_public_key():
    """Return the VAPID public key for the frontend to use when subscribing."""
    return {"publicKey": VAPID_PUBLIC_KEY}


@router.post("/subscribe")
def subscribe_push(
    sub: PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a push subscription for the current user."""
    # Check if this endpoint already exists
    existing = db.query(PushSubscription).filter(
        PushSubscription.endpoint == sub.endpoint
    ).first()

    if existing:
        # Update keys and user if changed
        existing.p256dh = sub.p256dh
        existing.auth = sub.auth
        existing.user_id = current_user.id
        db.commit()
        return {"message": "Subscription updated"}

    new_sub = PushSubscription(
        user_id=current_user.id,
        endpoint=sub.endpoint,
        p256dh=sub.p256dh,
        auth=sub.auth
    )
    db.add(new_sub)
    db.commit()
    return {"message": "Subscription created"}


@router.delete("/unsubscribe")
def unsubscribe_push(
    endpoint: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a push subscription."""
    sub = db.query(PushSubscription).filter(
        PushSubscription.endpoint == endpoint,
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
        body="Push notifications are working! You'll get medicine & event reminders even when the app is closed.",
        icon="🔔",
        url="/calendar",
        tag="test"
    )
    return {"message": "Test notification sent"}
