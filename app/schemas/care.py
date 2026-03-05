from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CareLinkCreate(BaseModel):
    caretaker_email: EmailStr
    relationship: str = "caretaker"


class CareLinkOut(BaseModel):
    id: str
    user_id: str
    caretaker_id: str
    relationship: str
    status: str
    created_at: datetime
    # Populated names for display
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    caretaker_name: Optional[str] = None
    caretaker_email: Optional[str] = None

    model_config = {"from_attributes": True}


class CareLinkRespond(BaseModel):
    status: str  # "active" or "declined"


class WardMedicineSummary(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    reminder_time: Optional[str] = None
    taken: bool = False


class WardDaySummary(BaseModel):
    date: str
    mood: Optional[str] = None
    energy: Optional[int] = None
    sleep_hours: Optional[float] = None
    workout: Optional[bool] = None
    junk_food: Optional[bool] = None
    weight: Optional[float] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    blood_sugar: Optional[int] = None
    heart_rate: Optional[int] = None
    life_score: Optional[int] = None
    medicines: list[WardMedicineSummary] = []
    events: list[dict] = []
