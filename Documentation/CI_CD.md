# CI/CD Implementation Guide

## Overview

Project Ashwini implements Continuous Integration and Continuous Deployment (CI/CD) practices to automate builds, testing, and deployments. This document details the current CI/CD implementation and future enhancement opportunities.

---

## Current CI/CD Implementation

### 1. GitHub Actions - Android Build Pipeline

**File Location**: `.github/workflows/android-build.yml`

#### Purpose
Automates the build process for the Patient Mobile Android application.

#### Triggers
- **Push Events**: Automatically triggers on push to `main`, `master`, or `develop` branches
- **Pull Requests**: Triggers on PRs to `main` or `master` branches
- **Path Filters**: Only runs when files in `frontend-patient-mobile/**` are changed
- **Manual Dispatch**: Can be triggered manually via GitHub Actions UI

#### Workflow Steps

1. **Environment Setup**
   - Checks out code from repository
   - Sets up Node.js 18 with npm caching
   - Configures Java JDK 17 (Temurin distribution)
   - Installs Android SDK

2. **Dependency Installation**
   - Runs `npm ci` to install dependencies from lockfile
   - Creates `.env` file with API base URL from GitHub Secrets

3. **Build Process**
   - Builds React app with `npm run build`
   - Installs Capacitor CLI globally
   - Initializes Android platform (if not present)
   - Generates Android icons from `resources/icon.png`
   - Syncs Capacitor with `npx cap sync android`

4. **Android Compilation**
   - Grants execute permission for gradlew
   - Builds debug APK using Gradle: `./gradlew assembleDebug`

5. **Artifact Management**
   - Uploads APK as GitHub Actions artifact
   - Retention period: 30 days
   - Artifact name: `ashwini-patient-app`

6. **PR Integration**
   - Automatically comments on pull requests with download link
   - Provides installation instructions for testing

#### Required Secrets

