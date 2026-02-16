from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
import enum

class MoodEnum(str, enum.Enum):
    happy = "happy"
    neutral = "neutral"
    sad = "sad"
    anxious = "anxious"
    calm = "calm"

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    mood = Column(String)
    energy = Column(Integer)
    focus = Column(Integer)
    sleep_hours = Column(Float)
    productivity = Column(Integer)
    workout = Column(Boolean, default=False)
    junk_food = Column(Boolean, default=False)
    weight = Column(Float, nullable=True)
    bp_systolic = Column(Integer, nullable=True)
    bp_diastolic = Column(Integer, nullable=True)
    blood_sugar = Column(Integer, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    life_score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="daily_logs")
