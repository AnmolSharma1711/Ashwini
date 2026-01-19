# 🔧 FIXING "500 Error" on Report Upload

## Quick Fix Steps:

### 1. Run Migrations on Render (REQUIRED)

The `reports` app tables don't exist in your production database yet.

**Steps:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service (ashwini-backend)
3. Click the **"Shell"** tab at the top
4. Run these commands:
```bash
cd backend
python manage.py makemigrations reports
python manage.py migrate
```

Wait for migrations to complete. You should see:
```
Creating table reports_report...
OK
```

---

### 2. Add Azure Credentials to Render (OPTIONAL but recommended)

While the upload will work without this, the AI analysis won't happen.

1. In Render Dashboard → Your Service → **Environment**
2. Add these environment variables:

   **Variable 1:**
   - Key: `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT`
   - Value: `https://your-resource-name.cognitiveservices.azure.com/`

   **Variable 2:**
   - Key: `AZURE_DOCUMENT_INTELLIGENCE_KEY`
   - Value: `your-actual-api-key-here`

3. Click **"Save Changes"** (Render will redeploy)

---

### 3. Check Media Files Configuration

Render's ephemeral filesystem means uploaded files might be lost on redeploy. For production, you need cloud storage.

**Quick Fix (Temporary):**
The app will work, but files may disappear on redeploy.

**Permanent Fix (Recommended):**
Set up cloud storage (I can help you configure this):
- AWS S3
- Cloudinary
- Azure Blob Storage

---

## Testing After Fix:

1. Wait for migrations to complete (check Shell output)
2. Try uploading a report again
3. If still getting 500:
   - Go to Render → Logs tab
   - Copy the error message
   - Share it with me

---

## Common Error Messages & Fixes:

### Error: "no such table: reports_report"
**Fix:** Run migrations (Step 1 above)

### Error: "Azure Document Intelligence is not configured"
**Fix:** Add environment variables (Step 2 above)
**Note:** Upload will still work, but analysis won't happen

### Error: "Permission denied" or "Read-only file system"
**Fix:** This is normal on Render. Files upload to `/tmp` which is okay for now.
For permanent storage, set up cloud storage.

---

## Alternative: Manual Migration via Render Web UI

If Shell doesn't work:

1. Add this to your `build` command in Render:
   ```
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```

2. This already exists in your setup, so try **Manual Deploy**:
   - Render Dashboard → Your Service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Watch logs for migration output

---

## Need More Help?

Share the error from Render logs (Logs tab in dashboard), and I'll help you fix it!
