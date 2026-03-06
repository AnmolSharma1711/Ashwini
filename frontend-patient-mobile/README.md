# Ashwini Patient Portal - Mobile App

Mobile Android application for the Ashwini Patient Portal built with React, Vite, and Capacitor.

**Important:** Make sure `VITE_API_BASE_URL` is set to your deployed backend URL in GitHub Secrets.

## Features

- 📱 Native Android app experience
- 🔔 Push notifications support
- 📊 Real-time health metrics monitoring
- 🔐 Secure authentication with JWT
- 📈 Health progress tracking
- 💊 Prescription management
- 📅 Appointment scheduling

## Prerequisites

- Node.js (v18 or higher)
- Android Studio (for Android development)
- JDK 17 or higher

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `VITE_API_BASE_URL` to your backend URL.

3. **Build the web assets:**
   ```bash
   npm run build
   ```

4. **Sync with Capacitor:**
   ```bash
   npm run sync
   ```

5. **Open in Android Studio:**
   ```bash
   npm run android
   ```

## Development

### Running the dev server (web mode):
```bash
npm run dev
```

### Building for production:
```bash
npm run build
npm run sync
```

### Testing on Android:
```bash
npm run android
```

This will:
1. Sync the web assets to Android
2. Open Android Studio
3. From Android Studio, click "Run" to deploy to emulator or device

## Building APK for Release

### Via GitHub Actions:
Push your changes to GitHub, and the GitHub Actions workflow will automatically build the APK.

### Manual build:
1. Open the project in Android Studio:
   ```bash
   npm run android
   ```

2. In Android Studio:
   - Go to `Build > Generate Signed Bundle / APK`
   - Select `APK`
   - Follow the wizard to create/select a keystore
   - Build the release APK

## Project Structure

```
frontend-patient-mobile/
├── android/              # Native Android project (generated)
├── dist/                 # Built web assets
├── public/              # Static assets
├── src/
│   ├── api/             # API client and configuration
│   ├── components/      # Reusable components
│   ├── context/         # React context providers
│   ├── pages/           # Page components
│   └── routes/          # Route configuration
├── capacitor.config.json # Capacitor configuration
├── package.json
└── vite.config.js
```

## API Configuration

The app communicates with the backend API. Make sure to:

1. Set the correct `VITE_API_BASE_URL` in your `.env` file
2. Ensure your backend allows CORS from mobile app requests
3. Backend should be accessible from your mobile device/emulator

## Troubleshooting

### Android Build Issues:
- Ensure Android Studio is properly installed
- Check that JDK 17+ is installed and configured
- Run `npx cap sync android` to sync changes

### API Connection Issues:
- Check your `.env` file has the correct API URL
- For local development, use your computer's IP address instead of `localhost`
- Ensure backend CORS settings allow mobile requests

## GitHub Actions

The repository includes a GitHub Actions workflow that automatically:
- Builds the React app
- Syncs with Capacitor
- Builds the Android APK
- Uploads the APK as an artifact

See `.github/workflows/android-build.yml` for details.

## License

See LICENSE file in the root directory.
