#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Create media directory for file uploads
mkdir -p media/reports

# Collect static files (no database required)
python manage.py collectstatic --no-input

echo "Build completed successfully!"
echo "Database migrations will run at startup when database is accessible."
