#!/bin/bash

# Serve the built frontend for production

cd "$(dirname "$0")"

echo "🚀 Starting LifeOS Frontend Production Server..."
echo ""

# Use the SPA-aware Python server
python3 serve-spa.py
