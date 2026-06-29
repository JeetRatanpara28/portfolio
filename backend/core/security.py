import os
import sys
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

SECRET_KEY   = os.getenv("SECRET_KEY", "change-me-in-production-please")
ALGORITHM    = "HS256"
EXPIRE_HOURS = int(os.getenv("TOKEN_EXPIRE_HOURS", "24"))  # 24 hours default

_WEAK_KEY = "change-me-in-production-please"
if SECRET_KEY == _WEAK_KEY:
    print(
        "\n⚠️  WARNING: SECRET_KEY is set to the default placeholder value.\n"
        "   Anyone can forge admin JWTs. Set a strong random key in .env:\n"
        "   SECRET_KEY=$(python3 -c \"import secrets; print(secrets.token_hex(32))\")\n",
        file=sys.stderr,
    )

security = HTTPBearer()


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
