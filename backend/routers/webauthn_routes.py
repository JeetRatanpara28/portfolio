"""
WebAuthn / Passkey authentication.
Builds options JSON manually so the format is guaranteed compatible with
@simplewebauthn/browser v9, regardless of py-webauthn's internal pydantic version.

Credential objects are constructed directly with bytes (not JSON-parsed) to avoid
pydantic camelCase / type-coercion issues between webauthn 2.x and pydantic v2.
"""

import os, json, base64, secrets, time
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import WebAuthnCredential
from core.security import create_token, verify_token

router = APIRouter(prefix="/api/auth/webauthn", tags=["webauthn"])

RP_ID   = os.getenv("RP_ID", "localhost")
RP_NAME = "Jeet Portfolio Admin"
ORIGIN  = os.getenv("WEBAUTHN_ORIGIN", "http://localhost:3001")


# ── helpers ───────────────────────────────────────────────────────────────────
def b64u(b: bytes) -> str:
    """bytes → base64url string (no padding)."""
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode()

def b64u_decode(s: str) -> bytes:
    """base64url string → bytes (handles missing padding)."""
    pad = 4 - len(s) % 4
    if pad != 4:
        s += '=' * pad
    return base64.urlsafe_b64decode(s)


# ── challenge store with 5-min TTL ───────────────────────────────────────────
class _Store:
    def __init__(self, ttl=300):
        self._d: dict = {}
        self._ttl = ttl
    def set(self, k, v):
        self._d[k] = (v, time.monotonic())
    def pop(self, k):
        entry = self._d.pop(k, None)
        if entry is None:
            return None
        v, ts = entry
        return v if time.monotonic() - ts < self._ttl else None

_ch = _Store()


# ── request models ────────────────────────────────────────────────────────────
class UsernameReq(BaseModel):
    username: str

class CompleteReq(BaseModel):
    username: str
    credential: dict


# ── 1. has-credential check ───────────────────────────────────────────────────
@router.get("/has-credential/{username}")
def has_credential(username: str, db: Session = Depends(get_db)):
    exists = db.query(WebAuthnCredential).filter(
        WebAuthnCredential.username == username
    ).first()
    return {"has_credential": bool(exists)}


# ── 2. register/begin ─────────────────────────────────────────────────────────
@router.post("/register/begin")
def register_begin(
    data: UsernameReq,
    db: Session = Depends(get_db),
    _: str = Depends(verify_token),
):
    challenge = secrets.token_bytes(32)
    _ch.set(f"reg:{data.username}", challenge)

    existing = db.query(WebAuthnCredential).filter(
        WebAuthnCredential.username == data.username
    ).all()

    return {
        "rp":   {"name": RP_NAME, "id": RP_ID},
        "user": {
            "id":          b64u(data.username.encode()),
            "name":        data.username,
            "displayName": data.username.title(),
        },
        "challenge":       b64u(challenge),
        "pubKeyCredParams": [
            {"type": "public-key", "alg": -7},    # ES256  (Apple Touch ID / Face ID)
            {"type": "public-key", "alg": -257},   # RS256  (fallback)
        ],
        "timeout": 60000,
        "excludeCredentials": [
            {"type": "public-key", "id": c.credential_id}
            for c in existing
        ],
        "authenticatorSelection": {
            "userVerification":      "required",
            "residentKey":           "preferred",
            "authenticatorAttachment": "platform",  # force Touch ID / Face ID, not Google
        },
        "attestation": "none",
    }


