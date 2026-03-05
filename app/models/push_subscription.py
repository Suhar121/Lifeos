from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    # Legacy Web Push fields (kept for backward compat, nullable now)
    endpoint = Column(Text, nullable=True, unique=True)
    p256dh = Column(Text, nullable=True)
    auth = Column(Text, nullable=True)
    # Firebase Cloud Messaging token
    fcm_token = Column(Text, nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="push_subscriptions")
