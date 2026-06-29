import os
import bcrypt
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.security import create_token, verify_token
from core.limiter import limiter
from db.database import get_db
from db.models import AdminUser

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == data.username).first()

    # Always run bcrypt to prevent timing-based username enumeration
    dummy_hash = "$2b$12$0000000000000000000000000000000000000000000000000000000000"
    stored_hash = user.password_hash if user else dummy_hash
    valid = verify_password(data.password, stored_hash)

    if not user or not valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"access_token": create_token(data.username), "token_type": "bearer"}


@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token),
):
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user:
        raise HTTPException(400, "Admin user not found in DB")
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(401, "Current password is incorrect")
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"status": "password updated"}
