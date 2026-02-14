# LifeOS - AI Personal Life Optimization System

LifeOS is a premium lifestyle wellness web application for ambitious users who want to optimize their daily life.
It tracks mood, sleep, focus, productivity, and habits, and uses AI to provide performance insights.

## Project Structure

- `app/`: Backend (FastAPI, PostgreSQL)
- `frontend/`: Frontend (React, Vite, TailwindCSS)

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL

### Installation

1. **Backend**
   ```bash
   # From project root (LifeOS/)
   cd app
   python -m venv venv
   # Activate venv:
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   pip install -r requirements.txt
   cd ..
   # Run from root to resolve imports correctly
   uvicorn app.main:app --reload
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
