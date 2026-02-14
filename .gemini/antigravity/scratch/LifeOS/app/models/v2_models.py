from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, Time, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class EventType(str, enum.Enum):
    appointment = "appointment"
    personal = "personal"
    reminder = "reminder"

class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text, nullable=True)
    event_type = Column(String)
    event_date = Column(Date)
    event_time = Column(String(10), nullable=True)
    color = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="events")

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    name = Column(String)
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    reminder_time = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="medicines")

class MedicineLog(Base):
    __tablename__ = "medicine_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medicine_id = Column(String(36), ForeignKey("medicines.id"))
    taken = Column(Boolean, default=False)
    date = Column(Date)

    medicine = relationship("Medicine", backref="logs")

class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    week_start = Column(Date)
    report_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="weekly_reports")
