# Ashwini Patient Mobile - Quick Setup Script for Windows

Write-Host "🏥 Ashwini Patient Mobile - Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Check if in correct directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the frontend-patient-mobile directory" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🔧 Creating environment file..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env and set your VITE_API_BASE_URL" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🏗️  Building React app..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "📱 Initializing Capacitor Android platform..." -ForegroundColor Yellow
if (!(Test-Path "android")) {
    npx cap add android
    Write-Host "✅ Android platform added" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Android platform already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🔄 Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure you have Android Studio installed"
Write-Host "2. Edit .env file with your backend API URL"
Write-Host "3. Run 'npm run android' to open in Android Studio"
Write-Host "4. Click 'Run' in Android Studio to build and deploy to device/emulator"
Write-Host ""
Write-Host "📚 See README.md for more information" -ForegroundColor Cyan
