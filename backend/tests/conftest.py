import os

# These MUST be set before the app is imported: database.py and security.py
# read the environment at import time. load_dotenv() never overrides values
# that are already set, so this also protects your real .env database.
os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL", "postgresql://localhost:5432/portfolio_test"
)

import pytest
from fastapi.testclient import TestClient

from main import app
from db.database import engine
from db.models import Base


@pytest.fixture(scope="session")
def client():
    # Start from empty tables so tests never depend on leftover data.
    Base.metadata.drop_all(bind=engine)
    # `with` runs the app's startup code (creates the tables).
    with TestClient(app) as c:
        yield c

