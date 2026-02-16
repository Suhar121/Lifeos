# LifeOS - AI Personal Life Optimization System

LifeOS is a premium lifestyle wellness web application for ambitious users who want to optimize their daily life.
It tracks mood, sleep, focus, productivity, habits, and medications, using AI to provide performance insights and weekly reports.


## ✨ V2+ Features

- **Gamified Daily Check-in**: Multi-step wizard with emoji feedback, confetti, and new junk food tracking step.
- **Health Vitals Tracking**: Record weight, blood pressure, blood sugar, and heart rate on a dedicated Health page.
- **Advanced Habits**: Streak tracking, weekly heatmap dots, and category filtering.
- **Calendar & Medicine Tracking**: Schedule events, track/edit medications, and receive browser notifications (with sound) for reminders.
- **Day Info Sidebar**: Click any calendar date to view that day's vitals, mood, and medicine status.
- **Life Score & AI Reports**: Visual life score tracking and weekly AI-generated lifestyle analysis.
- **Session Expiry Handling**: Auto-redirect to login with a friendly banner if your session expires.
- **Cloudflare Tunnel**: Secure public access via lifebuddy.dpdns.org (Azure + Cloudflare).
- **One-Click Startup Scripts**: Start/stop/status all services with provided shell scripts.
- **SPA Production Server**: Custom Python server for serving the built frontend as a true SPA.

## 🚀 Deployment

The project is configured for seamless deployment to **Microsoft Azure**:
- **Backend**: Containerized via Docker for Azure Container Apps.
- **Frontend**: Optimized for Azure Static Web Apps.
- **CI/CD**: Fully automated via GitHub Actions (template workflows included).

## 🏢 Project Structure

- `app/`: Backend (FastAPI, SQLite for local, PostgreSQL for prod)
- `frontend/`: Frontend (React, Vite, TailwindCSS)
- `Dockerfile`: Production container config
- `.github/workflows/`: CI/CD pipelines

- `start-all.sh`, `stop-all.sh`, `status.sh`: Scripts to manage all services
- `serve-spa.py`: SPA-aware Python HTTP server for production frontend
- `cloudflare-tunnel-config.yml`: Cloudflare Tunnel routing config

## 🛠 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- SQLite (Local) / PostgreSQL (Production)

### Local Installation

1. **Backend**
   ```bash
   # From project root (LifeOS/)
   python -m venv venv
   # Activate venv:
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Quick Start (All Services)

From the project root, run:
```bash
./start-all.sh
```
This will start backend, frontend (production), and Cloudflare Tunnel (if configured).

Check status:
```bash
./status.sh
```
Stop everything:
```bash
./stop-all.sh
```

## 🔒 Environment Variables

Create a `.env` file in the root directory:
```env
# Backend
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///./lifeos.db
OPENAI_API_KEY=your_openai_key

# For PostgreSQL (production):
# DATABASE_URL=postgresql://lifeos_user:your_password@localhost:5432/lifeos_db

# Frontend (in frontend/.env)
VITE_API_URL=http://localhost:8000
```
