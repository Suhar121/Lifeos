#!/bin/bash

# LifeOS - Start All Services
# This script starts Backend, Frontend, and Cloudflare Tunnel

set -e

PROJECT_ROOT="${LIFEOS_PROJECT_ROOT:-$(cd "$(dirname "$0")" && pwd)}"
cd "$PROJECT_ROOT"

# Load .env if exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

BACKEND_HOST=${BACKEND_HOST:-0.0.0.0}
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

echo "🚀 Starting LifeOS..."
echo "===================="
echo ""

# Function to check if a process is running
check_running() {
    if pgrep -f "$1" > /dev/null; then
        echo "✅ $2 is already running"
        return 0
    else
        echo "⏳ Starting $2..."
        return 1
    fi
}

# 1. Start Backend
echo "1️⃣  Backend (FastAPI)"
if ! check_running "uvicorn.*app.main:app" "Backend"; then
    source app/vevn/bin/activate
    nohup uvicorn app.main:app --host ${BACKEND_HOST} --port ${BACKEND_PORT} > app/backend.log 2>&1 &
    sleep 2
    if curl -s http://localhost:${BACKEND_PORT}/docs > /dev/null; then
        echo "✅ Backend started successfully"
    else
        echo "❌ Backend failed to start. Check app/backend.log"
    fi
fi
echo ""

# 2. Start Frontend
echo "2️⃣  Frontend (React SPA)"
if ! check_running "serve-spa.py" "Frontend"; then
    nohup python3 serve-spa.py > frontend-server.log 2>&1 &
    sleep 2
    if curl -s http://localhost:${FRONTEND_PORT} > /dev/null; then
        echo "✅ Frontend started successfully"
    else
        echo "❌ Frontend failed to start. Check frontend-server.log"
    fi
fi
echo ""

# 3. Start Cloudflare Tunnel
echo "3️⃣  Cloudflare Tunnel"
if ! check_running "cloudflared" "Tunnel"; then
    nohup ./start-tunnel.sh > tunnel.log 2>&1 &
    sleep 3
    if pgrep -f cloudflared > /dev/null; then
        echo "✅ Tunnel started successfully"
    else
        echo "❌ Tunnel failed to start. Check tunnel.log"
    fi
fi
echo ""

echo "===================="
echo "✨ All services started!"
echo ""
echo "📍 Access your app at:"
echo "   Local:  http://localhost:${FRONTEND_PORT}"
echo "   Public: https://lifebuddy.dpdns.org"
echo ""
echo "📚 API Documentation: http://localhost:${BACKEND_PORT}/docs"
echo ""
echo "📋 View logs:"
echo "   Backend:  tail -f app/backend.log"
echo "   Frontend: tail -f frontend-server.log"
echo "   Tunnel:   tail -f tunnel.log"
echo ""
echo "🛑 To stop all services: ./stop-all.sh"
