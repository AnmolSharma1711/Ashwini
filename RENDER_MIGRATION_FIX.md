# Report Upload 500 Error - Complete Fix Guide

## Problem
POST to `/api/patients/13/reports/` returns 500 error because the `reports_report` database table doesn't exist on Render.

## Root Cause
**Render is not running database migrations during deployment.** The migration file exists in the repository (`backend/reports/migrations/0001_initial.py`) but hasn't been applied to the PostgreSQL database.

## Solution: Configure Render Build Command

### Option 1: Direct Build Command (Recommended)

1. **Go to Render Dashboard**:
   - Visit https://dashboard.render.com
   - Click on your `ashwini-backend` service

2. **Update Build Command**:
   - Click **Settings** (left sidebar)
   - Scroll to **Build & Deploy** section
   - Find the **Build Command** field
   - Replace or set it to:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --no-input
   ```

3. **Save and Redeploy**:
   - Click **Save Changes** button
   - Go to **Manual Deploy** tab at the top
   - Click **Deploy latest commit** button
   - Wait for deployment to complete (watch the logs)

4. **Verify Migration Ran**:
   Look for this in the build logs:
   ```
   Running migrations:
     Applying reports.0001_initial... OK
   ```

### Option 2: Use Build Script

The repository now includes `backend/build.sh`. To use it:

1. Make the script executable locally:
   ```bash
   cd backend
   chmod +x build.sh
   git add build.sh
   git commit -m "Make build script executable"
   git push origin main
   ```

2. In Render Settings → **Build Command**:
   ```bash
   chmod +x build.sh && ./build.sh
   ```

3. Save and manually redeploy

## What the Build Command Does

```bash
pip install -r requirements.txt  # Install Python packages
python manage.py migrate         # Apply database migrations ← THIS IS THE KEY STEP
python manage.py collectstatic   # Collect static files for admin panel
```

The `migrate` command will create the `reports_report` table in your PostgreSQL database.

## After Fixing - Next Steps

### 1. Test Report Upload
- Go to https://ashwini-frontend-main.vercel.app
- Select a patient
- Upload a test report image
- Should now work without 500 error ✅

### 2. Configure Azure Credentials
The report will upload successfully, but AI analysis won't work until you add Azure credentials:

**In Render Dashboard**:
1. Go to your service → **Environment** tab
2. Add these environment variables:
   ```
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
   AZURE_DOCUMENT_INTELLIGENCE_KEY=your-api-key-here
   ```
3. Click **Save Changes** (will auto-redeploy)

### 3. Recommended: Setup Cloud Storage
Render's filesystem is **ephemeral** - uploaded files will be deleted on each deployment. For production, use:

**Option A: AWS S3**
```python
# In requirements.txt
django-storages[boto3]==1.14.2

# In settings.py
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = 'us-east-1'
```

**Option B: Azure Blob Storage**
```python
# In requirements.txt
django-storages[azure]==1.14.2

# In settings.py
DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
AZURE_ACCOUNT_NAME = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
AZURE_ACCOUNT_KEY = os.getenv('AZURE_STORAGE_ACCOUNT_KEY')
AZURE_CONTAINER = 'reports'
```

## Troubleshooting

### If 500 Error Persists
1. Check Render logs for actual error message:
   - Render Dashboard → Your Service → Logs tab
   - Look for Python traceback showing the specific error

2. Verify migration applied:
   ```bash
   # In Render Shell (paid feature) or locally with production DB:
   python manage.py showmigrations reports
   ```
   Should show:
   ```
   reports
    [X] 0001_initial
   ```

3. Check database table exists:
   - Use Render's PostgreSQL external connection
   - Run: `\dt reports_report` in psql

### If File Upload Fails After Migration
The media directory might not exist:
```bash
# Add to build.sh
mkdir -p media/reports
```

## Quick Verification Checklist

- [ ] Build command includes `python manage.py migrate`
- [ ] Manual redeploy triggered on Render
- [ ] Build logs show "Applying reports.0001_initial... OK"
- [ ] POST to `/api/patients/13/reports/` returns 201 (not 500)
- [ ] Azure credentials added to Render environment variables
- [ ] Cloud storage configured (recommended for production)

## Timeline
1. **Immediate**: Configure build command and redeploy (5 minutes)
2. **Short-term**: Add Azure credentials for AI analysis (2 minutes)
3. **Production-ready**: Setup cloud storage (30-60 minutes)
