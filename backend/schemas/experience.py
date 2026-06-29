from pydantic import BaseModel
from typing import Optional

class ExperienceCreate(BaseModel):
    company:     str
    role:        str
    start_date:  Optional[str] = None
    end_date:    Optional[str] = None
    current:     Optional[bool] = False
    location:    Optional[str] = None
    description: Optional[str] = None
    sort_order:  Optional[int] = 0

class ExperienceResponse(BaseModel):
    id:          int
    company:     str
    role:        str
    start_date:  Optional[str]
    end_date:    Optional[str]
    current:     bool
    location:    Optional[str]
    description: Optional[str]
    sort_order:  int

    class Config:
        from_attributes = True