# Project Ashwini - Setup Script for Windows
# Run this script to set up the entire project

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Project Ashwini - Automated Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "d:\Ashwini"

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "[OK] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python not found. Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Please install Node.js 16+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 1: Backend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Set-Location "$baseDir\backend"

# Create virtual environment
Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate

Write-Host "[OK] Backend setup complete!" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 2: Main Frontend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Set-Location "$baseDir\frontend-main"

Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

Write-Host "[OK] Main Frontend setup complete!" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 3: Unified Frontend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Set-Location "$baseDir\frontend-unified"

Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

Write-Host "[OK] Unified Frontend setup complete!" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create Django admin user:" -ForegroundColor White
Write-Host "   cd $baseDir\backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate" -ForegroundColor Gray
Write-Host "   python manage.py createsuperuser" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the servers (in separate terminals):" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 - Backend:" -ForegroundColor Cyan
Write-Host "   cd $baseDir\backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate" -ForegroundColor Gray
Write-Host "   python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 - Main Frontend:" -ForegroundColor Cyan
Write-Host "   cd $baseDir\frontend-main" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 3 - Unified Frontend:" -ForegroundColor Cyan
Write-Host "   cd $baseDir\frontend-unified" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access the applications:" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000/api/" -ForegroundColor Gray
Write-Host "   Django Admin: http://localhost:8000/admin" -ForegroundColor Gray
Write-Host "   Main Frontend: http://localhost:4000" -ForegroundColor Gray
Write-Host "   Doctor Dashboard: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
