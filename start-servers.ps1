# Project Ashwini - Start All Servers
# This script starts all three servers in separate terminal windows

$baseDir = "d:\Ashwini"

Write-Host "Starting Project Ashwini servers..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; .\venv\Scripts\Activate; python manage.py runserver 0.0.0.0:8000"

Start-Sleep -Seconds 2

# Start Main Frontend
Write-Host "Starting Main Frontend (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend-main'; npm start"

Start-Sleep -Seconds 2

# Start Unified Frontend
Write-Host "Starting Unified Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend-unified'; npm start"

Write-Host ""
Write-Host "All servers starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:8000/api/" -ForegroundColor White
Write-Host "  Django Admin: http://localhost:8000/admin" -ForegroundColor White
Write-Host "  Main Frontend: http://localhost:4000" -ForegroundColor White
Write-Host "  Doctor Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Wait a few seconds for all servers to start..." -ForegroundColor Yellow
Write-Host ""
