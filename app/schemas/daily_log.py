from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DailyLogBase(BaseModel):
    mood: str
    energy: int
    focus: int
    sleep_hours: float
    productivity: int
    workout: bool
    junk_food: Optional[bool] = False
    weight: Optional[float] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    blood_sugar: Optional[int] = None
    heart_rate: Optional[int] = None
    notes: Optional[str] = None

class DailyLogUpdate(BaseModel):
    mood: Optional[str] = None
    energy: Optional[int] = None
    focus: Optional[int] = None
    sleep_hours: Optional[float] = None
    productivity: Optional[int] = None
    workout: Optional[bool] = None
    junk_food: Optional[bool] = None
    weight: Optional[float] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    blood_sugar: Optional[int] = None
    heart_rate: Optional[int] = None
    notes: Optional[str] = None

class DailyLogCreate(DailyLogBase):
    pass

class DailyLogOut(DailyLogBase):
    id: str
    user_id: str
    life_score: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
