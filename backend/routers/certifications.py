from fastapi import APIRouter, Depends, HTTPException
from core.security import verify_token
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Certification
from schemas.certifications import CertificationCreate, CertificationResponse

router = APIRouter(prefix="/api/certifications", tags=["certifications"])

@router.get("/", response_model=list[CertificationResponse])
def get_certifications(db: Session = Depends(get_db)):
    return db.query(Certification).order_by(Certification.sort_order).all()

@router.post("/", response_model=CertificationResponse)
def create_certification(data: CertificationCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    cert = Certification(**data.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.put("/{cert_id}", response_model=CertificationResponse)
def update_certification(cert_id: int, data: CertificationCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    for key, value in data.model_dump().items():
        setattr(cert, key, value)
    db.commit()
    db.refresh(cert)
    return cert

@router.delete("/{cert_id}")
def delete_certification(cert_id: int, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return {"success": True}