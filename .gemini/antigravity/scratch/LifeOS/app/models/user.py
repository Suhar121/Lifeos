from sqlalchemy import Column, Integer, String, DateTime, Date, Float, Text
from sqlalchemy.sql import func
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    streak_count = Column(Integer, default=0)

    # Profile / Demographics
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)          # Male, Female, Other, Prefer not to say
    blood_group = Column(String(5), nullable=True)      # A+, A-, B+, B-, O+, O-, AB+, AB-
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    pin_code = Column(String(10), nullable=True)
    emergency_contact_name = Column(String(200), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    emergency_contact_relation = Column(String(50), nullable=True)
    medical_conditions = Column(Text, nullable=True)    # Comma-separated or free text
    allergies = Column(Text, nullable=True)
    profile_photo_url = Column(String(500), nullable=True)
