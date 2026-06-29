from pydantic import BaseModel
from typing import Optional, List

class ProfileUpdate(BaseModel):
    name:       Optional[str] = None
    location:   Optional[str] = None
    email:      Optional[str] = None
    github:     Optional[str] = None
    linkedin:   Optional[str] = None
    twitter:    Optional[str] = None
    bio:        Optional[str] = None
    status:     Optional[str] = None
    titles:     Optional[List[str]] = None
    resume_url: Optional[str] = None

class ProfileResponse(BaseModel):
    id:         int
    name:       str
    location:   Optional[str]
    email:      Optional[str]
    github:     Optional[str]
    linkedin:   Optional[str]
    twitter:    Optional[str]
    bio:        Optional[str]
    status:     Optional[str]
    titles:     Optional[List[str]]
    resume_url: Optional[str]

    class Config:
        from_attributes = True