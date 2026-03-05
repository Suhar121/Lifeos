from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

class HabitBase(BaseModel):
    name: str
    emoji: str = "✅"
    category: str = "general"
    target_days: int = 7

class HabitCreate(HabitBase):
    pass

class HabitOut(HabitBase):
    id: str
    user_id: str
    created_at: datetime
    streak: int = 0
    completed_today: bool = False
    week_completions: List[bool] = []

    model_config = {"from_attributes": True}

class HabitLogCreate(BaseModel):
    habit_id: str
    date: date
    completed: bool

class HabitLogOut(HabitLogCreate):
    id: str

    model_config = {"from_attributes": True}
