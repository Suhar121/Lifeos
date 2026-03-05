#!/bin/bash

# Start Cloudflare Tunnel for LifeOS
# Make sure you've completed the setup steps first!

set -e

echo "🚀 Starting Cloudflare Tunnel for LifeOS..."
echo ""

# Check if config file exists
if [ ! -f "cloudflare-tunnel-config.yml" ]; then
    echo "❌ Error: cloudflare-tunnel-config.yml not found!"
    echo "Please run ./cloudflare-setup.sh first"
    exit 1
fi

# Check if backend is running
if ! curl -s http://localhost:8000/docs > /dev/null; then
    echo "⚠️  Warning: Backend (port 8000) doesn't seem to be running"
    echo "Start it with: uvicorn app.main:app --reload"
    echo ""
fi

# Check if frontend is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "⚠️  Warning: Frontend (port 5173) doesn't seem to be running"
    echo "Start it with: cd frontend && npm run dev"
    echo ""
fi

echo "Starting tunnel..."
cloudflared tunnel --config cloudflare-tunnel-config.yml run lifebuddy
