#!/bin/bash

# LifeOS - Stop All Services

echo "🛑 Stopping LifeOS services..."
echo ""

# Stop Backend
if pgrep -f "uvicorn.*app.main:app" > /dev/null; then
    echo "Stopping Backend..."
    pkill -f "uvicorn.*app.main:app"
    echo "✅ Backend stopped"
else
    echo "⏭️  Backend not running"
fi

# Stop Frontend
if pgrep -f "serve-spa.py" > /dev/null; then
    echo "Stopping Frontend..."
    pkill -f "serve-spa.py"
    echo "✅ Frontend stopped"
else
    echo "⏭️  Frontend not running"
fi

# Stop Cloudflare Tunnel
if pgrep -f "cloudflared" > /dev/null; then
    echo "Stopping Cloudflare Tunnel..."
    pkill -f "cloudflared"
    echo "✅ Tunnel stopped"
else
    echo "⏭️  Tunnel not running"
fi

echo ""
echo "✨ All services stopped!"
