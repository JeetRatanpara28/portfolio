from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Profile
from schemas.profile import ProfileUpdate, ProfileResponse
from core.security import verify_token

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/", response_model=ProfileResponse)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile(**data.model_dump(exclude_none=True))
        db.add(profile)
    else:
        for key, value in data.model_dump(exclude_none=True).items():
            setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile