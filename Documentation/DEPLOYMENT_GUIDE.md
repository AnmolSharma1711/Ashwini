# 🚀 Ashwini Healthcare System - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Files Ready for GitHub Push
- [x] Backend deployment configuration (`render.yaml`, `build.sh`, `start.sh`, `runtime.txt`)
- [x] Frontend deployment configurations (`vercel.json` for all 3 frontends)
- [x] `.gitignore` files (root + all directories)
- [x] Environment variable examples (`.env.example` in all directories)
- [x] Health check endpoint (`/api/health/`)
- [x] Database migrations (all up to date)
- [x] Static/media file handling (WhiteNoise + Cloudinary)

---

## 🎯 Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       GitHub Repository                               │
│                 (d:\Sem4\mini_project\Ashwini)                        │
└────────┬─────────────┬────────────────┬───────────────┬──────────────┘
         │             │                │               │
         │             │                │               │
   ┌─────▼─────┐  ┌────▼────┐  ┌────────▼──────┐  ┌────▼────────┐
   │Render.com │  │Vercel.app│  │  Vercel.app   │  │ Vercel.app  │
   │ (Backend) │  │(Frontend)│  │  (Frontend)   │  │ (Frontend)  │
   │           │  │  Main    │  │   Unified     │  │  Patient    │
   └───────────┘  └──────────┘  └───────────────┘  └─────────────┘
```

### Backend (Render)
- **URL**: `https://your-backend.onrender.com`
- **Service**: Django 4.2.28 + PostgreSQL
- **Port**: Auto-assigned by Render
- **Health Check**: `/api/health/`

### Frontends (Vercel)
1. **frontend-main** (Nurse/Reception Portal)
   - Port (dev): 4000
   - Tech: Create React App (React 18)
   
2. **frontend-unified** (Doctor Dashboard)
   - Port (dev): 3000
   - Tech: Create React App (React 18)
   
3. **frontend-patient** (Patient Portal)
   - Port (dev): 3004
   - Tech: Vite + React 18

---

## 📦 Step-by-Step Deployment

### 1️⃣ Prepare GitHub Repository

```bash
# Navigate to project directory
cd d:\Sem4\mini_project\Ashwini

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment commit"

# Create GitHub repository and add remote
git remote add origin https://github.com/YOUR_USERNAME/ashwini-healthcare.git

# Push to GitHub
git push -u origin main
```

---

### 2️⃣ Deploy Backend on Render

#### A. Prepare Environment Variables (CRITICAL)

**Generate SECRET_KEY** (do this locally first):
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy the output - you'll need this for Render environment variables.

#### B. Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `ashwini-db`
   - **Database**: `ashwini_production`
   - **User**: Auto-generated
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for better performance)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** - you'll need this!

#### C. Deploy Backend Service
1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will auto-detect `render.yaml` and configure:
   - Python 3.11.12 runtime
   - Build Command: `./build.sh`
   - Start Command: `./start.sh`
   - Health Check: `/api/health/`
4. Click **"Apply"** and wait for deployment

#### C. Configure Environment Variables
After deployment, go to your service → **Environment** tab and add:

```env
# Security
SECRET_KEY=<generate-with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'>
DEBUG=False

# Database (automatically set by Render database connection)
DATABASE_URL=<from-render-database-internal-url>

# Hosts
ALLOWED_HOSTS=your-backend.onrender.com

# CORS - ADD ALL THREE FRONTEND URLS AFTER VERCEL DEPLOYMENT
CORS_ALLOWED_ORIGINS=https://your-frontend-main.vercel.app,https://your-frontend-unified.vercel.app,https://your-frontend-patient.vercel.app

# Cloudinary (for production media)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Azure Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-endpoint
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key
```

#### D. Create Superuser (After First Deployment)
1. Go to **Shell** tab in Render dashboard
2. Run:
```bash
python manage.py createsuperuser
```

#### E. Test Backend
Visit: `https://your-backend.onrender.com/api/health/`

Expected response:
```json
{"status": "healthy", "service": "ashwini-backend"}
```

---

### 3️⃣ Deploy Frontends on Vercel

#### A. Deploy Frontend-Main (Nurse Portal)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `ashwini-frontend-main`
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend-main`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```
6. Click **"Deploy"**
7. **Copy the deployment URL** (e.g., `https://ashwini-frontend-main.vercel.app`)

#### B. Deploy Frontend-Unified (Doctor Portal)
Repeat same steps as frontend-main:
- **Root Directory**: `frontend-unified`
- **Project Name**: `ashwini-frontend-unified`
- Environment: `REACT_APP_API_URL=https://your-backend.onrender.com`

