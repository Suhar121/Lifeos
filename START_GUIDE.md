# LifeOS Startup Guide

## 🆕 Key Features (2026)

- **Health Vitals Page**: Track weight, blood pressure, blood sugar, and heart rate (see "Vitals" in navbar)
- **Junk Food Tracking**: New step in daily check-in wizard
- **Calendar Day Info**: Click any date to see vitals, mood, and medicine status
- **Edit Buttons**: Edit events and medicines directly from the calendar
- **Session Expiry Handling**: Auto-redirect to login with a session expired banner
- **Notification Sound**: Browser notifications now play a sound
- **Docker & Docker Compose**: One-command production deployment
- **Jenkins CI/CD**: Automated lint → test → build → deploy pipeline
- **Cloudflare Tunnel**: Secure public access via lifebuddy.dpdns.org
- **One-Click Scripts**: `start-all.sh`, `stop-all.sh`, `status.sh` for easy management
- **SPA Production Server**: `serve-spa.py` for correct frontend routing

---

## 🐳 Quick Start (Docker — Recommended)

```bash
cp .env.example .env              # fill in your values
docker compose up -d --build
```

That's it. PostgreSQL, backend, and frontend all start automatically.

**Useful commands:**
```bash
docker compose logs -f backend    # tail logs
docker compose ps                 # service status
docker compose down               # stop
docker compose down -v            # stop + delete data
```

---

## 🚀 Quick Start (Manual — All Services)

To start **everything** at once, run:
```bash
./start-all.sh
```

This will:
- Start backend (FastAPI, port 8000)
- Start frontend (production build, port 5173)
- Start Cloudflare Tunnel (if configured)

---

## 📋 Manual Startup (Step by Step)

### 1. **Backend (FastAPI)**
Start the backend API server:

```bash
cd LifeOS
source venv/bin/activate          # Windows: venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**To run in background (Linux/Mac):**
```bash
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > app/backend.log 2>&1 &
```

**Check if running:**
```bash
curl http://localhost:8000/docs
# Should return HTML (200 OK)
```

---

### 2. **Frontend (React + Vite)**

#### Option A: Production (Recommended for public access)
```bash
cd LifeOS
python3 serve-spa.py
```

#### Option B: Development (with hot reload)
```bash
cd LifeOS/frontend
npm install
npm run dev
```

**Check if running:**
```bash
curl http://localhost:5173
# Should return HTML (200 OK)
```

---

### 3. **Cloudflare Tunnel** (for public access via lifebuddy.dpdns.org)
```bash
./start-tunnel.sh
```
```bash
pgrep -f cloudflared
# Should return a process ID
```

---

## 🔍 Check Status of All Services

```bash
# Backend
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000/docs

# Frontend
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:5173/

# Tunnel
pgrep -f cloudflared && echo "Tunnel: Running" || echo "Tunnel: Stopped"

# Public Domain
curl -s -o /dev/null -w "Public: %{http_code}\n" https://lifebuddy.dpdns.org/
```

---

## 🛑 Stop All Services

```bash
# Stop backend
pkill -f uvicorn

# Stop frontend
pkill -f serve-spa.py
# OR if using npm dev server:
# pkill -f vite

# Stop tunnel
pkill -f cloudflared
```

---

## 📦 What You Need Installed

- **Python 3.11+** with a virtual environment
- **Node.js 18+ & npm** (for frontend)
- **PostgreSQL** (production) or SQLite (development)
- **Docker & Docker Compose** (optional — for containerised deployment)
- **Cloudflared** CLI tool (optional — for tunnel)

---

## 🔧 First-Time Setup

### 1. Environment files
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
# Edit both files with your real values
```

### 2. Database (local)
```bash
# If using PostgreSQL, create the database:
createdb lifeos_db
# Or configure DATABASE_URL in .env to point at your existing DB
```

### 3. Backend Dependencies
```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Frontend Dependencies
```bash
cd frontend
npm install
```

### 5. Build Frontend (for production)
```bash
cd frontend
npm run build
```

### 6. Run Migrations
```bash
cd app && alembic upgrade head && cd ..
```

---

## 🌐 Access URLs

- **Local Frontend:** http://localhost:5173
- **Local Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Public Domain:** https://lifebuddy.dpdns.org

---

## 🆕 Feature Highlights

- **Health Vitals**: Enter and view weight, BP, sugar, heart rate on the Health page or via calendar Day Info
- **Junk Food Tracking**: Step in daily check-in wizard
- **Edit Events/Medicines**: Pencil icon in calendar
- **Session Expiry**: Auto-redirect to login with banner
- **Notification Sound**: For reminders
- **Docker + Jenkins**: Containerised deployment with CI/CD
- **Cloudflare Tunnel**: Public access via lifebuddy.dpdns.org
- **Scripts**: `start-all.sh`, `stop-all.sh`, `status.sh` for easy management
- **SPA Server**: `serve-spa.py` for correct frontend routing
- **Scripts**: `start-all.sh`, `stop-all.sh`, `status.sh` for easy management
- **SPA Server**: `serve-spa.py` for correct frontend routing
