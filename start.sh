#!/bin/bash
# ─────────────────────────────────────────────
#  Portfolio Dev Launcher
#  Usage: bash start.sh
# ─────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "  ┌─────────────────────────────────┐"
echo "  │   Jeet Ratanpara – Portfolio    │"
echo "  │   Dev Launcher                  │"
echo "  └─────────────────────────────────┘"
echo ""

# ── Backend (FastAPI) ──────────────────────
echo "▶ Starting FastAPI backend on http://localhost:8000 ..."
cd "$SCRIPT_DIR/backend"

if [ ! -f .env ]; then
  echo "  ⚠  No .env found — copying .env.example"
  cp .env.example .env
fi

python3 -m pip install -r requirements.txt -q --break-system-packages 2>/dev/null || true
python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# ── Viewer (public portfolio) ──────────────
echo ""
echo "▶ Starting Viewer on http://localhost:3000 ..."
cd "$SCRIPT_DIR/frontend"
npm install -s
npm run dev &
VIEWER_PID=$!
echo "  Viewer PID: $VIEWER_PID"

# ── Admin dashboard ────────────────────────
echo ""
echo "▶ Starting Admin on http://localhost:3001 ..."
cd "$SCRIPT_DIR/admin"
npm install -s
npm run dev &
ADMIN_PID=$!
echo "  Admin PID: $ADMIN_PID"

echo ""
echo "  ✓ All servers running!"
echo "  Viewer  → http://localhost:3000"
echo "  Admin   → http://localhost:3001"
echo "  API     → http://localhost:8000/api/docs"
echo ""
echo "  Credentials: jeet / jeet@admin2026"
echo ""
echo "  Press Ctrl+C to stop all servers."
echo ""

# ── Cleanup on exit ────────────────────────
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $VIEWER_PID $ADMIN_PID 2>/dev/null; exit" INT TERM

wait
