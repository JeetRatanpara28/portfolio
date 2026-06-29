from pydantic import BaseModel
from typing import Optional, List

class ProjectCreate(BaseModel):
    title:       str
    description: Optional[str] = None
    tech:        Optional[List[str]] = []
    github_url:  Optional[str] = None
    live_url:    Optional[str] = None
    accent:      Optional[str] = "#64DCFF"
    label:       Optional[str] = None
    featured:    Optional[bool] = False
    sort_order:  Optional[int] = 0

class ProjectResponse(BaseModel):
    id:          int
    title:       str
    description: Optional[str]
    tech:        Optional[List[str]]
    github_url:  Optional[str]
    live_url:    Optional[str]
    accent:      Optional[str]
    label:       Optional[str]
    featured:    bool
    sort_order:  int

    class Config:
        from_attributes = True