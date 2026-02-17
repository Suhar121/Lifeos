"""
Routes for uploading, viewing, deleting, and sharing medical reports.
"""
import os
import uuid
import shutil
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.v2_models import MedicalReport
from app.models.user import User
from app.models.care import CareLink
from app.utils.security import get_current_user
from app.services.whatsapp_service import send_whatsapp_message

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "medical_reports")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "image",
    "image/png": "image",
    "image/webp": "image",
    "image/heic": "image",
    "image/heif": "image",
}


# --- Schemas ---

class ReportOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    file_name: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    report_date: Optional[date] = None
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Routes ---

@router.post("/", response_model=ReportOut)
async def upload_report(
    title: str = Form(...),
    description: str = Form(None),
    report_date: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a medical report (PDF or image, max 10MB)."""
    # Validate file type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only PDF and image files (JPEG, PNG, WebP) are allowed")

    # Read file and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "File size must be under 10 MB")

    # Save file
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    saved_name = f"{uuid.uuid4()}.{ext}"
    saved_path = os.path.join(UPLOAD_DIR, saved_name)
    with open(saved_path, "wb") as f:
        f.write(contents)

    # Parse report_date
    parsed_date = None
    if report_date:
        try:
            parsed_date = datetime.strptime(report_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    report = MedicalReport(
        user_id=current_user.id,
        title=title,
        description=description,
        file_name=file.filename,
        file_path=saved_name,
        file_type=ALLOWED_TYPES.get(content_type, "other"),
        file_size=len(contents),
        report_date=parsed_date,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/", response_model=List[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all medical reports for the current user."""
    return (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == current_user.id)
        .order_by(MedicalReport.created_at.desc())
        .all()
    )


@router.get("/file/{report_id}")
def get_report_file(
    report_id: str,
    token: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download / view a report file."""
    report = (
        db.query(MedicalReport)
        .filter(MedicalReport.id == report_id, MedicalReport.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(404, "Report not found")

    file_path = os.path.join(UPLOAD_DIR, report.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(404, "File not found on disk")

    return FileResponse(file_path, filename=report.file_name)


@router.delete("/{report_id}")
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a medical report."""
    report = (
        db.query(MedicalReport)
        .filter(MedicalReport.id == report_id, MedicalReport.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(404, "Report not found")

    # Delete file from disk
    file_path = os.path.join(UPLOAD_DIR, report.file_path)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(report)
    db.commit()
    return {"detail": "Report deleted"}


@router.post("/{report_id}/send")
def send_report(
    report_id: str,
    phone: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Send a medical report link/notification via WhatsApp.
    If phone is not provided, sends to all active caretakers.
    """
    report = (
        db.query(MedicalReport)
        .filter(MedicalReport.id == report_id, MedicalReport.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(404, "Report not found")

    # Build the message
    date_str = report.report_date.strftime("%d %b %Y") if report.report_date else "N/A"
    size_kb = round(report.file_size / 1024, 1) if report.file_size else "?"

    message = (
        f"📋 *Medical Report Shared*\n\n"
        f"*{report.title}*\n"
        f"📅 Date: {date_str}\n"
        f"📎 File: {report.file_name} ({size_kb} KB)\n"
    )
    if report.description:
        message += f"📝 Note: {report.description}\n"
    message += (
        f"\nShared by {current_user.name or 'LifeBuddy User'}\n"
        f"— LifeBuddy Care"
    )

    sent_to = []

    if phone:
        # Send to specific number
        success = send_whatsapp_message(phone, message)
        if success:
            sent_to.append(phone)
    else:
        # Send to all active caretakers
        care_links = (
            db.query(CareLink)
            .filter(CareLink.user_id == current_user.id, CareLink.status == "active")
            .all()
        )
        for link in care_links:
            caretaker = db.query(User).filter(User.id == link.caretaker_id).first()
            if caretaker and caretaker.phone:
                success = send_whatsapp_message(caretaker.phone, message)
                if success:
                    sent_to.append(caretaker.phone)

    if not sent_to:
        raise HTTPException(400, "No recipients could be reached. Make sure caretakers have phone numbers or provide a phone number.")

    return {"detail": f"Report shared via WhatsApp to {len(sent_to)} recipient(s)", "sent_to": sent_to}
