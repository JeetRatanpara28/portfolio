from pydantic import BaseModel
from typing import Optional

class CertificationCreate(BaseModel):
    name:           str
    issuer:         Optional[str] = None
    issued_date:    Optional[str] = None
    expiry_date:    Optional[str] = None
    credential_id:  Optional[str] = None
    credential_url: Optional[str] = None
    pdf_url:        Optional[str] = None
    sort_order:     Optional[int] = 0

class CertificationResponse(BaseModel):
    id:             int
    name:           str
    issuer:         Optional[str]
    issued_date:    Optional[str]
    expiry_date:    Optional[str]
    credential_id:  Optional[str]
    credential_url: Optional[str]
    pdf_url:        Optional[str]
    sort_order:     int

    class Config:
        from_attributes = True
