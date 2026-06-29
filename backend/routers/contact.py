import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, field_validator

from core.limiter import limiter

router = APIRouter(prefix="/api/contact", tags=["contact"])


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str

    @field_validator("name")
    @classmethod
    def name_length(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        if len(v) > 100:
            raise ValueError("Name too long")
        return v

    @field_validator("message")
    @classmethod
    def message_length(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message is required")
        if len(v) > 5000:
            raise ValueError("Message too long (max 5000 characters)")
        return v


@router.post("/")
@limiter.limit("3/hour")
async def send_contact(request: Request, data: ContactMessage):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_to   = os.getenv("SMTP_TO", smtp_user)

    print(f"[contact] {data.name} <{data.email}>: {data.message[:80]}")

    if smtp_host and smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Portfolio contact from {data.name}"
            msg["From"]    = smtp_user
            msg["To"]      = smtp_to
            msg["Reply-To"] = data.email

            body = (
                f"Name: {data.name}\n"
                f"Email: {data.email}\n\n"
                f"Message:\n{data.message}"
            )
            msg.attach(MIMEText(body, "plain"))

            # Use STARTTLS (port 587) by default — works with Gmail, Outlook, etc.
            # Set SMTP_PORT=465 and SMTP_SSL=true in .env for SSL-only servers.
            use_ssl = os.getenv("SMTP_SSL", "false").lower() == "true"

            await aiosmtplib.send(
                msg,
                hostname=smtp_host,
                port=smtp_port,
                username=smtp_user,
                password=smtp_pass,
                use_tls=use_ssl,
                start_tls=not use_ssl,
            )
        except Exception as e:
            print(f"[contact] email send failed: {e}")
            # Don't leak SMTP errors to the client
            raise HTTPException(500, "Failed to send message — please email me directly")

    return {"success": True}
