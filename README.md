# LifeOS (LifeBuddy) — AI Personal Life Optimization System

LifeOS is a premium lifestyle wellness PWA for users who want to optimize their daily life.
It tracks mood, sleep, focus, productivity, habits, medications, and health vitals — using AI to provide performance insights and weekly reports.

Live at: **https://lifebuddy.dpdns.org**

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started (Local)](#-getting-started-local)
- [Docker Deployment](#-docker-deployment)
- [Jenkins CI/CD](#-jenkins-cicd)
- [Environment Variables](#-environment-variables)
- [API Routes](#-api-routes)
- [Scripts](#-scripts)

---

## ✨ Features

### Core
- **Gamified Daily Check-in**: Multi-step wizard with emoji feedback, confetti, junk food tracking
- **Health Vitals Tracking**: Weight, BP, blood sugar, heart rate on a dedicated Health page
- **Medical Reports**: Upload, view, and share (via native share) lab reports, prescriptions, scans (PDF/image, 10 MB max)
- **Advanced Habits**: Streak tracking, weekly heatmap dots, category filtering
- **Calendar & Medicine Tracking**: Events, medications with optional photo, browser + push notifications for reminders
- **Life Score & AI Reports**: Visual life score and weekly AI-generated lifestyle analysis

### Care & Notifications
- **CareLink**: Share your health data with caretakers (family, friends, doctors)
- **Push Notifications**: Firebase Cloud Messaging for medicine reminders and event alerts
- **WhatsApp Alerts**: Missed medicine alerts sent to you and your caretakers via WhatsApp (Facebook Graph API)
- **Medicine Photos**: Attach optional photos to medicines for easy identification

### User Experience
- **Profile Page**: 17 demographic fields, photo upload, password change, account management
- **2-Step Registration**: Core info → optional demographics (phone, DOB, gender, blood group, height, weight)
- **Dashboard Welcome**: Time-based greeting with user's name
- **Navbar Avatar**: Shows profile photo, first initial, or fallback icon
- **Day Info Sidebar**: Click any calendar date to view vitals, mood, and medicine status
- **Session Expiry Handling**: Auto-redirect with friendly banner
- **PWA**: Installable, works offline, push notifications

### Infrastructure
- **Docker & Docker Compose**: One-command production deployment
- **Jenkins CI/CD**: Automated lint → test → build → deploy pipeline
- **Cloudflare Tunnel**: Secure public access via lifebuddy.dpdns.org
- **One-Click Startup Scripts**: start/stop/status for all services
- **SPA Production Server**: Custom Python server for built frontend

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TailwindCSS, Lucide Icons, PWA (vite-plugin-pwa) |
| Backend | FastAPI, SQLAlchemy ORM, Alembic migrations |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Auth | JWT (python-jose), Argon2 password hashing |
| Push | Firebase Cloud Messaging, Service Worker |
| WhatsApp | Facebook Graph API v22.0 |
| CI/CD | Jenkins (Multibranch Pipeline) |
| Infra | Docker, Docker Compose, Cloudflare Tunnel |

---

## 🏢 Project Structure

```
LifeOS/
├── app/                          # Backend (FastAPI)
│   ├── main.py                   # App entry point
│   ├── database.py               # DB connection
│   ├── models/                   # SQLAlchemy models
│   ├── routes/                   # API endpoints
│   ├── services/                 # Business logic
│   ├── schemas/                  # Pydantic schemas
│   ├── utils/                    # Helpers (security, etc.)
│   ├── uploads/                  # User-uploaded files
│   └── alembic/                  # DB migrations
├── frontend/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── components/           # Shared components
│   │   └── services/api.js       # Axios API client
│   └── public/
│       └── firebase-messaging-sw.js
├── Dockerfile                    # Multi-stage build (frontend + backend)
├── docker-compose.yml            # Full stack: DB + app
├── Jenkinsfile                   # CI/CD pipeline
├── .env.example                  # Root env template
├── requirements.txt              # Python dependencies
├── start.sh                      # Gunicorn entrypoint
├── serve-spa.py                  # Production SPA server
├── start-all.sh / stop-all.sh    # Service management scripts
└── README.md
```

---

## 🛠 Getting Started (Local)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (recommended) or SQLite

### 1. Clone & configure

```bash
git clone https://github.com/Suhar121/Lifeos.git
cd Lifeos
git checkout dev
cp .env.example .env              # edit with your real values
cp frontend/.env.example frontend/.env
```

### 2. Backend

```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd app && alembic upgrade head && cd ..
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### Quick Start (all services on Linux/Mac)

```bash
./start-all.sh    # Start backend + frontend + tunnel
./status.sh       # Check service status
./stop-all.sh     # Stop everything
```

---

## 🐳 Docker Deployment

### Single command

```bash
cp .env.example .env              # fill in real values
docker compose up -d --build
```

This starts:
- **PostgreSQL 16** on port 5432
- **Backend (Gunicorn + Uvicorn)** on port 8000
- **Frontend SPA** on port 5173
- Automatic DB migrations on startup

### Useful commands

```bash
docker compose logs -f backend    # tail backend logs
docker compose ps                 # check service status
docker compose down               # stop everything
docker compose down -v            # stop + remove volumes (⚠️ deletes data)
```

### Build image only

```bash
docker build -t lifeos:latest --build-arg VITE_API_URL=https://lifebuddy.dpdns.org .
```

---

## 🔄 Jenkins CI/CD

The repo includes a `Jenkinsfile` for a **Multibranch Pipeline** with stages:

| Stage | Description |
|-------|-------------|
| **Checkout** | Pull source from SCM |
| **Setup** | Install Python & Node dependencies (parallel) |
| **Lint** | `flake8` (backend) + `eslint` (frontend) in parallel |
| **Test** | `pytest` against an SQLite test DB |
| **Build** | `docker build` the multi-stage image |
| **Push** | Push to registry (main/dev branches, if registry configured) |
| **Deploy** | `docker compose up -d --build` (main/dev branches) |

### Jenkins Setup

1. Install Jenkins with **Docker Pipeline** and **Pipeline** plugins  
2. Create a **Multibranch Pipeline** job pointing at `https://github.com/Suhar121/Lifeos.git`  
3. Add credentials if using a private registry (id: `docker-registry-credentials`)  
4. Set the `REGISTRY` env var in the `Jenkinsfile` to your container registry (e.g. `ghcr.io/suhar121`)  
5. Trigger builds automatically with a GitHub webhook or poll SCM

---

## 🔒 Environment Variables

Copy `.env.example` → `.env` (root) and `frontend/.env.example` → `frontend/.env`.

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL or SQLite connection string |
| `SECRET_KEY` | ✅ | JWT signing secret — **change in production** |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | ✅ | Path to Firebase Admin SDK JSON |
| `APP_BASE_URL` | | Base URL for push notification links |
| `BACKEND_HOST` | | Default `0.0.0.0` |
| `BACKEND_PORT` | | Default `8000` |
| `FRONTEND_PORT` | | Default `5173` |
| `OPENAI_API_KEY` | | For AI insights (optional) |
| `WHATSAPP_PHONE_ID` | | Facebook Graph API phone ID (optional) |
| `WHATSAPP_TOKEN` | | Facebook Graph API token (optional) |
| `ENVIRONMENT` | | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL (e.g. `http://localhost:8000`) |

### Docker Compose extras (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `lifeos_user` | DB user |
| `POSTGRES_PASSWORD` | `lifeos_pass` | DB password — **change in production** |
| `POSTGRES_DB` | `lifeos_db` | Database name |

---

## 📡 API Routes

| Prefix | Description |
|--------|-------------|
| `/auth` | Register, Login |
| `/profile` | Profile CRUD, photo, password |
| `/daily-logs` | Daily check-in entries |
| `/habits` | Habit tracking |
| `/calendar` | Events, Medicines (with photo), Logs |
| `/medical-reports` | Report upload, view, delete, share |
| `/care` | CareLink management |
| `/push` | Push notification subscriptions |
| `/life-score` | Weekly life score |
| `/ai` | AI insights & weekly reports |

Full interactive docs available at **`/docs`** (Swagger UI) when the backend is running.

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `start.sh` | Start backend with Gunicorn (used by Docker) |
| `start-all.sh` | Start backend + frontend + tunnel |
| `stop-all.sh` | Stop all services |
| `status.sh` | Check if services are running |
| `serve-spa.py` | Serve built frontend as SPA |
| `start-tunnel.sh` | Start Cloudflare Tunnel |

---

## 📄 License

Private project.
