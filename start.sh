#!/bin/bash

# LifeOS Start Script (Production with Gunicorn)
# For development, use: uvicorn app.main:app --reload

cd "$(dirname "$0")"

# Run database migrations
echo "Running database migrations..."
cd app
source vevn/bin/activate
alembic upgrade head
cd ..

# Read config from .env
BACKEND_HOST=${BACKEND_HOST:-0.0.0.0}
BACKEND_PORT=${BACKEND_PORT:-8000}

# Start the application with Gunicorn
echo "Starting application with Gunicorn on ${BACKEND_HOST}:${BACKEND_PORT}..."
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind ${BACKEND_HOST}:${BACKEND_PORT}
