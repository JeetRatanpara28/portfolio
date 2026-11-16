"""Passkey (Touch ID / Face ID) endpoints.

Flow:
  * Add a device (once per device): needs ADMIN_KEY, then the device's biometric check.
  * Every save in the admin: GET options -> biometric prompt -> verify -> short-lived write token.
"""
import hmac
import json
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    options_to_json,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers import base64url_to_bytes, bytes_to_base64url
from webauthn.helpers.structs import (
    AuthenticatorAttachment,
    AuthenticatorSelectionCriteria,
    PublicKeyCredentialDescriptor,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

from core import tokens
from core.config import ALLOWED_ORIGINS, admin_key
from db.database import get_db
from db.models import Passkey

router = APIRouter(prefix="/api/webauthn", tags=["webauthn"])

USER_ID = b"portfolio-admin"
STATE_TTL = 120   # seconds the browser has to answer the biometric prompt
TOKEN_TTL = 120   # seconds a write token stays valid


def _require_admin_key(x_admin_key: str = Header(default="")):
    key = admin_key()
    if not key:
        raise HTTPException(503, "ADMIN_KEY is not configured on the server")
    if not hmac.compare_digest(x_admin_key, key):
        raise HTTPException(401, "Invalid or missing admin key")


def _origin(request: Request) -> tuple[str, str]:
    """The page asking (must be an allowed origin) and its hostname = the WebAuthn rp_id."""
    origin = request.headers.get("origin", "").rstrip("/")
    if origin not in ALLOWED_ORIGINS:
        raise HTTPException(400, "Origin not allowed")
    return origin, urlparse(origin).hostname


def _need_enabled():
    if not admin_key():
        raise HTTPException(503, "ADMIN_KEY is not configured on the server")


class RegisterVerifyBody(BaseModel):
    credential: dict
    state: str
    label: str | None = None


class AuthVerifyBody(BaseModel):
    credential: dict
    state: str


@router.get("/status")
def status(db: Session = Depends(get_db)):
    if not admin_key():
        return {"enabled": False, "devices": 0}
    return {"enabled": True, "devices": db.query(Passkey).count()}


# ── Add this device ───────────────────────────────────────
@router.post("/register/options", dependencies=[Depends(_require_admin_key)])
def register_options(request: Request, db: Session = Depends(get_db)):
    origin, rp_id = _origin(request)
    existing = [
        PublicKeyCredentialDescriptor(id=base64url_to_bytes(p.credential_id))
        for p in db.query(Passkey).all()
    ]
    opts = generate_registration_options(
        rp_id=rp_id,
        rp_name="Portfolio Admin",
        user_id=USER_ID,
        user_name="admin",
        authenticator_selection=AuthenticatorSelectionCriteria(
            authenticator_attachment=AuthenticatorAttachment.PLATFORM,  # Touch ID / Face ID, not USB keys
            resident_key=ResidentKeyRequirement.PREFERRED,
            user_verification=UserVerificationRequirement.REQUIRED,
        ),
        exclude_credentials=existing,
    )
    state = tokens.sign("reg", {"c": bytes_to_base64url(opts.challenge), "o": origin}, STATE_TTL)
    return {"options": json.loads(options_to_json(opts)), "state": state}


@router.post("/register/verify", dependencies=[Depends(_require_admin_key)])
def register_verify(body: RegisterVerifyBody, request: Request, db: Session = Depends(get_db)):
    origin, rp_id = _origin(request)
    st = tokens.verify(body.state, "reg")
    if not st or st["o"] != origin:
        raise HTTPException(400, "Registration expired — try again")
    try:
        v = verify_registration_response(
            credential=body.credential,
            expected_challenge=base64url_to_bytes(st["c"]),
            expected_rp_id=rp_id,
            expected_origin=origin,
            require_user_verification=True,
        )
    except Exception:
        raise HTTPException(400, "Could not verify this device")
    cid = bytes_to_base64url(v.credential_id)
    if db.query(Passkey).filter(Passkey.credential_id == cid).first():
        raise HTTPException(409, "This device is already registered")
    db.add(Passkey(
        credential_id=cid,
        public_key=v.credential_public_key,
        sign_count=v.sign_count,
        label=(body.label or "")[:80] or None,
    ))
    db.commit()
    return {"success": True, "devices": db.query(Passkey).count()}


# ── Prove it's you before a save ──────────────────────────
@router.post("/auth/options")
def auth_options(request: Request, db: Session = Depends(get_db)):
    _need_enabled()
    origin, rp_id = _origin(request)
    keys = db.query(Passkey).all()
    if not keys:
        raise HTTPException(409, "no_passkey")
    opts = generate_authentication_options(
        rp_id=rp_id,
        allow_credentials=[PublicKeyCredentialDescriptor(id=base64url_to_bytes(k.credential_id)) for k in keys],
        user_verification=UserVerificationRequirement.REQUIRED,
    )
    state = tokens.sign("auth", {"c": bytes_to_base64url(opts.challenge), "o": origin}, STATE_TTL)
    return {"options": json.loads(options_to_json(opts)), "state": state}


@router.post("/auth/verify")
def auth_verify(body: AuthVerifyBody, request: Request, db: Session = Depends(get_db)):
    _need_enabled()
    origin, rp_id = _origin(request)
    st = tokens.verify(body.state, "auth")
    if not st or st["o"] != origin:
        raise HTTPException(400, "Check expired — try again")
    key = db.query(Passkey).filter(Passkey.credential_id == body.credential.get("id")).first()
    if not key:
        raise HTTPException(401, "Unknown device")
    try:
        v = verify_authentication_response(
            credential=body.credential,
            expected_challenge=base64url_to_bytes(st["c"]),
            expected_rp_id=rp_id,
            expected_origin=origin,
            credential_public_key=key.public_key,
            credential_current_sign_count=key.sign_count,
            require_user_verification=True,
        )
    except Exception:
        raise HTTPException(401, "Biometric check failed")
    key.sign_count = v.new_sign_count
    db.commit()
    return {"token": tokens.sign("write", {}, TOKEN_TTL), "expires_in": TOKEN_TTL}
