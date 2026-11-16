"""Tiny signed, expiring tokens (HMAC-SHA256) — no database needed, so they work on serverless.

Used for two things:
  * "state" tokens that carry a WebAuthn challenge between the options and verify calls
  * "write" tokens handed out after a successful Touch ID / Face ID check
The signing secret is derived from ADMIN_KEY, so rotating ADMIN_KEY invalidates everything.
"""
import base64
import hashlib
import hmac
import json
import time

from core.config import admin_key


def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _secret() -> bytes:
    key = admin_key()
    if not key:
        raise RuntimeError("ADMIN_KEY is not set")
    return hashlib.sha256(b"portfolio-passkey:" + key.encode()).digest()


def sign(kind: str, data: dict, ttl: int) -> str:
    payload = _b64(json.dumps({"k": kind, "d": data, "exp": int(time.time()) + ttl}).encode())
    mac = _b64(hmac.new(_secret(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{mac}"


def verify(token: str, kind: str) -> dict | None:
    """Return the token's data if it is genuine, unexpired and of the right kind, else None."""
    try:
        payload, mac = token.split(".", 1)
        good = _b64(hmac.new(_secret(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(mac, good):
            return None
        body = json.loads(_unb64(payload))
        if body.get("k") != kind or body.get("exp", 0) < time.time():
            return None
        return body.get("d", {})
    except Exception:
        return None
