from fastapi import APIRouter, Depends, HTTPException
from core.security import verify_token
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Project
from schemas.projects import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("/", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.sort_order).all()

@router.post("/", response_model=ProjectResponse)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, data: ProjectCreate, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in data.model_dump().items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"success": True}