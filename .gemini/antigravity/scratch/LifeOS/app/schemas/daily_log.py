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
    notes: Optional[str] = None

class DailyLogCreate(DailyLogBase):
    pass

class DailyLogOut(DailyLogBase):
    id: str
    user_id: str
    life_score: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
