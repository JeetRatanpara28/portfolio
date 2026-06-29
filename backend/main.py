"""
Portfolio FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""
import os
from pathlib import Path
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from core.limiter import limiter
from dotenv import load_dotenv

from db.database import engine, SessionLocal
from db.models import Base, AdminUser

from routers import profile, skills, projects, experience, education, certifications, contact, auth
from routers import webauthn_routes, resume

load_dotenv()

# ── Create tables + seed admin user on startup ──────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _seed_admin()
    yield


def _seed_admin():
    """Create the admin DB user from env vars if no user exists yet."""
    import bcrypt
    db = SessionLocal()
    try:
        exists = db.query(AdminUser).first()
        if not exists:
            username = os.getenv("ADMIN_USERNAME", "admin")
            password = os.getenv("ADMIN_PASSWORD", "changeme")
            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            db.add(AdminUser(username=username, password_hash=hashed))
            db.commit()
            print(f"[startup] Admin user '{username}' created in DB.")
    finally:
        db.close()

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

# ── CORS ────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Security headers middleware ──────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Only add HSTS on HTTPS (Fly.io / production)
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# ── Routers ─────────────────────────────────────────────
app.include_router(profile.router)
app.include_router(skills.router)
app.include_router(projects.router)
app.include_router(experience.router)
app.include_router(education.router)
app.include_router(certifications.router)
app.include_router(contact.router)
app.include_router(auth.router)
app.include_router(webauthn_routes.router)
app.include_router(resume.router)

# ── Health ──────────────────────────────────────────────
@app.get("/api/health", tags=["system"])
async def health():
    return {"status": "ok", "service": "portfolio-api", "ts": datetime.utcnow().isoformat()}

# ── Serve built frontend in production ──────────────────
static_dir = Path(__file__).parent.parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not found")
        return FileResponse(static_dir / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)