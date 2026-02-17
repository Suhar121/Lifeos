from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import cast, Date, or_, and_
from app.database import get_db
from app.models.user import User
from app.models.care import CareLink
from app.models.daily_log import DailyLog
from app.models.v2_models import Event, Medicine, MedicineLog
from app.utils.security import get_current_user
from app.schemas.care import (
    CareLinkCreate, CareLinkOut, CareLinkRespond,
    WardDaySummary, WardMedicineSummary
)
from typing import List
from datetime import date, datetime

router = APIRouter()


# --- Share my data with a caretaker ---
@router.post("/link", response_model=CareLinkOut)
def create_care_link(
    link: CareLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Can't link to yourself
    if link.caretaker_email == current_user.email:
        raise HTTPException(status_code=400, detail="You cannot add yourself as a caretaker")

    # Find caretaker user
    caretaker = db.query(User).filter(User.email == link.caretaker_email).first()
    if not caretaker:
        raise HTTPException(status_code=404, detail="No LifeOS user found with that email")

    # Check if link already exists
    existing = db.query(CareLink).filter(
        CareLink.user_id == current_user.id,
        CareLink.caretaker_id == caretaker.id,
        CareLink.status.in_(["pending", "active"])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A care link with this user already exists")

    care_link = CareLink(
        user_id=current_user.id,
        caretaker_id=caretaker.id,
        relationship_type=link.relationship,
        status="pending"
    )
    db.add(care_link)
    db.commit()
    db.refresh(care_link)

    return CareLinkOut(
        id=care_link.id,
        user_id=care_link.user_id,
        caretaker_id=care_link.caretaker_id,
        relationship=care_link.relationship_type,
        status=care_link.status,
        created_at=care_link.created_at,
        user_name=current_user.name,
        user_email=current_user.email,
        caretaker_name=caretaker.name,
        caretaker_email=caretaker.email
    )


# --- Get people I'm sharing my data with ---
@router.get("/my-links", response_model=List[CareLinkOut])
def get_my_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    links = db.query(CareLink).filter(
        CareLink.user_id == current_user.id,
        CareLink.status.in_(["pending", "active"])
    ).all()

    result = []
    for link in links:
        caretaker = db.query(User).filter(User.id == link.caretaker_id).first()
        result.append(CareLinkOut(
            id=link.id,
            user_id=link.user_id,
            caretaker_id=link.caretaker_id,
            relationship=link.relationship_type,
            status=link.status,
            created_at=link.created_at,
            user_name=current_user.name,
            user_email=current_user.email,
            caretaker_name=caretaker.name if caretaker else "Unknown",
            caretaker_email=caretaker.email if caretaker else ""
        ))
    return result


# --- Get people who are sharing data with me (I'm their caretaker) ---
@router.get("/wards", response_model=List[CareLinkOut])
def get_my_wards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    links = db.query(CareLink).filter(
        CareLink.caretaker_id == current_user.id
    ).all()

    result = []
    for link in links:
        user = db.query(User).filter(User.id == link.user_id).first()
        result.append(CareLinkOut(
            id=link.id,
            user_id=link.user_id,
            caretaker_id=link.caretaker_id,
            relationship=link.relationship_type,
            status=link.status,
            created_at=link.created_at,
            user_name=user.name if user else "Unknown",
            user_email=user.email if user else "",
            caretaker_name=current_user.name,
            caretaker_email=current_user.email
        ))
    return result


# --- Respond to a care link request (accept / decline) ---
@router.put("/respond/{link_id}", response_model=CareLinkOut)
def respond_to_care_link(
    link_id: str,
    response: CareLinkRespond,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    link = db.query(CareLink).filter(
        CareLink.id == link_id,
        CareLink.caretaker_id == current_user.id,
        CareLink.status == "pending"
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Care link request not found")

    if response.status not in ["active", "declined"]:
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'declined'")

    link.status = response.status
    db.commit()
    db.refresh(link)

    user = db.query(User).filter(User.id == link.user_id).first()
    return CareLinkOut(
        id=link.id,
        user_id=link.user_id,
        caretaker_id=link.caretaker_id,
        relationship=link.relationship_type,
        status=link.status,
        created_at=link.created_at,
        user_name=user.name if user else "Unknown",
        user_email=user.email if user else "",
        caretaker_name=current_user.name,
        caretaker_email=current_user.email
    )


# --- Remove / revoke a care link ---
@router.delete("/link/{link_id}")
def delete_care_link(
    link_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    link = db.query(CareLink).filter(
        CareLink.id == link_id,
        or_(
            CareLink.user_id == current_user.id,
            CareLink.caretaker_id == current_user.id
        )
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Care link not found")

    link.status = "revoked"
    db.commit()
    return {"message": "Care link removed"}


# --- Get a ward's daily summary (for caretakers) ---
@router.get("/ward/{ward_user_id}/summary", response_model=WardDaySummary)
def get_ward_summary(
    ward_user_id: str,
    log_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify the caretaker has an active link to this user
    link = db.query(CareLink).filter(
        CareLink.user_id == ward_user_id,
        CareLink.caretaker_id == current_user.id,
        CareLink.status == "active"
    ).first()
    if not link:
        raise HTTPException(status_code=403, detail="You don't have an active care link with this user")

    target_date = log_date or date.today()

    # Get daily log
    daily_log = db.query(DailyLog).filter(
        DailyLog.user_id == ward_user_id,
        cast(DailyLog.created_at, Date) == target_date
    ).first()

    # Get medicines and their logs for the date
    medicines = db.query(Medicine).filter(Medicine.user_id == ward_user_id).all()
    med_summaries = []
    for med in medicines:
        log = db.query(MedicineLog).filter(
            MedicineLog.medicine_id == med.id,
            MedicineLog.date == target_date
        ).first()
        med_summaries.append(WardMedicineSummary(
            medicine_name=med.name,
            dosage=med.dosage,
            reminder_time=med.reminder_time,
            taken=log.taken if log else False
        ))

    # Get events for the date
    events = db.query(Event).filter(
        Event.user_id == ward_user_id,
        Event.event_date == target_date
    ).all()
    event_list = [
        {"title": e.title, "type": e.event_type, "time": e.event_time, "color": e.color}
        for e in events
    ]

    return WardDaySummary(
        date=str(target_date),
        mood=daily_log.mood if daily_log else None,
        energy=daily_log.energy if daily_log else None,
        sleep_hours=daily_log.sleep_hours if daily_log else None,
        workout=daily_log.workout if daily_log else None,
        junk_food=daily_log.junk_food if daily_log else None,
        weight=daily_log.weight if daily_log else None,
        bp_systolic=daily_log.bp_systolic if daily_log else None,
        bp_diastolic=daily_log.bp_diastolic if daily_log else None,
        blood_sugar=daily_log.blood_sugar if daily_log else None,
        heart_rate=daily_log.heart_rate if daily_log else None,
        life_score=daily_log.life_score if daily_log else None,
        medicines=med_summaries,
        events=event_list
    )


# --- Get ward's history (last 7 days summary for caretaker) ---
@router.get("/ward/{ward_user_id}/history")
def get_ward_history(
    ward_user_id: str,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify active care link
    link = db.query(CareLink).filter(
        CareLink.user_id == ward_user_id,
        CareLink.caretaker_id == current_user.id,
        CareLink.status == "active"
    ).first()
    if not link:
        raise HTTPException(status_code=403, detail="You don't have an active care link with this user")

    from datetime import timedelta
    today = date.today()
    start_date = today - timedelta(days=days - 1)

    # Get daily logs in range
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == ward_user_id,
        cast(DailyLog.created_at, Date) >= start_date,
        cast(DailyLog.created_at, Date) <= today
    ).all()

    # Get all medicines for the user
    medicines = db.query(Medicine).filter(Medicine.user_id == ward_user_id).all()

    history = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        log = next(
            (l for l in logs if l.created_at and l.created_at.date() == d),
            None
        )

        med_status = []
        for med in medicines:
            med_log = db.query(MedicineLog).filter(
                MedicineLog.medicine_id == med.id,
                MedicineLog.date == d
            ).first()
            med_status.append({
                "name": med.name,
                "taken": med_log.taken if med_log else False
            })

        history.append({
            "date": str(d),
            "has_log": log is not None,
            "mood": log.mood if log else None,
            "life_score": log.life_score if log else None,
            "workout": log.workout if log else None,
            "junk_food": log.junk_food if log else None,
            "medicines": med_status
        })

    ward_user = db.query(User).filter(User.id == ward_user_id).first()
    return {
        "ward_name": ward_user.name if ward_user else "Unknown",
        "ward_email": ward_user.email if ward_user else "",
        "days": history
    }
