# Quick Setup Script for Report Analysis Feature

Write-Host "Setting up Medical Report Analysis Feature..." -ForegroundColor Green
Write-Host ""

# Navigate to backend
Set-Location -Path "backend"

Write-Host "1. Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host ""
Write-Host "2. Creating .env file if it doesn't exist..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "   Created .env file. Please edit it with your Azure credentials!" -ForegroundColor Cyan
    Write-Host "   See AZURE_SETUP.md for instructions." -ForegroundColor Cyan
} else {
    Write-Host "   .env file already exists." -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Creating media directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "media" | Out-Null
Write-Host "   Media directory created." -ForegroundColor Green

Write-Host ""
Write-Host "4. Creating database migrations..." -ForegroundColor Yellow
python manage.py makemigrations reports
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Migrations created successfully." -ForegroundColor Green
} else {
    Write-Host "   Failed to create migrations. Check for errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Applying migrations..." -ForegroundColor Yellow
python manage.py migrate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Migrations applied successfully." -ForegroundColor Green
} else {
    Write-Host "   Failed to apply migrations. Check for errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your Azure Document Intelligence credentials" -ForegroundColor White
Write-Host "2. Follow AZURE_SETUP.md to get your Azure credentials" -ForegroundColor White
Write-Host "3. Start the backend: python manage.py runserver" -ForegroundColor White
Write-Host "4. Start the frontend: cd ../frontend-main && npm start" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see REPORT_ANALYSIS_GUIDE.md" -ForegroundColor Cyan
