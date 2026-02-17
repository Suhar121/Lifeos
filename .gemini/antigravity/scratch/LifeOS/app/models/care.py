from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base


class CareRelationship(str, enum.Enum):
    parent = "parent"
    child = "child"
    spouse = "spouse"
    caretaker = "caretaker"
    friend = "friend"
    other = "other"


class CareLinkStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    declined = "declined"
    revoked = "revoked"


class CareLink(Base):
    __tablename__ = "care_links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # The user who is sharing their data
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    # The caretaker who will receive data
    caretaker_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    relationship_type = Column(String(20), default="caretaker")
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships - use string reference for foreign_keys
    user = relationship("User", foreign_keys="[CareLink.user_id]", backref="care_shared_with")
    caretaker = relationship("User", foreign_keys="[CareLink.caretaker_id]", backref="care_wards")
