#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Create media directory for file uploads
mkdir -p media/reports

# Run database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input
