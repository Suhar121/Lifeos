from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.daily_log import DailyLog
from app.models.user import User
from app.schemas.daily_log import DailyLogCreate, DailyLogOut
from app.utils.security import get_current_user
from app.services.life_score_service import LifeScoreService
import uuid

router = APIRouter()

@router.post("/", response_model=DailyLogOut)
def create_daily_log(
    log: DailyLogCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Check if log already exists for today? Maybe optional.
    # For now, allow multiple logs or assume frontend handles daily limit.
    new_log = DailyLog(
        user_id=current_user.id,
        mood=log.mood,
        energy=log.energy,
        focus=log.focus,
        sleep_hours=log.sleep_hours,
        productivity=log.productivity,
        workout=log.workout,
        notes=log.notes
    )
    
    # V2: Calculate Life Score
    new_log.life_score = LifeScoreService.calculate_score(new_log)

    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/", response_model=List[DailyLogOut])
def get_daily_logs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    logs = db.query(DailyLog).filter(DailyLog.user_id == current_user.id).order_by(desc(DailyLog.created_at)).offset(skip).limit(limit).all()
    return logs

@router.get("/last-7-days", response_model=List[DailyLogOut])
def get_last_7_days_logs(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.created_at >= seven_days_ago
    ).order_by(DailyLog.created_at).all()
    return logs
