import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from app.utils.security import get_password_hash, verify_password
from app.database import SessionLocal
from sqlalchemy import text

def test_hashing():
    print("Testing password hashing...")
    try:
        pwd = "testpassword"
        hashed = get_password_hash(pwd)
        print(f"Hash generated: {hashed}")
        assert verify_password(pwd, hashed)
        print("Hashing verification successful.")
    except Exception as e:
        print(f"Hashing failed: {e}")
        raise

def test_db():
    print("Testing database connection...")
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1"))
        print(f"Database query result: {result.fetchone()}")
        db.close()
        print("Database connection successful.")
    except Exception as e:
        print(f"Database failed: {e}")
        raise

if __name__ == "__main__":
    try:
        test_hashing()
        test_db()
        print("All backend checks passed.")
    except Exception as e:
        print(f"Backend check failed: {e}")
