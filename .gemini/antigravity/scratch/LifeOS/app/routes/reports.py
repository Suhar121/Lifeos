from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.daily_log import DailyLog
from app.models.v2_models import WeeklyReport
from app.models.user import User
from app.utils.security import get_current_user
from app.services.ai_service import AIService
from datetime import date, timedelta, datetime
from typing import Dict
from pydantic import BaseModel
import json

router = APIRouter()

class WeeklyReportOut(BaseModel):
    id: str
    week_start: date
    report_data: Dict
    created_at: datetime

    model_config = {"from_attributes": True}

@router.post("/weekly-report", response_model=WeeklyReportOut)
def generate_weekly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=6)

    logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.created_at >= start_date
    ).all()

    report_content = AIService.generate_weekly_report(logs)
    
    new_report = WeeklyReport(
        user_id=current_user.id,
        week_start=start_date,
        report_text=json.dumps(report_content)
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return WeeklyReportOut(
        id=new_report.id,
        week_start=new_report.week_start,
        report_data=report_content,
        created_at=new_report.created_at
    )

@router.get("/weekly-report", response_model=WeeklyReportOut)
def get_latest_weekly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(WeeklyReport).filter(
        WeeklyReport.user_id == current_user.id
    ).order_by(WeeklyReport.created_at.desc()).first()

    if not report:
        raise HTTPException(status_code=404, detail="No weekly report found")

    return WeeklyReportOut(
        id=report.id,
        week_start=report.week_start,
        report_data=json.loads(report.report_text),
        created_at=report.created_at
    )
