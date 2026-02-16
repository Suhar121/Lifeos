from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.v2_models import Event, EventType, Medicine, MedicineLog
from app.models.user import User
from app.utils.security import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, time, datetime

router = APIRouter()

# --- Pydantic Schemas ---

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: EventType
    event_date: date
    event_time: Optional[str] = None
    color: Optional[str] = None

class EventOut(EventCreate):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}

class MedicineCreate(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    reminder_time: Optional[str] = None

class MedicineOut(BaseModel):
    id: str
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    reminder_time: Optional[str] = None
    created_at: datetime
    taken_today: bool = False

    model_config = {"from_attributes": True}

class MedicineLogCreate(BaseModel):
    medicine_id: str
    taken: bool
    date: date

class MedicineLogOut(MedicineLogCreate):
    id: str

    model_config = {"from_attributes": True}

# --- Event Routes ---

@router.post("/events", response_model=EventOut)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_event = Event(
        user_id=current_user.id,
        title=event.title,
        description=event.description,
        event_type=event.event_type,
        event_date=event.event_date,
        event_time=event.event_time,
        color=event.color,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/events", response_model=List[EventOut])
def get_events(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Event).filter(Event.user_id == current_user.id)
    if start_date:
        query = query.filter(Event.event_date >= start_date)
    if end_date:
        query = query.filter(Event.event_date <= end_date)
    return query.order_by(Event.event_date).all()

@router.delete("/events/{event_id}")
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"detail": "Event deleted"}

@router.put("/events/{event_id}", response_model=EventOut)
def update_event(
    event_id: str,
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.title = event_data.title
    event.description = event_data.description
    event.event_type = event_data.event_type
    event.event_date = event_data.event_date
    event.event_time = event_data.event_time
    event.color = event_data.color
    db.commit()
    db.refresh(event)
    return event

# --- Medicine Routes ---

@router.post("/medicines", response_model=MedicineOut)
def create_medicine(
    medicine: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_medicine = Medicine(
        user_id=current_user.id,
        name=medicine.name,
        dosage=medicine.dosage,
        frequency=medicine.frequency,
        reminder_time=medicine.reminder_time
    )
    db.add(new_medicine)
    db.commit()
    db.refresh(new_medicine)
    # Check if taken today
    today = date.today()
    taken_log = db.query(MedicineLog).filter(
        MedicineLog.medicine_id == new_medicine.id,
        MedicineLog.date == today,
        MedicineLog.taken == True
    ).first()
    return {
        "id": new_medicine.id,
        "name": new_medicine.name,
        "dosage": new_medicine.dosage,
        "frequency": new_medicine.frequency,
        "reminder_time": new_medicine.reminder_time,
        "created_at": new_medicine.created_at,
        "taken_today": bool(taken_log)
    }

@router.get("/medicines", response_model=List[MedicineOut])
def get_medicines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meds = db.query(Medicine).filter(Medicine.user_id == current_user.id).all()
    today = date.today()
    result = []
    for m in meds:
        taken_log = db.query(MedicineLog).filter(
            MedicineLog.medicine_id == m.id,
            MedicineLog.date == today,
            MedicineLog.taken == True
        ).first()
        result.append({
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "frequency": m.frequency,
            "reminder_time": m.reminder_time,
            "created_at": m.created_at,
            "taken_today": bool(taken_log)
        })
    return result

@router.delete("/medicines/{med_id}")
def delete_medicine(
    med_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    med = db.query(Medicine).filter(Medicine.id == med_id, Medicine.user_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    # Delete logs first
    db.query(MedicineLog).filter(MedicineLog.medicine_id == med_id).delete()
    db.delete(med)
    db.commit()
    return {"detail": "Medicine deleted"}

@router.put("/medicines/{med_id}", response_model=MedicineOut)
def update_medicine(
    med_id: str,
    med_data: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    med = db.query(Medicine).filter(Medicine.id == med_id, Medicine.user_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    med.name = med_data.name
    med.dosage = med_data.dosage
    med.frequency = med_data.frequency
    med.reminder_time = med_data.reminder_time
    db.commit()
    db.refresh(med)
    today = date.today()
    taken_log = db.query(MedicineLog).filter(
        MedicineLog.medicine_id == med.id,
        MedicineLog.date == today,
        MedicineLog.taken == True
    ).first()
    return {
        "id": med.id,
        "name": med.name,
        "dosage": med.dosage,
        "frequency": med.frequency,
        "reminder_time": med.reminder_time,
        "created_at": med.created_at,
        "taken_today": bool(taken_log)
    }

@router.get("/medicines/logs-by-date/{log_date}")
def get_medicine_logs_by_date(
    log_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target = datetime.strptime(log_date, "%Y-%m-%d").date()
    user_meds = db.query(Medicine).filter(Medicine.user_id == current_user.id).all()
    result = []
    for med in user_meds:
        log = db.query(MedicineLog).filter(
            MedicineLog.medicine_id == med.id,
            MedicineLog.date == target,
            MedicineLog.taken == True
        ).first()
        result.append({
            "id": med.id,
            "name": med.name,
            "dosage": med.dosage,
            "taken": bool(log)
        })
    return result

@router.post("/medicines/log", response_model=MedicineLogOut)
def log_medicine(
    log: MedicineLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    medicine = db.query(Medicine).filter(Medicine.id == log.medicine_id, Medicine.user_id == current_user.id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    # Upsert: check if log exists for this date
    existing = db.query(MedicineLog).filter(
        MedicineLog.medicine_id == log.medicine_id,
        MedicineLog.date == log.date
    ).first()

    if existing:
        existing.taken = log.taken
        db.commit()
        db.refresh(existing)
        return existing

    new_log = MedicineLog(
        medicine_id=log.medicine_id,
        taken=log.taken,
        date=log.date
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