#### C. Deploy Frontend-Patient (Patient Portal)
1. Import repository again
2. Configure:
   - **Project Name**: `ashwini-frontend-patient`
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend-patient`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Click **"Deploy"**

---

### 4️⃣ Update Backend CORS Settings

**IMPORTANT**: After all frontends are deployed, update backend environment variables:

1. Go to Render Dashboard → Your backend service → **Environment**
2. Update `CORS_ALLOWED_ORIGINS` with ALL THREE Vercel URLs:
   ```
   CORS_ALLOWED_ORIGINS=https://ashwini-frontend-main.vercel.app,https://ashwini-frontend-unified.vercel.app,https://ashwini-frontend-patient.vercel.app
   ```
3. Click **"Save Changes"** (this will trigger a redeploy)

---

## 🔐 Security Checklist

- [ ] `DEBUG=False` in production backend
- [ ] Strong `SECRET_KEY` (50+ random characters)
- [ ] `CORS_ALLOWED_ORIGINS` only includes your actual frontend URLs
- [ ] `.env` files NOT committed to GitHub (check `.gitignore`)
- [ ] Database credentials stored as environment variables only
- [ ] Admin panel accessible only to authenticated superusers

---

## 🧪 Testing Deployment

### Test Backend
```bash
curl https://your-backend.onrender.com/api/health/
```

### Test Frontends
1. Open each frontend URL in browser
2. Test login functionality
3. Verify API connections (check browser DevTools Network tab)
4. Test patient registration → measurements → prescriptions flow
5. Verify auto-refresh (10-second polling) on patient portal

---

## 📊 Monitoring & Logs

### Render Logs
- View real-time logs: Dashboard → Your Service → **Logs** tab
- Look for:
  - `Starting gunicorn` (successful start)
  - `200 OK` responses (successful requests)
  - Any `500` errors (server issues)

### Vercel Logs
- Functions → Select deployment → **View Logs**
- Build logs available under each deployment

---

## 🔄 Continuous Deployment

Both Render and Vercel support auto-deployment:

### Automatic Deployments
- **Render**: Deploys automatically on push to `main` branch
- **Vercel**: Deploys automatically on push to `main` branch

### Preview Deployments (Vercel)
- Every pull request gets a unique preview URL
- Test changes before merging to main

---

## 🆘 Troubleshooting

### Backend Won't Start
1. Check logs for Python errors
2. Verify `DATABASE_URL` is set correctly
3. Ensure all migrations ran: Check logs for `python manage.py migrate`
4. Test locally first: `python manage.py runserver`

### Frontend Shows Connection Error
1. Check `REACT_APP_API_URL` / `VITE_API_URL` is correct
2. Verify backend is running: Visit `/api/health/`
3. Check CORS errors in browser console
4. Ensure backend `CORS_ALLOWED_ORIGINS` includes frontend URL

### CORS Errors
1. Backend logs should show the origin trying to connect
2. Verify exact URL match (no trailing slashes, correct protocol)
3. Check `CORS_ALLOWED_ORIGINS` format: comma-separated, no spaces
4. Redeploy backend after changing CORS settings

### Database Connection Issues
1. Verify PostgreSQL database is running on Render
2. Check `DATABASE_URL` matches database connection string
3. Ensure database is in same region as backend service

### Static Files Not Loading
1. Check `collectstatic` ran in build logs
2. Verify `WhiteNoise` is configured in `settings.py`
3. Check `STATIC_ROOT` path in settings

---

## 🎓 Environment Variables Reference

### Backend (Render)
| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `SECRET_KEY` | ✅ | `django-insecure-abc123...` | Generate unique key |
| `DEBUG` | ✅ | `False` | Always False in production |
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host/db` | Auto-set by Render |
| `ALLOWED_HOSTS` | ✅ | `backend.onrender.com` | Your Render domain |
| `CORS_ALLOWED_ORIGINS` | ✅ | `https://app1.vercel.app,https://app2.vercel.app` | All frontends |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ | `mycloud` | Optional for media |
| `CLOUDINARY_API_KEY` | ⚠️ | `123456789` | Optional for media |
| `CLOUDINARY_API_SECRET` | ⚠️ | `secretkey` | Optional for media |
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | ❌ | `https://...` | Optional AI feature |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | ❌ | `key` | Optional AI feature |

### Frontend-Main & Frontend-Unified (Vercel - CRA)
| Variable | Required | Example |
|----------|----------|---------|
| `REACT_APP_API_URL` | ✅ | `https://backend.onrender.com` |

### Frontend-Patient (Vercel - Vite)
| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | ✅ | `https://backend.onrender.com` |

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ Final Checklist Before Going Live

- [ ] All tests passing locally
- [ ] Database migrations applied in production
- [ ] Superuser account created
- [ ] All environment variables set correctly
- [ ] CORS configured with all frontend URLs
- [ ] Health check endpoint responding
- [ ] All three frontends deployed and accessible
- [ ] Login/authentication working
- [ ] Patient registration flow tested
- [ ] Measurements and prescriptions syncing
- [ ] Auto-refresh working on patient portal
- [ ] Health progress charts displaying correctly
- [ ] Visit history archival working

---

**Deployment Ready!** 🎉

Your Ashwini Healthcare System is now production-ready. Push to GitHub and follow the steps above for seamless deployment to Render and Vercel.

For support or issues, check the logs first, then refer to the troubleshooting section above.
