# LifeOS - AI Personal Life Optimization System

LifeOS is a premium lifestyle wellness web application for ambitious users who want to optimize their daily life.
It tracks mood, sleep, focus, productivity, habits, and medications, using AI to provide performance insights and weekly reports.

## ✨ V2 Redesign Features

- **Gamified Daily Check-in**: A multi-step wizard with emoji feedback and confetti celebrations.
- **Advanced Habits**: Streak tracking, weekly heatmap dots, and category filtering.
- **Calendar & Medicine Tracking**: Schedule events, track medications, and receive browser notifications for reminders.
- **Life Score & AI Reports**: Visual life score tracking and weekly AI-generated lifestyle analysis.

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

## 🔒 Environment Variables

Create a `.env` file in the root directory:
```env
# Backend
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///./lifeos.db
OPENAI_API_KEY=your_openai_key

# Frontend (in frontend/.env)
VITE_API_URL=http://localhost:8000
```
