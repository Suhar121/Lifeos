from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, daily_logs, habits, ai, calendar, life_score, reports

app = FastAPI(title="LifeOS API", version="1.0.0")

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

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

@app.get("/")
def read_root():
    return {"message": "Welcome to LifeOS API"}
