# Ashwini Backend Deployment Guide - Render

This guide walks you through deploying the Ashwini Django backend on Render with a managed PostgreSQL database.

## Prerequisites
- GitHub repository with the latest code (✅ already pushed)
- Render account (sign up free at https://render.com)

---

## Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → Select **"PostgreSQL"**
3. **Configure Database**:
   - **Name**: `ashwini-db` (or any name you prefer)
   - **Database**: `ashwini` (default is fine)
   - **User**: `ashwini` (default is fine)
   - **Region**: Choose closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
   - **PostgreSQL Version**: `16` (latest)
   - **Instance Type**: `Free` (for testing) or `Starter` ($7/mo for production)
4. **Click "Create Database"**
5. **Wait 2-3 minutes** for provisioning
6. **Copy the Internal Database URL**:
   - Go to the database page → Click **"Info"** tab
   - Find **"Internal Database URL"** (starts with `postgresql://`)
   - Copy this URL - you'll need it in Step 2
   - Example: `postgresql://ashwini:password@dpg-xxxxx-a/ashwini`

✅ **Checkpoint**: You now have a PostgreSQL database running on Render

---

## Step 2: Deploy Django Web Service on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → Select **"Web Service"**
3. **Connect Repository**:
   - Click **"Connect account"** (if first time) to link GitHub
   - Select your **Ashwini repository**
   - Click **"Connect"**

4. **Configure Web Service**:
   
   **Basic Settings**:
   - **Name**: `ashwini-backend` (this becomes your URL subdomain)
   - **Region**: Same as database (e.g., `Oregon (US West)`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` ⚠️ **IMPORTANT** - set this to `backend`
   - **Runtime**: `Python 3`
   
   **Build & Deploy**:
   - **Build Command**:
     ```
     pip install -r requirements.txt
     ```
   
   - **Start Command**:
     ```
     gunicorn ashwini_backend.wsgi --log-file -
     ```
   
   **Instance Type**:
   - Select **"Free"** (for testing) or **"Starter"** ($7/mo for production)

5. **Add Environment Variables** (scroll down to "Environment" section):
   
   Click **"Add Environment Variable"** for each of these:
   
   | Key | Value | Notes |
   |-----|-------|-------|
   | `DATABASE_URL` | `<paste Internal Database URL from Step 1>` | From your Postgres instance |
   | `SECRET_KEY` | `<generate random string>` | Use a password generator - 50+ chars |
   | `DEBUG` | `False` | IMPORTANT: Must be False for production |
   | `ALLOWED_HOSTS` | `ashwini-backend.onrender.com` | Replace with your actual Render URL |
   | `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:4000` | Add production frontend URLs later |
   
   **To generate SECRET_KEY**, you can use Python:
   ```python
   python -c "import secrets; print(secrets.token_urlsafe(50))"
   ```

6. **Add Build Hook (Optional but Recommended)**:
   - Under "Deploy", set **"Auto-Deploy"** to **"Yes"**
   - This auto-deploys when you push to GitHub

7. **Click "Create Web Service"**

8. **Wait for Initial Deploy** (5-10 minutes):
   - Watch the build logs in real-time
   - You'll see: Installing dependencies → Running migrations → Starting gunicorn
   - Status will change to **"Live"** when ready

✅ **Checkpoint**: Your Django app is now deployed!

---

## Step 3: Run Database Migrations

After the first successful deploy:

1. **Go to your Web Service** → Click **"Shell"** tab (top right)
2. **Run these commands** in the web shell:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

3. **(Optional) Create superuser** for Django admin:
```bash
python manage.py createsuperuser
```
   - Follow prompts to set username/email/password

✅ **Checkpoint**: Database is initialized with all tables

---

## Step 4: Test Your Deployed Backend

1. **Get your service URL**:
   - It will be: `https://ashwini-backend.onrender.com`
   - (Replace `ashwini-backend` with whatever you named it)

2. **Test API endpoints**:
   
   Open these URLs in your browser:
   - `https://ashwini-backend.onrender.com/api/patients/` - Should return `[]` (empty list)
   - `https://ashwini-backend.onrender.com/api/measurements/` - Should return `[]`
   - `https://ashwini-backend.onrender.com/api/devices/` - Should return `[]`
   - `https://ashwini-backend.onrender.com/admin/` - Django admin login

3. **Test with curl** (or Postman):
```bash
curl https://ashwini-backend.onrender.com/api/patients/
```

✅ **Checkpoint**: Your API is live and responding!

---

## Step 5: Update Frontend and ESP32 Code

Now update your code to use the deployed backend URL:

### A. Update Frontend (both frontend-main and frontend-unified)

**File**: `frontend-main/src/api.js` and `frontend-unified/src/api.js`

Change:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

To:
```javascript
const API_BASE_URL = 'https://ashwini-backend.onrender.com/api';
```

### B. Update ESP32 IoT Code

**File**: `IoT-Integration/iot_integration_with_api/keys.h`

Change:
```cpp
const char* serverUrl = "http://192.168.x.x:8000/api/measurements/";
```

To:
```cpp
const char* serverUrl = "https://ashwini-backend.onrender.com/api/measurements/";
```

### C. Update CORS Settings (after deploying frontend)

When you deploy your React frontends (e.g., on Vercel/Netlify):

1. Go to Render → Your Web Service → **Environment**
2. Edit `CORS_ALLOWED_ORIGINS`:
   ```
   https://your-frontend-main.vercel.app,https://your-frontend-unified.vercel.app
   ```
3. Or for testing, set: `CORS_ALLOW_ALL_ORIGINS` = `True` (⚠️ not for production)

---

## Step 6: Monitoring and Logs

### View Logs
- Render Dashboard → Your Service → **Logs** tab
- See real-time logs of all requests, errors, and server activity

### Check Service Status
- Green badge = Running
- Yellow badge = Deploying
- Red badge = Build failed or crashed

### Free Tier Limitations
- **Spins down after 15 min of inactivity**
- First request after sleep takes ~30 seconds (cold start)
- **Upgrade to Starter ($7/mo)** to avoid spin-down

---

## Troubleshooting

### Build Failed?
- Check build logs for missing dependencies
- Ensure `Root Directory` is set to `backend`
- Verify `requirements.txt` has all packages

### "Bad Gateway" or 502 Error?
- Check if service is running (not spun down)
- View logs for Python errors
- Verify `ALLOWED_HOSTS` includes your Render URL

### Database Connection Error?
- Verify `DATABASE_URL` is set correctly
- Check database is running (not paused)
- Ensure you used **Internal Database URL** (not External)

### CORS Errors from Frontend?
- Add your frontend URL to `CORS_ALLOWED_ORIGINS`
- Or temporarily set `CORS_ALLOW_ALL_ORIGINS=True` for testing

### Migrations Not Applied?
- Run `python manage.py migrate` in Shell tab
- Check logs for migration errors

---

## Quick Reference Commands

Run these in Render Shell (Web Service → Shell tab):

```bash
# View all environment variables
env

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser

# Check Django version
python manage.py --version

# Test database connection
python manage.py dbshell
```

---

## Cost Summary

**Free Tier**:
- PostgreSQL: 1 free database (256 MB, spins down)
- Web Service: 750 hours/month free (spins down after 15 min idle)
- **Total**: $0/month (with spin-down limitations)

**Starter Tier** (Recommended for Production):
- PostgreSQL: $7/month (no spin-down, 1 GB storage)
- Web Service: $7/month (no spin-down, always on)
- **Total**: $14/month

---

## Next Steps

1. ✅ Backend deployed and running
2. 📱 Update ESP32 code with new URL and flash to device
3. 🌐 Deploy frontends to Vercel/Netlify
4. 🔒 Set up proper authentication (JWT tokens)
5. 📊 Add monitoring (Sentry, LogRocket)
6. 🚀 Upgrade to Starter tier when ready for production

---

## Support

- **Render Docs**: https://render.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/stable/howto/deployment/
- **PostgreSQL Issues**: Check Render database logs

**Your deployed URLs**:
- 🔗 Backend API: `https://ashwini-backend.onrender.com`
- 🗄️ Database: Internal connection only
- 👤 Admin Panel: `https://ashwini-backend.onrender.com/admin/`

---

Happy Deploying! 🚀
