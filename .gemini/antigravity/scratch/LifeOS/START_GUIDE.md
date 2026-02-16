# LifeOS Startup Guide

## 🆕 Key Features (2026)

- **Health Vitals Page**: Track weight, blood pressure, blood sugar, and heart rate (see "Vitals" in navbar)
- **Junk Food Tracking**: New step in daily check-in wizard
- **Calendar Day Info**: Click any date to see vitals, mood, and medicine status
- **Edit Buttons**: Edit events and medicines directly from the calendar
- **Session Expiry Handling**: Auto-redirect to login with a session expired banner
- **Notification Sound**: Browser notifications now play a sound
- **Cloudflare Tunnel**: Secure public access via lifebuddy.dpdns.org
- **One-Click Scripts**: `start-all.sh`, `stop-all.sh`, `status.sh` for easy management
- **SPA Production Server**: `serve-spa.py` for correct frontend routing

---

## 🚀 Quick Start (All Services)

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
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
source app/vevn/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Health Vitals API:**
- `GET /daily-logs/by-date/{date}` — Get daily log (including vitals) for a date
- `PUT /daily-logs/{id}` — Update daily log (vitals, junk food, etc)

**To run in background:**
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
source app/vevn/bin/activate
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
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
nohup python3 serve-spa.py > frontend-server.log 2>&1 &
```

**Pages:**
- `/health` — Health Vitals page
- `/check-in` — Daily check-in (now includes junk food step)
- `/calendar` — Calendar with Day Info tab (vitals, mood, medicine)

#### Option B: Development (with hot reload)
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS/frontend
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
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
./start-tunnel.sh
```

**Or run in background:**
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
nohup ./start-tunnel.sh > tunnel.log 2>&1 &
```

**Check if running:**
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

- **Python 3.12** with virtual environment at `app/vevn/`
- **Node.js & npm** (for frontend)
- **PostgreSQL** database running on localhost:5432
- **Cloudflared** CLI tool (for tunnel)

---

## 🔧 First-Time Setup

### 1. Database Setup
```bash
# PostgreSQL should be running with:
# Database: lifeos_db
# User: lifeos_user
# Password: Suharshr@99
```

### 2. Backend Dependencies
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
source app/vevn/bin/activate
pip install -r requirements.txt
```

### 3. Frontend Dependencies
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS/frontend
npm install
```

### 4. Build Frontend (for production)
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS/frontend
npm run build
```

### 5. Cloudflare Tunnel (one-time setup)
```bash
# Already configured! Just run:
./start-tunnel.sh
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
- **Cloudflare Tunnel**: Public access via lifebuddy.dpdns.org
- **Scripts**: `start-all.sh`, `stop-all.sh`, `status.sh` for easy management
- **SPA Server**: `serve-spa.py` for correct frontend routing
