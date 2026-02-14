from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.daily_log import DailyLog
from app.models.user import User
from app.utils.security import get_current_user
from datetime import date, timedelta
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class LifeScoreResponse(BaseModel):
    date: date
    score: int

class WeeklyLifeScoreResponse(BaseModel):
    average_score: int
    daily_scores: List[LifeScoreResponse]

@router.get("/weekly", response_model=WeeklyLifeScoreResponse)
def get_weekly_life_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=6)

    logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.created_at >= start_date
    ).all()

    daily_scores = []
    total_score = 0
    count = 0

    # Map logs by date for easier lookup
    logs_by_date = {log.created_at.date(): log for log in logs}

    # Iterate last 7 days
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        log = logs_by_date.get(current_date)
        
        if log and log.life_score is not None:
            score = log.life_score
            daily_scores.append(LifeScoreResponse(date=current_date, score=score))
            total_score += score
            count += 1
        else:
            daily_scores.append(LifeScoreResponse(date=current_date, score=0))

    avg_score = int(total_score / count) if count > 0 else 0

    return WeeklyLifeScoreResponse(
        average_score=avg_score,
        daily_scores=daily_scores
    )
