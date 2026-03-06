#!/usr/bin/env bash

# Ashwini Patient Mobile - Quick Setup Script

set -e

echo "🏥 Ashwini Patient Mobile - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend-patient-mobile directory"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Creating environment file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env and set your VITE_API_BASE_URL"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "🏗️  Building React app..."
npm run build

echo ""
echo "📱 Initializing Capacitor Android platform..."
if [ ! -d "android" ]; then
    npx cap add android
    echo "✅ Android platform added"
else
    echo "ℹ️  Android platform already exists"
fi

echo ""
echo "🔄 Syncing Capacitor..."
npx cap sync android

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure you have Android Studio installed"
echo "2. Edit .env file with your backend API URL"
echo "3. Run 'npm run android' to open in Android Studio"
echo "4. Click 'Run' in Android Studio to build and deploy to device/emulator"
echo ""
echo "📚 See README.md for more information"
