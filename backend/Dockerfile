# ---- Backend image (FastAPI) ----
FROM python:3.11-slim

# Don't write .pyc files; print logs immediately (no buffering)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy ONLY requirements first: Docker caches this layer, so dependencies
# are reinstalled only when requirements.txt changes (not on every code edit).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the application code
COPY . .

# Run as a non-root user (safer if the app is ever compromised)
RUN useradd --create-home appuser \
    && mkdir -p /app/static \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# 0.0.0.0 = listen on all interfaces so traffic from outside the container can reach it
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
