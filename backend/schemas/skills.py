from pydantic import BaseModel
from typing import Optional, List

class SkillGroupCreate(BaseModel):
    name:       str
    color:      Optional[str] = "#64DCFF"
    sort_order: Optional[int] = 0

class SkillGroupResponse(BaseModel):
    id:         int
    name:       str
    color:      str
    sort_order: int
    skills:     Optional[List["SkillResponse"]] = []

    class Config:
        from_attributes = True

class SkillCreate(BaseModel):
    group_id:   int
    name:       str
    level:      int
    sort_order: Optional[int] = 0

class SkillResponse(BaseModel):
    id:         int
    group_id:   int
    name:       str
    level:      int
    sort_order: int

    class Config:
        from_attributes = True

SkillGroupResponse.model_rebuild()