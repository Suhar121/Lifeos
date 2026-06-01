from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import logging
import traceback

# Load environment variables early
load_dotenv()

from app.routes import auth, daily_logs, habits, ai, calendar, life_score, reports
from app.routes import care
from app.routes import push
from app.routes import profile
from app.routes import medical_reports
from app.services.notification_scheduler import start_scheduler

logger = logging.getLogger("lifeos")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks: migrations then scheduler."""
    run_migrations()
    start_scheduler()
    yield
    # shutdown — nothing to clean up


def run_migrations():
    """Run alembic migrations — skips automatically if DB is already at head."""
    import sqlite3
    from alembic.config import Config
    from alembic import command
    from alembic.script import ScriptDirectory

    alembic_ini = os.path.join(os.path.dirname(__file__), "alembic.ini")
    alembic_cfg = Config(alembic_ini)

    # Determine the current head revision without opening SQLAlchemy
    script = ScriptDirectory.from_config(alembic_cfg)
    head_rev = script.get_current_head()

    # Read current DB revision via a plain sqlite3 call (no pool, no locks)
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "lifeos.db")
    try:
        raw = sqlite3.connect(db_path, timeout=5)
        row = raw.execute("SELECT version_num FROM alembic_version LIMIT 1").fetchone()
        raw.close()
        if row and row[0] == head_rev:
            logger.info(f"DB already at head ({head_rev}), skipping migration")
            return
    except Exception:
        pass  # No alembic_version table yet — fall through to full upgrade

    try:
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations applied successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise


app = FastAPI(title="LifeOS API", version="1.0.0", lifespan=lifespan)

# Global exception handler — ensures CORS headers are always sent and errors are logged
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# CORS
cors_origins_str = os.getenv("CORS_ORIGINS", "*")

# The app authenticates via Authorization Bearer header (JWT), not cookies,
# so allow_credentials=False + allow_origins=["*"] is both safe and required
# to satisfy Chrome's Private Network Access policy when the frontend is
# served from a public IP but the backend is on loopback.
if cors_origins_str.strip() == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(daily_logs.router, prefix="/daily-logs", tags=["Daily Logs"])
app.include_router(habits.router, prefix="/habits", tags=["Habits"])
app.include_router(ai.router, prefix="/ai", tags=["AI Analysis"])
app.include_router(calendar.router, prefix="/calendar", tags=["Calendar & Medicines"])
app.include_router(life_score.router, prefix="/life-score", tags=["Life Score"])
app.include_router(reports.router, prefix="/ai", tags=["AI Reports"])
app.include_router(care.router, prefix="/care", tags=["Care"])
app.include_router(push.router, prefix="/push", tags=["Push Notifications"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(medical_reports.router, prefix="/medical-reports", tags=["Medical Reports"])

@app.get("/")
def read_root():
    return {"message": "Welcome to LifeOS API"}
