# App Icon Setup

## Required Icon Files

Place your icon files in this directory (`frontend-patient-mobile/public/assets/`):

### 1. **icon.png** (Required)
- **Size:** 1024x1024 pixels (minimum 512x512)
- **Format:** PNG with transparent background (or solid background)
- **Purpose:** Main app icon, Android launcher icon
- **Naming:** Must be named exactly `icon.png`

### 2. **splash.png** (Optional)
- **Size:** 2732x2732 pixels (recommended)
- **Format:** PNG
- **Purpose:** Splash screen shown when app launches
- **Naming:** Must be named exactly `splash.png`

## Image Requirements

- **App Icon (icon.png)**:
  - Square image
  - High resolution (1024x1024 is best)
  - Clear and recognizable
  - Looks good when scaled down to 48x48
  - Avoid tiny details that won't be visible when small

- **Splash Screen (splash.png)**:
  - Large square canvas
  - Center your logo/icon in the middle
  - Leave ~20% padding on all sides
  - Background should match your app theme

## What Happens Next

After you place `icon.png` in this folder:
1. Capacitor will auto-generate all required Android icon sizes
2. The icon will appear on home screen when app is installed
3. The icon will show in app switcher
4. The icon will be used in notifications

## Example File Structure

```
frontend-patient-mobile/
└── public/
    └── assets/
        ├── icon.png          ← Your 1024x1024 app icon (REQUIRED)
        ├── splash.png        ← Your splash screen (optional)
        └── ICON_INSTRUCTIONS.md
```

## Testing Your Icon

After adding the icon:
1. Run: `npm run build`
2. Run: `npx cap sync android`
3. Rebuild the APK via GitHub Actions or locally
4. The new icon will appear on your phone!
