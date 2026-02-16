# LifeOS Startup Guide

## 🚀 Quick Start (All Services)

To start **everything** at once, run:
```bash
./start-all.sh
```

---

## 📋 Manual Startup (Step by Step)

### 1. **Backend (FastAPI)**
Start the backend API server:

```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
source app/vevn/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

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

## ⚡ Quick Commands Reference

| Task | Command |
|------|---------|
| Start backend | `cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS && source app/vevn/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| Start frontend | `cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS && python3 serve-spa.py` |
| Start tunnel | `cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS && ./start-tunnel.sh` |
| Check all services | `ps aux \| grep -E "uvicorn\|serve-spa\|cloudflared" \| grep -v grep` |
| View backend logs | `tail -f /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS/app/backend.log` |
| View frontend logs | `tail -f /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS/frontend-server.log` |
| Rebuild frontend | `cd frontend && npm run build` |
| Stop everything | `pkill -f "uvicorn\|serve-spa\|cloudflared"` |
