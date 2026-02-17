from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import ProfileOut, ProfileUpdate
from app.utils.security import get_current_user
import os
import uuid
import shutil

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "profile_photos")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return current_user


@router.put("/", response_model=ProfileOut)
def update_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's profile / demographics."""
    update_data = profile.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/photo", response_model=ProfileOut)
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a profile photo."""
    # Validate file type
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")

    # Limit size (5 MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    # Delete old photo if exists
    if current_user.profile_photo_url:
        old_file = current_user.profile_photo_url.replace("/profile/photo/", "")
        old_path = os.path.join(UPLOAD_DIR, old_file)
        if os.path.exists(old_path):
            os.remove(old_path)

    current_user.profile_photo_url = f"/profile/photo/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/photo/{filename}")
def get_profile_photo(filename: str):
    """Serve a profile photo."""
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Photo not found")

    from fastapi.responses import FileResponse
    return FileResponse(filepath)


@router.delete("/photo", response_model=ProfileOut)
def delete_profile_photo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete the current user's profile photo."""
    if current_user.profile_photo_url:
        filename = current_user.profile_photo_url.replace("/profile/photo/", "")
        filepath = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
        current_user.profile_photo_url = None
        db.commit()
        db.refresh(current_user)
    return current_user


@router.put("/password")
def change_password(
    old_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change the current user's password."""
    from app.utils.security import verify_password, get_password_hash

    if not verify_password(old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    return {"message": "Password changed successfully"}
