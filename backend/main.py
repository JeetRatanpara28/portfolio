"""
Portfolio FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""
import os
import hmac
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from core.limiter import limiter
from dotenv import load_dotenv

from core import tokens
from core.config import ALLOWED_ORIGINS, admin_key
from db.database import engine
from db.models import Base

from routers import profile, skills, projects, experience, education, certifications, contact, resume, webauthn_routes

load_dotenv()

# ── Create tables on startup ──────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Portfolio API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── Rate limiter setup ───────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Write guard ──────────────────────────────────────────
# Every write (POST/PUT/DELETE) needs either:
#   * X-Admin-Token  – a short-lived token the server hands out after a Touch ID / Face ID check, or
#   * X-Admin-Key    – the ADMIN_KEY itself (scripts / recovery)
# Open writes: the public contact form, and the /api/webauthn/* routes (they check for themselves).
# If ADMIN_KEY is unset (local dev, tests) everything stays open.
PUBLIC_WRITES = {"/api/contact", "/api/contact/"}

@app.middleware("http")
async def write_guard(request: Request, call_next):
    key = admin_key()
    if (
        key
        and request.method not in ("GET", "HEAD", "OPTIONS")
        and request.url.path not in PUBLIC_WRITES
        and not request.url.path.startswith("/api/webauthn/")
    ):
        token_ok = tokens.verify(request.headers.get("x-admin-token", ""), "write") is not None
        key_ok = hmac.compare_digest(request.headers.get("x-admin-key", ""), key)
        if not (token_ok or key_ok):
            return JSONResponse({"detail": "Passkey check required"}, status_code=401)
    return await call_next(request)

# ── Security headers middleware ──────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Only add HSTS on HTTPS (production)
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS must be added LAST: the last middleware added is the outermost one, so even
# error responses from the guards above (e.g. 401) get CORS headers and the browser can read them.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────
app.include_router(profile.router)
app.include_router(skills.router)
app.include_router(projects.router)
app.include_router(experience.router)
app.include_router(education.router)
app.include_router(certifications.router)
app.include_router(contact.router)
app.include_router(resume.router)
app.include_router(webauthn_routes.router)

# ── Health ──────────────────────────────────────────────
@app.get("/api/health", tags=["system"])
async def health():
    return {"status": "ok", "service": "portfolio-api", "ts": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)