from fastapi import APIRouter, Depends, HTTPException
from core.security import verify_token
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Experience
from schemas.experience import ExperienceCreate, ExperienceResponse

router = APIRouter(prefix="/api/experience", tags=["experience"])

@router.get("/", response_model=list[ExperienceResponse])
def get_experience(db: Session = Depends(get_db)):
    return db.query(Experience).order_by(Experience.sort_order).all()

@router.post("/", response_model=ExperienceResponse)
def create_experience(data: ExperienceCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    exp = Experience(**data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.put("/{exp_id}", response_model=ExperienceResponse)
def update_experience(exp_id: int, data: ExperienceCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    for key, value in data.model_dump().items():
        setattr(exp, key, value)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"success": True}