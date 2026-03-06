# Ashwini Patient Mobile - GitHub Actions Setup

## Secrets Configuration

To build the Android app via GitHub Actions, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **VITE_API_BASE_URL**
   - Go to: Repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VITE_API_BASE_URL`
   - Value: Your deployed backend API URL (e.g., `https://your-backend.onrender.com`)

### Optional: Signed Release APK

If you want to build signed release APKs (for Play Store), add these secrets:

2. **ANDROID_KEYSTORE_BASE64**
   - Your keystore file encoded in base64
   - Generate: `base64 -i your-keystore.jks | tr -d '\n'` (Linux/Mac)
   - Or: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("your-keystore.jks"))` (PowerShell)

3. **KEYSTORE_PASSWORD**
   - Your keystore password

4. **KEY_ALIAS**
   - Your key alias

5. **KEY_PASSWORD**
   - Your key password

## How to Get the APK

After pushing code to GitHub:

1. Go to the "Actions" tab in your repository
2. Click on the latest "Build Android APK" workflow run
3. Scroll down to "Artifacts"
4. Download `ashwini-patient-debug.apk`

## Installing the APK

### On Physical Device:
1. Download the APK to your device
2. Go to Settings → Security → Enable "Install from unknown sources"
3. Open the APK file and tap Install

### On Emulator:
1. Drag and drop the APK file onto the emulator window

## Automatic Builds

The workflow automatically runs when:
- Code is pushed to `main`, `master`, or `develop` branches
- A pull request is opened/updated
- You manually trigger it via "Actions" tab → "Run workflow"

## Troubleshooting

### Build fails with "SDK not found"
- The workflow automatically installs Android SDK, but if it fails, check the Android SDK setup step

### Build fails with Gradle errors
- Check that all dependencies in `package.json` are correct
- Ensure Android build tools are compatible

### APK not appearing in artifacts
- Check the "Build Android Debug APK" step logs
- Ensure the build completed successfully

## Local Testing

Before pushing to GitHub, test locally:

```bash
cd frontend-patient-mobile
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`
