from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import ResumeFile

router = APIRouter(prefix="/api/resume", tags=["resume"])

MAX_SIZE_BYTES = 4 * 1024 * 1024  # 4 MB (Vercel request bodies are capped at ~4.5 MB)
PDF_MAGIC = b"%PDF"               # every valid PDF starts with this


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are allowed")

    content = await file.read()

    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(413, f"File too large — max {MAX_SIZE_BYTES // (1024*1024)} MB")

    if not content.startswith(PDF_MAGIC):
        raise HTTPException(400, "File does not appear to be a valid PDF")

    row = db.query(ResumeFile).first()
    if row:
        row.content = content
    else:
        db.add(ResumeFile(content=content))
    db.commit()
    return {"status": "uploaded", "size_kb": round(len(content) / 1024, 1)}


@router.get("/download")
def download_resume(db: Session = Depends(get_db)):
    row = db.query(ResumeFile).first()
    if not row:
        raise HTTPException(404, "No resume uploaded yet")
    return Response(
        content=row.content,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Jeet_Ratanpara_Resume.pdf"},
    )


@router.get("/exists")
def resume_exists(db: Session = Depends(get_db)):
    return {"exists": db.query(ResumeFile.id).first() is not None}
