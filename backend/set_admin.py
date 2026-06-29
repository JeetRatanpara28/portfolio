#!/usr/bin/env python3
"""
One-time script to set your admin username and password in the database.
Run from the backend/ directory:  python3 set_admin.py
"""
import os, sys, getpass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
os.chdir(Path(__file__).parent)

from dotenv import load_dotenv
load_dotenv()

try:
    import bcrypt
    from db.database import SessionLocal
    from db.models import AdminUser, WebAuthnCredential
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)


def main():
    print("╔═══════════════════════════════════╗")
    print("║      Set Admin Credentials        ║")
    print("╚═══════════════════════════════════╝\n")

    db = SessionLocal()
    try:
        existing = db.query(AdminUser).first()
        if existing:
            print(f"Current username: {existing.username}\n")

        prompt = "New username (email or any string): " if not existing else \
                 f"New username [Enter to keep '{existing.username}']: "
        new_username = input(prompt).strip()
        if not new_username and not existing:
            print("❌  Username is required.")
            sys.exit(1)

        new_password = getpass.getpass("New password (min 8 chars): ")
        if len(new_password) < 8:
            print("❌  Password must be at least 8 characters.")
            sys.exit(1)
        confirm = getpass.getpass("Confirm password: ")
        if new_password != confirm:
            print("❌  Passwords don't match.")
            sys.exit(1)

        hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()

        old_username = existing.username if existing else None

        if existing:
            if new_username:
                existing.username = new_username
            existing.password_hash = hashed
            db.commit()
            final = existing.username
        else:
            db.add(AdminUser(username=new_username, password_hash=hashed))
            db.commit()
            final = new_username

        # Migrate WebAuthn credentials to the new username
        if old_username and new_username and old_username != new_username:
            updated = db.query(WebAuthnCredential).filter(
                WebAuthnCredential.username == old_username
            ).all()
            for c in updated:
                c.username = final
            db.commit()
            if updated:
                print(f"\n🔑  Moved {len(updated)} biometric credential(s) from '{old_username}' → '{final}'.")

        print(f"\n✅  Credentials saved for '{final}'.")
        print("    Restart the backend — changes are active immediately.")

    except Exception as e:
        print(f"\n❌  Error: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
