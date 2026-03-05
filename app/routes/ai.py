from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.daily_log import DailyLog
from app.services.ai_service import AIService
from app.utils.security import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/analyze")
def analyze_performance(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.created_at >= seven_days_ago
    ).all()
    
    analysis = AIService.analyze_performance(logs)
    return analysis