# ── 3. register/complete ──────────────────────────────────────────────────────
@router.post("/register/complete")
def register_complete(
    data: CompleteReq,
    db: Session = Depends(get_db),
    _: str = Depends(verify_token),
):
    try:
        from webauthn import verify_registration_response
        from webauthn.helpers.structs import (
            AuthenticatorAttestationResponse,
            RegistrationCredential,
        )
    except ImportError:
        raise HTTPException(503, "pip install webauthn")

    challenge = _ch.pop(f"reg:{data.username}")
    if not challenge:
        raise HTTPException(400, "Challenge expired — start over")

    raw = data.credential
    try:
        # Construct struct directly with decoded bytes — bypasses all JSON-parse issues
        credential = RegistrationCredential(
            id=raw["id"],
            raw_id=b64u_decode(raw.get("rawId") or raw["id"]),
            response=AuthenticatorAttestationResponse(
                client_data_json=b64u_decode(raw["response"]["clientDataJSON"]),
                attestation_object=b64u_decode(raw["response"]["attestationObject"]),
            ),
        )
    except Exception as e:
        raise HTTPException(400, f"Credential parse failed: {e}")

    try:
        v = verify_registration_response(
            credential=credential,
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=ORIGIN,
            require_user_verification=True,
        )
    except Exception as e:
        raise HTTPException(400, f"Verification failed: {e}")

    # Replace any existing credential for this user
    db.query(WebAuthnCredential).filter(
        WebAuthnCredential.username == data.username
    ).delete()

    db.add(WebAuthnCredential(
        username=data.username,
        credential_id=b64u(v.credential_id),
        public_key=b64u(v.credential_public_key),
        sign_count=v.sign_count,
    ))
    db.commit()
    return {"status": "registered"}


# ── 4. login/begin ────────────────────────────────────────────────────────────
@router.post("/login/begin")
def login_begin(data: UsernameReq, db: Session = Depends(get_db)):
    creds = db.query(WebAuthnCredential).filter(
        WebAuthnCredential.username == data.username
    ).all()
    if not creds:
        raise HTTPException(404, "No biometric credential registered")

    challenge = secrets.token_bytes(32)
    _ch.set(f"auth:{data.username}", challenge)

    return {
        "rpId":      RP_ID,
        "challenge": b64u(challenge),
        "timeout":   60000,
        "userVerification": "required",
        "allowCredentials": [
            {"type": "public-key", "id": c.credential_id}
            for c in creds
        ],
    }


# ── 5. login/complete ─────────────────────────────────────────────────────────
@router.post("/login/complete")
def login_complete(data: CompleteReq, db: Session = Depends(get_db)):
    try:
        from webauthn import verify_authentication_response
        from webauthn.helpers.structs import (
            AuthenticatorAssertionResponse,
            AuthenticationCredential,
        )
    except ImportError:
        raise HTTPException(503, "pip install webauthn")

    challenge = _ch.pop(f"auth:{data.username}")
    if not challenge:
        raise HTTPException(400, "Challenge expired — try again")

    raw_id = data.credential.get("rawId") or data.credential.get("id", "")
    db_cred = db.query(WebAuthnCredential).filter(
        WebAuthnCredential.username == data.username,
        WebAuthnCredential.credential_id == raw_id,
    ).first()
    if not db_cred:
        raise HTTPException(404, "Credential not found")

    raw = data.credential
    try:
        resp = raw["response"]
        credential = AuthenticationCredential(
            id=raw["id"],
            raw_id=b64u_decode(raw.get("rawId") or raw["id"]),
            response=AuthenticatorAssertionResponse(
                client_data_json=b64u_decode(resp["clientDataJSON"]),
                authenticator_data=b64u_decode(resp["authenticatorData"]),
                signature=b64u_decode(resp["signature"]),
                user_handle=b64u_decode(resp["userHandle"]) if resp.get("userHandle") else None,
            ),
        )
    except Exception as e:
        raise HTTPException(400, f"Credential parse failed: {e}")

    try:
        v = verify_authentication_response(
            credential=credential,
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=ORIGIN,
            credential_public_key=b64u_decode(db_cred.public_key),
            credential_current_sign_count=db_cred.sign_count,
            require_user_verification=True,
        )
    except Exception as e:
        raise HTTPException(400, f"Auth verification failed: {e}")

    db_cred.sign_count = v.new_sign_count
    db.commit()

    return {
        "access_token": create_token(os.getenv("ADMIN_USERNAME", "admin")),
        "token_type": "bearer",
    }
