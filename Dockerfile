# ============================================================
# Stage 1 — Build the React frontend
# ============================================================
FROM node:18-alpine AS frontend-build

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./

ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ============================================================
# Stage 2 — Python backend + compiled frontend
# ============================================================
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY app/  /code/app/
COPY serve-spa.py start.sh /code/

# Copy built frontend from stage 1
COPY --from=frontend-build /frontend/dist /code/frontend/dist

# Make scripts executable
RUN chmod +x /code/start.sh

# Expose ports (backend + frontend SPA)
ARG BACKEND_PORT=8000
ARG FRONTEND_PORT=5173
EXPOSE ${BACKEND_PORT} ${FRONTEND_PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:${BACKEND_PORT}/docs || exit 1

# Default command — start the backend via Gunicorn
CMD ["/code/start.sh"]
