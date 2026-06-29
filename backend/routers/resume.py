import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse

from core.security import verify_token

router = APIRouter(prefix="/api/resume", tags=["resume"])

RESUME_PATH = Path(__file__).parent.parent / "static" / "resume.pdf"
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
PDF_MAGIC = b"%PDF"               # every valid PDF starts with this


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    _: str = Depends(verify_token),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are allowed")

    content = await file.read()

    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(413, f"File too large — max {MAX_SIZE_BYTES // (1024*1024)} MB")

    if not content.startswith(PDF_MAGIC):
        raise HTTPException(400, "File does not appear to be a valid PDF")

    RESUME_PATH.parent.mkdir(parents=True, exist_ok=True)
    RESUME_PATH.write_bytes(content)
    return {"status": "uploaded", "size_kb": round(len(content) / 1024, 1)}


@router.get("/download")
def download_resume():
    if not RESUME_PATH.exists():
        raise HTTPException(404, "No resume uploaded yet")
    return FileResponse(
        path=RESUME_PATH,
        media_type="application/pdf",
        filename="Jeet_Ratanpara_Resume.pdf",
        headers={"Content-Disposition": "attachment; filename=Jeet_Ratanpara_Resume.pdf"},
    )


@router.get("/exists")
def resume_exists():
    return {"exists": RESUME_PATH.exists()}
