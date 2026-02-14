from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Habit(Base):
    __tablename__ = "habits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    name = Column(String)
    emoji = Column(String(10), default="✅")
    category = Column(String(50), default="general")
    target_days = Column(Integer, default=7)  # days per week target
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")

class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id = Column(String(36), ForeignKey("habits.id"))
    completed = Column(Boolean, default=False)
    date = Column(Date)

    habit = relationship("Habit", back_populates="logs")
