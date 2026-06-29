from pydantic import BaseModel
from typing import Optional

class EducationCreate(BaseModel):
    degree:         str
    institution:    str
    field_of_study: Optional[str] = None
    location:       Optional[str] = None
    start_date:     Optional[str] = None
    end_date:       Optional[str] = None
    grade:          Optional[str] = None
    current:        Optional[bool] = False
    sort_order:     Optional[int] = 0

class EducationResponse(BaseModel):
    id:             int
    degree:         str
    institution:    str
    field_of_study: Optional[str]
    location:       Optional[str]
    start_date:     Optional[str]
    end_date:       Optional[str]
    grade:          Optional[str]
    current:        bool
    sort_order:     int

    class Config:
        from_attributes = True
