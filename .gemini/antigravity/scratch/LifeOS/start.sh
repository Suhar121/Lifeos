#!/bin/bash

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting application with Gunicorn..."
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
