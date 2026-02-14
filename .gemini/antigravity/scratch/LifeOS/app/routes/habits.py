from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.database import get_db
from app.models.habit import Habit, HabitLog
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitOut, HabitLogCreate, HabitLogOut
from app.utils.security import get_current_user
import uuid

router = APIRouter()


def calculate_streak(db: Session, habit_id: str) -> int:
    """Calculate consecutive days streak ending today or yesterday."""
    today = date.today()
    streak = 0
    check_date = today

    for _ in range(365):
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.date == check_date,
            HabitLog.completed == True
        ).first()
        if log:
            streak += 1
            check_date -= timedelta(days=1)
        elif check_date == today:
            # Allow today to be incomplete; check yesterday
            check_date -= timedelta(days=1)
            continue
        else:
            break
    return streak


def get_week_completions(db: Session, habit_id: str) -> list:
    """Get completion status for last 7 days (Mon-Sun of current week)."""
    today = date.today()
    # Start from 6 days ago
    days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.date == d,
            HabitLog.completed == True
        ).first()
        days.append(bool(log))
    return days


def enrich_habit(db: Session, habit: Habit) -> dict:
    """Add computed fields to habit."""
    today = date.today()
    today_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.id,
        HabitLog.date == today,
        HabitLog.completed == True
    ).first()

    return {
        "id": habit.id,
        "user_id": habit.user_id,
        "name": habit.name,
        "emoji": habit.emoji or "✅",
        "category": habit.category or "general",
        "target_days": habit.target_days or 7,
        "created_at": habit.created_at,
        "streak": calculate_streak(db, habit.id),
        "completed_today": bool(today_log),
        "week_completions": get_week_completions(db, habit.id),
    }


@router.post("/", response_model=HabitOut)
def create_habit(
    habit: HabitCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_habit = Habit(
        name=habit.name,
        emoji=habit.emoji,
        category=habit.category,
        target_days=habit.target_days,
        user_id=current_user.id
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return enrich_habit(db, new_habit)


@router.get("/", response_model=List[HabitOut])
def get_habits(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    return [enrich_habit(db, h) for h in habits]


@router.delete("/{habit_id}")
def delete_habit(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"detail": "Habit deleted"}


@router.post("/complete", response_model=HabitLogOut)
def complete_habit(
    log: HabitLogCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    habit = db.query(Habit).filter(Habit.id == log.habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == log.habit_id, 
        HabitLog.date == log.date
    ).first()
    
    if existing_log:
        existing_log.completed = log.completed
        db.commit()
        db.refresh(existing_log)
        return existing_log
    
    new_log = HabitLog(habit_id=log.habit_id, date=log.date, completed=log.completed)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
