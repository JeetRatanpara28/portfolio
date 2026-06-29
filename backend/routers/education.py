from fastapi import APIRouter, Depends, HTTPException
from core.security import verify_token
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Education
from schemas.education import EducationCreate, EducationResponse

router = APIRouter(prefix="/api/education", tags=["education"])

@router.get("/", response_model=list[EducationResponse])
def get_education(db: Session = Depends(get_db)):
    return db.query(Education).order_by(Education.sort_order).all()

@router.post("/", response_model=EducationResponse)
def create_education(data: EducationCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    edu = Education(**data.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

@router.put("/{edu_id}", response_model=EducationResponse)
def update_education(edu_id: int, data: EducationCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    for key, value in data.model_dump().items():
        setattr(edu, key, value)
    db.commit()
    db.refresh(edu)
    return edu

@router.delete("/{edu_id}")
def delete_education(edu_id: int, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    db.delete(edu)
    db.commit()
    return {"success": True}