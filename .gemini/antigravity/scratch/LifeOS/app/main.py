from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables early
load_dotenv()

from app.routes import auth, daily_logs, habits, ai, calendar, life_score, reports
from app.routes import care
from app.routes import push
from app.routes import profile
from app.routes import medical_reports
from app.services.notification_scheduler import start_scheduler

app = FastAPI(title="LifeOS API", version="1.0.0")

# CORS
cors_origins_str = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://192.168.31.33:5173,http://4.240.99.32:5173,https://lifebuddy.dpdns.org"
)

origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
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

# Start background push notification scheduler
start_scheduler()

@app.get("/")
def read_root():
    return {"message": "Welcome to LifeOS API"}