Configure these in GitHub Repository Settings → Secrets and variables → Actions:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL (e.g., https://your-backend.onrender.com) | ✅ Yes |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded keystore for signed releases | ⬜ Optional |
| `KEYSTORE_PASSWORD` | Keystore password | ⬜ Optional |
| `KEY_ALIAS` | Key alias | ⬜ Optional |
| `KEY_PASSWORD` | Key password | ⬜ Optional |

#### Accessing Build Artifacts

1. Navigate to the **Actions** tab in GitHub repository
2. Click on the latest "Build Android APK" workflow run
3. Scroll to **Artifacts** section at the bottom
4. Download `ashwini-patient-app.zip`
5. Extract to get `app-debug.apk`

#### Installation on Device

**Physical Device:**
```
1. Download APK from GitHub artifacts
2. Enable "Install from unknown sources" in device settings
3. Transfer APK to device
4. Tap to install
```

**Android Emulator:**
```
1. Download APK
2. Drag and drop onto running emulator window
3. APK installs automatically
```

---

### 2. Render.com - Backend Auto-Deploy

**File Location**: `render.yaml`

#### Purpose
Infrastructure as Code (IaC) configuration for automated backend deployment on Render.com platform.

#### Configuration Details

**Service Type**: Web Service  
**Runtime**: Python  
**Plan**: Free tier (upgradable to Starter or higher)

#### Build Configuration

- **Build Command**: `cd backend && bash build.sh`
  - Installs Python dependencies from `requirements.txt`
  - Collects static files with Whitenoise
  - Runs database migrations
  - Creates necessary directories

- **Start Command**: `bash backend/start.sh`
  - Starts Gunicorn WSGI server
  - Binds to `0.0.0.0:8000`

#### Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `PYTHON_VERSION` | Hardcoded | Set to 3.11.12 |
| `DJANGO_SETTINGS_MODULE` | Hardcoded | Points to settings file |
| `DEBUG` | Hardcoded | Set to False for production |
| `SECRET_KEY` | Auto-generated | Secure random key by Render |
| `ALLOWED_HOSTS` | Manual | Set to your Render domain |
| `CORS_ALLOW_ALL_ORIGINS` | Hardcoded | Set to False for security |
| `DATABASE_URL` | From Database | PostgreSQL connection string |

#### Database Configuration

- **Database Type**: PostgreSQL
- **Plan**: Free tier
- **Database Name**: ashwini
- **User**: ashwini
- **Connection**: Automatic via `DATABASE_URL` environment variable

#### Deployment Flow

1. Push code to connected GitHub branch (typically `main`)
2. Render detects changes automatically
3. Runs `build.sh` script:
   - Upgrades pip
   - Installs dependencies
   - Runs migrations
   - Collects static files
4. Starts application with `start.sh`
5. Performs health check at `/api/health/`
6. Routes traffic to new deployment

#### Health Monitoring

- **Health Check Path**: `/api/health/`
- **Auto-healing**: Render automatically restarts failed services
- **Zero-downtime**: Automatic rollback on failed health checks

---

### 3. Vercel - Frontend Auto-Deploy

**File Locations**: 
- `frontend-main/vercel.json`
- `frontend-patient/vercel.json`
- `frontend-unified/vercel.json`

#### Purpose
Automated deployment and hosting for all three React frontends.

#### Current Deployments

| Frontend | URL | Description |
|----------|-----|-------------|
| Reception Portal | https://ashwini-frontend-main.vercel.app | Registration & Health Monitoring |
| Doctor's Portal | https://ashwini-unified-view.vercel.app | Unified Patient View |
| Patient Portal | https://ashwini-patient.vercel.app | Patient Self-Service Portal |

#### Configuration Details

**Frontend-Main (Reception Portal)**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "src": "/static/(.*)", "dest": "/static/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**Frontend-Patient (Patient Portal)**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Deployment Features

**Automatic Deployments:**
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments
- Pull requests → Automatic preview URLs

**Preview Deployments:**
- Unique URL for every PR
- Automatic comments on PRs with preview link
- Independent environment for testing

**Environment Variables:**
- Set in Vercel dashboard
- Different values per environment (production/preview)
- Example: `REACT_APP_API_URL` or `VITE_API_BASE_URL`

**Build Optimization:**
- Automatic CDN distribution
- Edge caching for static assets
- Instant cache invalidation on new deploys

#### Deployment Flow

1. Push code to GitHub repository
2. Vercel webhook triggers automatically
3. Installs dependencies (`npm install`)
4. Runs build command (`npm run build`)
5. Deploys to Vercel global CDN
6. Assigns URL (production or preview)
7. Posts comment on PR (if applicable)

---

## CI/CD Maturity Assessment

### ✅ Currently Implemented

| Component | Status | Description |
|-----------|--------|-------------|
| **Mobile Build Automation** | ✅ Active | GitHub Actions builds Android APK |
| **Backend Auto-Deploy** | ✅ Active | Render deploys on git push |
| **Frontend Auto-Deploy** | ✅ Active | Vercel deploys all 3 frontends |
| **Artifact Storage** | ✅ Active | APK stored for 30 days |
| **PR Preview Environments** | ✅ Active | Vercel creates preview URLs |
| **Infrastructure as Code** | ✅ Active | render.yaml and vercel.json |

### ⬜ Not Yet Implemented

| Component | Priority | Description |
|-----------|----------|-------------|
| **Automated Testing** | High | Unit, integration, and E2E tests |
| **Code Quality Checks** | High | Linting, formatting validation |
| **Security Scanning** | High | Dependency vulnerability checks |
| **Code Coverage** | Medium | Coverage reports and thresholds |
| **Backend CI Pipeline** | High | Django test suite automation |
| **Frontend CI Pipelines** | High | React app testing and linting |
| **Staging Environment** | Medium | Pre-production testing environment |
| **Release Automation** | Medium | Semantic versioning and changelogs |
| **Performance Testing** | Low | Load testing and benchmarks |
| **Database Migration Testing** | Medium | Safe migration validation |

### Current Maturity Level: ~30%

**Strong Points:**
- Continuous Deployment (CD) is well-established
- Automatic builds and deployments working
- Preview environments available

**Improvement Areas:**
- Limited Continuous Integration (CI) practices
- No automated testing
- No quality gates before deployment
- Manual code review only safeguard

---

## Future Enhancements

### Phase 1: Testing & Quality (Priority: High)

#### Backend Testing Pipeline
```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-django pytest-cov flake8 black
      - name: Lint with flake8
        run: cd backend && flake8 . --max-line-length=100
      - name: Check formatting with black
        run: cd backend && black . --check
      - name: Run tests
        run: |
          cd backend
          pytest --cov=. --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

#### Frontend Testing Pipeline
```yaml
# .github/workflows/frontend-ci.yml
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend-*/**'
  pull_request:
    branches: [main]

jobs:
  test:
    strategy:
      matrix:
        frontend: [frontend-main, frontend-patient, frontend-unified]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd ${{ matrix.frontend }} && npm ci
      - name: Lint
        run: cd ${{ matrix.frontend }} && npm run lint
      - name: Run tests
        run: cd ${{ matrix.frontend }} && npm test -- --coverage
      - name: Build
        run: cd ${{ matrix.frontend }} && npm run build
```

### Phase 2: Security Scanning

#### Dependabot Configuration
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/frontend-main"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/frontend-patient"
    schedule:
      interval: "weekly"
```

#### Security Scanning Workflow
```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Bandit (Python)
        run: |
          pip install bandit
          cd backend && bandit -r . -f json -o bandit-report.json
      - name: Run npm audit (Node)
        run: |
          cd frontend-main && npm audit
```

### Phase 3: Advanced Features

**Staging Environment:**
- Separate Render service for staging
- Automatic deployment from `develop` branch
- Integration testing against staging

**Release Automation:**
- Semantic versioning with semantic-release
- Automated changelog generation
- Git tags on releases
- Play Store upload automation

**Monitoring & Alerts:**
- Sentry for error tracking
- Uptime monitoring (UptimeRobot)
- Slack/Discord notifications
- Performance monitoring

---

## Best Practices

### Branch Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/*, fix/*, hotfix/*
```

**Rules:**
- `main` → Only production-ready code
- `develop` → Integration branch for testing
- Feature branches → Development work
- Direct commits to `main` blocked
- Require PR reviews before merge

### Quality Gates

**Pre-merge Requirements:**
- ✅ All CI checks pass
- ✅ Code coverage ≥ 70%
- ✅ No security vulnerabilities
- ✅ At least 1 approval
- ✅ All conversations resolved

### Deployment Strategy

**Development Flow:**
```
1. Develop feature in branch
2. Create PR → Triggers CI + preview deploy
3. Review + test on preview environment
4. Merge to develop → Deploys to staging
5. Test on staging
6. Merge to main → Deploys to production
```

---

## Monitoring & Maintenance

### Build Status

Check GitHub Actions tab for:
- Recent workflow runs
- Success/failure status
- Build logs and errors
- Artifact downloads

### Deployment Health

**Render Dashboard:**
- Service status and logs
- Deploy history
- Resource usage
- Health check status

**Vercel Dashboard:**
- Deployment history
- Build logs
- Analytics and performance
- Preview deployments

### Troubleshooting

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Build fails on GitHub Actions | Check logs, verify dependencies, test locally |
| Render deployment fails | Check build.sh script, verify environment variables |
| Vercel build fails | Check build command, verify package.json scripts |
| APK not generated | Check Android SDK setup, Gradle configuration |
| Health check fails | Verify /api/health/ endpoint, check database connection |

---

## Additional Resources

### Documentation References
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render.com Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)

### Related Project Documentation
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Pre-deploy checklist
- [ANDROID_BUILD_SETUP.md](../.github/ANDROID_BUILD_SETUP.md) - Android secrets setup
- [MOBILE_APP_SUMMARY.md](MOBILE_APP_SUMMARY.md) - Mobile app overview

---

## Summary

Project Ashwini has established a solid foundation for CI/CD with automated deployments for all components. The current implementation focuses on Continuous Deployment (CD), with opportunities to enhance Continuous Integration (CI) through automated testing, code quality checks, and security scanning.

The existing infrastructure enables rapid deployment while maintaining stability through platform-native health checks and automatic rollbacks. Future enhancements will add comprehensive testing and quality gates to further improve reliability and code quality.
