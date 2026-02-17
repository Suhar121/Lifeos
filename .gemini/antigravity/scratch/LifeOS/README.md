# LifeOS (LifeBuddy) - AI Personal Life Optimization System

LifeOS is a premium lifestyle wellness PWA for users who want to optimize their daily life.
It tracks mood, sleep, focus, productivity, habits, medications, and health vitals — using AI to provide performance insights and weekly reports.

Live at: **https://lifebuddy.dpdns.org**

## ✨ Features

### Core
- **Gamified Daily Check-in**: Multi-step wizard with emoji feedback, confetti, junk food tracking
- **Health Vitals Tracking**: Weight, BP, blood sugar, heart rate on a dedicated Health page
- **Medical Reports**: Upload, view, and share (via native share) lab reports, prescriptions, scans (PDF/image, 10MB max)
- **Advanced Habits**: Streak tracking, weekly heatmap dots, category filtering
- **Calendar & Medicine Tracking**: Events, medications with optional photo, browser + push notifications for reminders
- **Life Score & AI Reports**: Visual life score and weekly AI-generated lifestyle analysis

### Care & Notifications
- **CareLink**: Share your health data with caretakers (family, friends, doctors)
- **Push Notifications**: Web Push (VAPID) for medicine reminders and event alerts
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
- **Cloudflare Tunnel**: Secure public access via lifebuddy.dpdns.org
- **One-Click Startup Scripts**: start/stop/status for all services
- **SPA Production Server**: Custom Python server for built frontend

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TailwindCSS, Lucide Icons, PWA (vite-plugin-pwa) |
| Backend | FastAPI, SQLAlchemy ORM, Alembic migrations |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Auth | JWT (python-jose), Argon2 password hashing |
| Push | pywebpush, VAPID keys, Service Worker |
| WhatsApp | Facebook Graph API v22.0 |
| Infra | Azure VM, Cloudflare Tunnel, Docker |

## 🏢 Project Structure

```
LifeOS/
├── app/                          # Backend
│   ├── main.py                   # FastAPI app entry
│   ├── database.py               # DB connection
│   ├── models/                   # SQLAlchemy models
│   │   ├── user.py               # User + 17 profile fields
│   │   ├── v2_models.py          # Event, Medicine, MedicineLog, WeeklyReport, MedicalReport
│   │   ├── care.py               # CareLink model
│   │   └── push_subscription.py  # Push subscriptions
│   ├── routes/                   # API endpoints
│   │   ├── auth.py               # Register/Login
│   │   ├── profile.py            # Profile CRUD, photo upload
│   │   ├── calendar.py           # Events, Medicines (with photo), Logs
│   │   ├── medical_reports.py    # Report upload, view, share
│   │   ├── care.py               # CareLink management
│   │   ├── push.py               # Push subscription
│   │   ├── daily_logs.py         # Daily check-in logs
│   │   ├── habits.py             # Habit tracking
│   │   ├── life_score.py         # Life score
│   │   ├── ai.py                 # AI insights
│   │   └── reports.py            # Weekly AI reports
│   ├── services/
│   │   ├── whatsapp_service.py   # WhatsApp Graph API
│   │   ├── push_service.py       # Web Push sending
│   │   ├── notification_scheduler.py  # Background reminder thread
│   │   ├── ai_service.py         # OpenAI integration
│   │   └── life_score_service.py # Score calculation
│   ├── uploads/                  # User-uploaded files
│   │   ├── profile_photos/
│   │   ├── medicine_photos/
│   │   └── medical_reports/
│   └── alembic/                  # DB migrations
├── frontend/                     # Frontend
│   ├── src/
│   │   ├── pages/                # All page components
│   │   ├── components/           # Shared components
│   │   └── services/api.js       # Axios API client
│   └── public/sw-push.js         # Push notification service worker
├── cloudflare-tunnel-config.yml  # Tunnel routing
├── serve-spa.py                  # Production SPA server
├── start-all.sh / stop-all.sh    # Service management
└── requirements.txt              # Python dependencies
```

## 🛠 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (recommended) or SQLite

### Local Setup

1. **Backend**
   ```bash
   cd LifeOS
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   cp app/.env.example app/.env   # Edit with your values
   cd app && alembic upgrade head && cd ..
   uvicorn app.main:app --reload
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Quick Start (Production)
```bash
./start-all.sh    # Start backend + frontend + tunnel
./status.sh       # Check service status
./stop-all.sh     # Stop everything
```

## 🔒 Environment Variables

Copy `app/.env.example` to `app/.env` and fill in:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lifeos_db

# Auth
SECRET_KEY=your-secret-key

# CORS
CORS_ORIGINS=http://localhost:5173,https://your-domain.com

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_CLAIM_EMAIL=mailto:you@example.com

# WhatsApp (Facebook Graph API) — optional
WHATSAPP_PHONE_ID=your-phone-number-id
WHATSAPP_TOKEN=your-bearer-token

# AI (optional)
OPENAI_API_KEY=sk-your-key
```

Frontend env (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000
```

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
