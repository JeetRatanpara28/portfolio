from fastapi import APIRouter, Depends, HTTPException
from core.security import verify_token
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Skill, SkillGroup
from schemas.skills import (
    SkillCreate, SkillResponse,
    SkillGroupCreate, SkillGroupResponse
)

router = APIRouter(prefix="/api/skills", tags=["skills"])

@router.get("/", response_model=list[SkillGroupResponse])
def get_skills(db: Session = Depends(get_db)):
    groups = db.query(SkillGroup).order_by(SkillGroup.sort_order).all()
    for group in groups:
        group.skills = db.query(Skill).filter(
            Skill.group_id == group.id
        ).order_by(Skill.sort_order).all()
    return groups

@router.post("/groups", response_model=SkillGroupResponse)
def create_group(data: SkillGroupCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    group = SkillGroup(**data.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group

@router.post("/", response_model=SkillResponse)
def create_skill(data: SkillCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    skill = Skill(**data.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: int, data: SkillCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    for key, value in data.model_dump().items():
        setattr(skill, key, value)
    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"success": True}

@router.put("/groups/{group_id}", response_model=SkillGroupResponse)
def update_group(group_id: int, data: SkillGroupCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    group = db.query(SkillGroup).filter(SkillGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    for key, value in data.model_dump().items():
        setattr(group, key, value)
    db.commit()
    db.refresh(group)
    return group

@router.delete("/groups/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    group = db.query(SkillGroup).filter(SkillGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(group)
    db.commit()
    return {"success": True}