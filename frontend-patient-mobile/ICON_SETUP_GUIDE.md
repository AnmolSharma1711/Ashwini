# Icon Setup for Mobile App

## Required Image

Create a **1024x1024 PNG** image for your app icon with:
- Transparent or solid background
- Your logo/branding centered
- High resolution
- PNG format

## Where to Place Your Icon

### Step 1: Add Source Icon
Place your icon here:
```
frontend-patient-mobile/public/icon.png
```

### Step 2: Install Capacitor Assets Tool
```bash
cd frontend-patient-mobile
npm install -g @capacitor/assets
```

### Step 3: Generate All Icon Sizes
```bash
npx @capacitor/assets generate --iconBackgroundColor '#667eea' --iconBackgroundColorDark '#667eea'
```

This will automatically create all required Android icon sizes in the correct folders.

## Manual Method (If Automatic Fails)

If the automatic tool doesn't work, you can manually create icons:

### Android Icons Required

Place icons in `android/app/src/main/res/`:

```
mipmap-mdpi/ic_launcher.png        (48x48)
mipmap-hdpi/ic_launcher.png        (72x72)
mipmap-xhdpi/ic_launcher.png       (96x96)
mipmap-xxhdpi/ic_launcher.png      (144x144)
mipmap-xxxhdpi/ic_launcher.png     (192x192)
```

You can use online tools like:
- https://icon.kitchen/
- https://appicon.co/
- https://makeappicon.com/

Upload your 1024x1024 icon and download the Android icon pack.

## Web Favicon

Place a 32x32 PNG as:
```
frontend-patient-mobile/public/favicon.ico
```

## Current Status

I've created the icon setup guide. Once you have your icon image ready:

1. Save it as `icon.png` in `frontend-patient-mobile/public/`
2. Run the generate command above
3. Rebuild and redeploy the app

Let me know when you have the icon ready and I'll help you generate all the sizes!
