#!/usr/bin/env bash
# Startup script for Render deployment
# This ensures migrations and superuser setup run before starting the server

set -e  # Exit on error

# Change to backend directory if not already there
if [ -d "backend" ]; then
    cd backend
fi

echo "========================================"
echo "Starting Ashwini Backend"
echo "Current directory: $(pwd)"
echo "========================================"

# Run migrations
echo ""
echo "Running database migrations..."

# Fix for migration conflict: Fake old 0002_initial migrations if they exist in DB history
echo "Checking for migration conflicts..."
python manage.py migrate devices 0002_initial --fake 2>/dev/null || echo "devices.0002_initial not in migration history"
python manage.py migrate measurements 0002_initial --fake 2>/dev/null || echo "measurements.0002_initial not in migration history"

# Now run migrations normally
python manage.py migrate --no-input
echo "✓ Migrations completed"

# Create/update superuser
echo ""
echo "=== Superuser Configuration ==="
echo "Username: ${DJANGO_SUPERUSER_USERNAME:-admin}"
echo "Email: ${DJANGO_SUPERUSER_EMAIL:-admin@ashwini.com}"
if [ -z "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Password set: No"
    echo "⚠️  WARNING: DJANGO_SUPERUSER_PASSWORD not set!"
else
    echo "Password set: Yes (${#DJANGO_SUPERUSER_PASSWORD} characters)"
    python manage.py create_default_superuser
fi
echo "========================================"

echo ""
echo "Starting Gunicorn server on port ${PORT:-8000}..."
exec gunicorn ashwini_backend.wsgi \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --timeout 120 \
    --log-file - \
    --access-logfile - \
    --error-logfile - \
    --log-level info
