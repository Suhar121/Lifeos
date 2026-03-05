#!/bin/bash

# LifeOS - Check Service Status

# Load .env if exists
if [ -f "$(dirname "$0")/.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

echo "🔍 LifeOS Service Status"
echo "========================"
echo ""

# Backend
echo "1️⃣  Backend (Port ${BACKEND_PORT})"
if pgrep -f "uvicorn.*app.main:app" > /dev/null; then
    echo "   Status: ✅ Running (PID: $(pgrep -f 'uvicorn.*app.main:app'))"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${BACKEND_PORT}/docs)
    if [ "$STATUS" == "200" ]; then
        echo "   Health: ✅ Responding"
    else
        echo "   Health: ⚠️  Not responding (HTTP $STATUS)"
    fi
else
    echo "   Status: ❌ Not running"
fi
echo ""

# Frontend
echo "2️⃣  Frontend (Port ${FRONTEND_PORT})"
if pgrep -f "serve-spa.py" > /dev/null; then
    echo "   Status: ✅ Running (PID: $(pgrep -f 'serve-spa.py'))"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT})
    if [ "$STATUS" == "200" ]; then
        echo "   Health: ✅ Responding"
    else
        echo "   Health: ⚠️  Not responding (HTTP $STATUS)"
    fi
else
    echo "   Status: ❌ Not running"
fi
echo ""

# Cloudflare Tunnel
echo "3️⃣  Cloudflare Tunnel"
if pgrep -f "cloudflared" > /dev/null; then
    echo "   Status: ✅ Running (PID: $(pgrep -f 'cloudflared'))"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://lifebuddy.dpdns.org/ 2>/dev/null)
    if [ "$STATUS" == "200" ]; then
        echo "   Health: ✅ Public domain accessible"
    else
        echo "   Health: ⚠️  Domain not responding (HTTP $STATUS)"
    fi
else
    echo "   Status: ❌ Not running"
fi
echo ""

# Database
echo "4️⃣  PostgreSQL Database"
if command -v psql > /dev/null; then
    if PGPASSWORD=Suharshr@99 psql -h localhost -U lifeos_user -d lifeos_db -c "SELECT 1" > /dev/null 2>&1; then
        echo "   Status: ✅ Connected"
    else
        echo "   Status: ⚠️  Cannot connect"
    fi
else
    echo "   Status: ⚠️  psql not found"
fi
echo ""

echo "========================"
echo "📍 Access URLs:"
echo "   Local:  http://localhost:${FRONTEND_PORT}"
echo "   Public: https://lifebuddy.dpdns.org"
echo "   API:    http://localhost:${BACKEND_PORT}/docs"
