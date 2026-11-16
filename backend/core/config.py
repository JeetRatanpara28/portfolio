"""Settings read from the environment (shared by main.py and the routers)."""
import os

from dotenv import load_dotenv

load_dotenv()

# Tolerate stray spaces, quotes, newlines and trailing slashes in the env value.
ALLOWED_ORIGINS = [
    o.strip().strip("\"'").rstrip("/")
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
    if o.strip().strip("\"'")
]


def admin_key() -> str:
    """Read at call time so it can be changed without re-importing (and in tests)."""
    return os.getenv("ADMIN_KEY", "").strip()
