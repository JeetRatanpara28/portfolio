"""
Run once to add missing columns to existing tables.
Usage: python3 migrate.py
"""
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv("backend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

migrations = [
    # WebAuthn credentials table
    """
    CREATE TABLE IF NOT EXISTS webauthn_credentials (
        id            SERIAL PRIMARY KEY,
        username      VARCHAR(200) NOT NULL,
        credential_id VARCHAR(500) NOT NULL UNIQUE,
        public_key    VARCHAR(2000) NOT NULL,
        sign_count    INTEGER DEFAULT 0
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_webauthn_username ON webauthn_credentials(username)",
    # Experience — add current flag
    "ALTER TABLE experience ADD COLUMN IF NOT EXISTS current BOOLEAN DEFAULT FALSE",

    # Education — add field_of_study (field is a reserved word, use field_of_study)
    "ALTER TABLE education ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(200)",
    # Rename existing date columns to be consistent (they already exist as start_date / end_date)
    # grade stays as is

    # Certifications — add all the extra fields
    "ALTER TABLE certifications ADD COLUMN IF NOT EXISTS issuer VARCHAR(200)",
    "ALTER TABLE certifications ADD COLUMN IF NOT EXISTS issued_date VARCHAR(50)",
    "ALTER TABLE certifications ADD COLUMN IF NOT EXISTS expiry_date VARCHAR(50)",
    "ALTER TABLE certifications ADD COLUMN IF NOT EXISTS credential_id VARCHAR(200)",
    "ALTER TABLE certifications ADD COLUMN IF NOT EXISTS credential_url VARCHAR(500)",
]

for sql in migrations:
    print(f"  ▶  {sql[:70]}…")
    cur.execute(sql)

conn.commit()
cur.close()
conn.close()
print("\n✓ Migration complete.")
