# Quick Setup Guide

## Step 1: Add Your App Icon

Place your app icon here:
📁 **`frontend-patient-mobile/public/assets/icon.png`**

**Requirements:**
- Size: 1024x1024 pixels (or at least 512x512)
- Format: PNG
- Square image with your logo/brand

## Step 2: After Adding the Icon

Once you've placed `icon.png` in the assets folder:

```powershell
# Navigate to mobile app folder
cd frontend-patient-mobile

# Build the app with your new icon
npm run build

# Sync with Capacitor (generates Android icons)
npx cap sync android

# Go back to root
cd ..

# Commit and push
git add .
git commit -m "Add app icon"
git push
```

## Step 3: Download New APK

- Go to GitHub Actions
- Wait for build to complete
- Download and install the new APK
- Your icon will now appear on your phone! 🎉

## Optional: Add Splash Screen

If you also want a splash screen, place it here:
📁 **`frontend-patient-mobile/public/assets/splash.png`**

- Size: 2732x2732 pixels
- Format: PNG
- Your logo centered with padding

Then follow the same build/push steps above.
