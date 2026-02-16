from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.daily_log import DailyLog
from app.models.user import User
from app.schemas.daily_log import DailyLogCreate, DailyLogOut, DailyLogUpdate
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
        junk_food=log.junk_food,
        weight=log.weight,
        bp_systolic=log.bp_systolic,
        bp_diastolic=log.bp_diastolic,
        blood_sugar=log.blood_sugar,
        heart_rate=log.heart_rate,
        notes=log.notes
    )
    
    # V2: Calculate Life Score
    new_log.life_score = LifeScoreService.calculate_score(new_log)

    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.put("/{log_id}", response_model=DailyLogOut)
def update_daily_log(
    log_id: str,
    log_update: DailyLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(DailyLog).filter(DailyLog.id == log_id, DailyLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Daily log not found")

    for key, value in log_update.dict(exclude_unset=True).items():
        setattr(log, key, value)
    
    # Recalculate Score if needed
    log.life_score = LifeScoreService.calculate_score(log)

    db.commit()
    db.refresh(log)
    return log

@router.get("/", response_model=List[DailyLogOut])
def get_daily_logs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    logs = db.query(DailyLog).filter(DailyLog.user_id == current_user.id).order_by(desc(DailyLog.created_at)).offset(skip).limit(limit).all()
    return logs

@router.get("/by-date/{log_date}", response_model=DailyLogOut)
def get_daily_log_by_date(
    log_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import cast, Date as SQLDate
    target = datetime.strptime(log_date, "%Y-%m-%d").date()
    log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        cast(DailyLog.created_at, SQLDate) == target
    ).order_by(desc(DailyLog.created_at)).first()
    if not log:
        raise HTTPException(status_code=404, detail="No log found for this date")
    return log

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
