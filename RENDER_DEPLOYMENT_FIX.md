# Render Deployment Troubleshooting Guide

## Current Issue: Database Connection Error

**Error:** `could not translate host name "dpg-d5ka1r2li9vc73fa2tl0-a" to address`

This means the PostgreSQL database hostname cannot be resolved during deployment.

---

## 🔧 Quick Fix Steps

### Step 1: Check Database Configuration in Render Dashboard

1. Go to your Render Dashboard: https://dashboard.render.com
2. Find your PostgreSQL database service
3. Check if the database status is "Available" (green)
4. If the database is "Suspended" or "Unavailable", click on it and wait for it to become available

### Step 2: Verify DATABASE_URL Environment Variable

1. Go to your **Web Service** (ashwini-backend)
2. Click on **Environment** in the left sidebar
3. Look for `DATABASE_URL` variable
4. It should look like: `postgres://username:password@hostname/database`

**If DATABASE_URL is missing or incorrect:**

#### Option A: Link Existing Database
1. In your web service, go to **Environment**
2. Click **Add Environment Variable**
3. Key: `DATABASE_URL`
4. Value: Click **"Add from database"**
5. Select your PostgreSQL database
6. Save changes

#### Option B: Use Internal Connection String
1. Go to your PostgreSQL database service
2. Copy the **Internal Connection String** (not External)
3. In your web service, add/update `DATABASE_URL` with this value
4. Format: `postgres://user:password@dpg-xxxxx/dbname` or `postgresql://...`

### Step 3: Redeploy

After fixing the DATABASE_URL:
1. Go to your web service
2. Click **Manual Deploy** → **Clear build cache & deploy**
3. Watch the logs for success

---

## 🎯 Deployment Checklist

### In Render Dashboard:

#### Database Service (PostgreSQL)
- [ ] Database is created and status is "Available"
- [ ] Database name: `ashwini` (or your chosen name)
- [ ] Note the Internal Connection String

#### Web Service (Backend)
- [ ] **Environment Variables:**
  - [ ] `DATABASE_URL` - Set to your PostgreSQL internal connection string
  - [ ] `SECRET_KEY` - Set to a random secure string (50+ characters)
  - [ ] `DEBUG` - Set to `False` for production
  - [ ] `ALLOWED_HOSTS` - Set to your Render domain (e.g., `ashwini-backend.onrender.com`)
  - [ ] `CORS_ALLOWED_ORIGINS` - Set to your frontend URLs (comma-separated)
  - [ ] Optional: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

- [ ] **Build & Deploy Settings:**
  - [ ] Build Command: `cd backend && bash build.sh`
  - [ ] Start Command: `cd backend && python app.py`
  - [ ] Root Directory: Leave blank (or set to `/`)

---

## 🔍 Common Issues & Solutions

### Issue 1: "could not translate host name"

**Cause:** Database URL uses internal hostname not accessible during build OR DATABASE_URL not set

**Solution:**
- Remove database migrations from `build.sh` (already done ✓)
- Migrations now run at startup when database is accessible
- Ensure DATABASE_URL is correctly set in environment variables

### Issue 2: "No open ports detected"

**Cause:** App not binding to Render's PORT environment variable

**Solution:**
- Using `app.py` which properly binds to PORT (already fixed ✓)
- Ensure start command is `cd backend && python app.py`

### Issue 3: "Build failed - command not found"

**Cause:** Build command path incorrect

**Solution:**
- Ensure build command is: `cd backend && bash build.sh`
- Or set Root Directory to `backend` and use: `bash build.sh`

### Issue 4: "Module not found" errors

**Cause:** Dependencies not installed

**Solution:**
- Ensure `requirements.txt` is in the `backend` folder
- Build command should include: `pip install -r requirements.txt`

### Issue 5: Static files not found

**Cause:** Static files not collected or served properly

**Solution:**
- `build.sh` runs `collectstatic` (already done ✓)
- WhiteNoise middleware is configured in settings (already done ✓)

---

## 📋 Manual Setup Instructions (Alternative to render.yaml)

If you're setting up manually through the Render dashboard:

### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click **New +** → **PostgreSQL**
2. Name: `ashwini-db`
3. Database: `ashwini`
4. User: `ashwini` (or leave default)
5. Plan: **Free**
6. Click **Create Database**
7. Wait for it to become "Available"
8. Copy the **Internal Connection String**

### Step 2: Create Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `ashwini-backend`
   - **Runtime:** Python 3
   - **Build Command:** `cd backend && bash build.sh`
   - **Start Command:** `cd backend && python app.py`
   - **Plan:** Free

### Step 3: Add Environment Variables

Add these in the web service **Environment** tab:

```bash
DATABASE_URL=[Paste Internal Connection String from database]
SECRET_KEY=[Generate random 50+ character string]
DEBUG=False
ALLOWED_HOSTS=ashwini-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
DJANGO_SETTINGS_MODULE=ashwini_backend.settings
PYTHON_VERSION=3.11.12
```

### Step 4: Deploy

Click **Create Web Service** and monitor the deployment logs.

---

## 🚨 If Database Connection Still Fails

### Check 1: Database Status
```bash
# In Render logs, look for:
psycopg2.OperationalError: could not translate host name
```

**Fix:**
- Verify database is "Available" (not Suspended)
- Check DATABASE_URL format is correct
- Ensure using **Internal** connection string, not External

### Check 2: Connection String Format

❌ **Wrong formats:**
- `postgres://dpg-xxxxx-a/dbname` (missing user/password)
- External hostname (should use internal)
- HTTP URL instead of postgres://

✅ **Correct format:**
- `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname`
- Or: `postgres://user:password@dpg-xxxxx-a/dbname`

### Check 3: Network Issues

If database hostname still can't be resolved:
1. Delete the database service
2. Create a new PostgreSQL database
3. Update DATABASE_URL in web service
4. Clear build cache and redeploy

---

## 🧪 Test Your Deployment

After successful deployment:

### 1. Health Check
```bash
curl https://your-app.onrender.com/api/health/
```
Should return: `{"status":"healthy","service":"ashwini-backend"}`

### 2. Check Logs
- Go to web service → **Logs** tab
- Look for: "Starting Django application on 0.0.0.0:XXXX"
- Should NOT see connection errors

### 3. Test API Endpoints
```bash
# List patients
curl https://your-app.onrender.com/api/patients/

# Admin panel
# Visit: https://your-app.onrender.com/admin/
```

---

## 💡 Pro Tips

1. **Always use Internal Connection String** for DATABASE_URL (faster and more reliable)

2. **Clear build cache** if you get strange errors:
   - Manual Deploy → Clear build cache & deploy

3. **Check both services** (database and web) are in the same region for best performance

4. **Monitor logs** during first deployment to catch issues early

5. **Free tier databases** suspend after 90 days of inactivity - keep this in mind

6. **Set up monitoring** after successful deployment to track uptime

---

## 📞 Need More Help?

1. **Check Render Status:** https://status.render.com
2. **Render Docs:** https://render.com/docs
3. **View detailed logs** in Render Dashboard → Logs tab
4. **Database connection test:** Use Render's built-in database connection test in the database service

---

## ✅ Success Indicators

You'll know deployment succeeded when you see:

```
✓ Database migrations completed successfully
✓ Default superuser check completed
Starting Django application on 0.0.0.0:10000
[INFO] Starting gunicorn 20.1.0
[INFO] Listening at: http://0.0.0.0:10000
```

And your health endpoint returns:
```json
{"status": "healthy", "service": "ashwini-backend"}
```
