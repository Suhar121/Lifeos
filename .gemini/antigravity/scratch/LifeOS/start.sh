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

# Start the application with Gunicorn
echo "Starting application with Gunicorn..."
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
