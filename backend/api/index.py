"""Vercel entrypoint: exposes the FastAPI app as a serverless function."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app as _app  # noqa: E402


async def app(scope, receive, send):
    # TEMPORARY debug: GET anything with ?__debug shows what path Vercel passes in.
    if scope["type"] == "http" and scope.get("query_string") == b"__debug":
        body = json.dumps({
            "path": scope.get("path"),
            "raw_path": (scope.get("raw_path") or b"").decode(),
            "root_path": scope.get("root_path"),
            "headers": {k.decode(): v.decode() for k, v in scope["headers"]
                        if k.decode().startswith(("x-vercel", "x-matched", "x-forwarded-host"))},
        }).encode()
        await send({"type": "http.response.start", "status": 200,
                    "headers": [(b"content-type", b"application/json")]})
        await send({"type": "http.response.body", "body": body})
        return
    await _app(scope, receive, send)
