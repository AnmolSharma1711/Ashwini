# 🔑 WHERE TO PUT AZURE DOCUMENT INTELLIGENCE API CREDENTIALS

## Quick Answer:
Since your project is **deployed on Vercel (frontend) and Render (backend)**, you need to add Azure credentials to your **Render backend environment variables**.

---

## For Production Deployment (Current Setup):

### Step 1: Get Your Azure Credentials

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign up for free (you get $200 credit for 30 days)
3. Create a "Document Intelligence" resource:
   - Click "Create a resource"
   - Search for "Document Intelligence"
   - Click Create
   - Choose Free tier (F0) - 500 pages/month free forever
   - Note: It might take 2-3 minutes to deploy

4. After deployment, go to your resource
5. Click "Keys and Endpoint" in the left sidebar
6. Copy these two values:
   - **Endpoint**: looks like `https://your-name.cognitiveservices.azure.com/`
   - **Key 1**: long string like `abc123def456...`

---

### Step 2: Add to Render (Backend)

Your backend is deployed at: `https://ashwini-backend.onrender.com`

1. **Go to Render Dashboard:**
   - Visit [https://dashboard.render.com](https://dashboard.render.com)
   - Sign in to your account

2. **Select your backend service:**
   - Find "ashwini-backend" (or whatever you named it)
   - Click on it

3. **Add Environment Variables:**
   - Click "Environment" in the left sidebar
   - Click "Add Environment Variable"
   - Add these TWO variables:

   **Variable 1:**
   - Key: `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT`
   - Value: `https://your-resource-name.cognitiveservices.azure.com/`

   **Variable 2:**
   - Key: `AZURE_DOCUMENT_INTELLIGENCE_KEY`
   - Value: `your-actual-api-key-here`

4. **Save Changes:**
   - Click "Save Changes"
   - Render will automatically redeploy your backend with the new variables

---

### Step 3: Deploy Database Migrations

After adding environment variables, you need to run migrations:

**Option A: Using Render Shell**
1. In Render dashboard, go to your service
2. Click "Shell" tab
3. Run:
   ```bash
   python manage.py makemigrations reports
   python manage.py migrate
   ```

**Option B: Redeploy from Git**
1. Push your code to Git (if you haven't):
   ```powershell
   git add .
   git commit -m "Add report analysis feature"
   git push
   ```
2. Render will auto-deploy and run migrations

---

## For Local Development (Optional):

If you also want to test locally:

1. **Create .env file:**
   ```powershell
   cd backend
   Copy-Item .env.example .env
   notepad .env
   ```

2. **Add credentials:**
   ```env
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
   AZURE_DOCUMENT_INTELLIGENCE_KEY=your-actual-api-key-here
   ```

3. **Run migrations:**
   ```powershell
   python manage.py makemigrations reports
   python manage.py migrate
   python manage.py runserver
   ```

---

## Vercel Frontend Setup

Your frontends are already deployed on Vercel. No changes needed there since they communicate with your Render backend API.

**Frontend URLs:**
- Main Dashboard: `https://your-main-frontend.vercel.app`
- Unified Dashboard: `https://your-unified-frontend.vercel.app`

Both will automatically use the new report features once backend is configured.

---

## File Structure for Production:

```
Your Deployment:
├── Vercel (Frontend)
│   ├── frontend-main (Health Monitoring Station)
│   └── frontend-unified (Doctor Dashboard)
│
└── Render (Backend)
    ├── Environment Variables  <-- ADD AZURE CREDENTIALS HERE!
    │   ├── AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT
    │   └── AZURE_DOCUMENT_INTELLIGENCE_KEY
    ├── Database (PostgreSQL)
    └── Media Files Storage
```

---

## Verification Steps:

1. **Check Backend Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for successful startup messages
   - No errors about Azure configuration

2. **Test the Feature:**
   - Open your deployed Health Monitoring Station
   - Select a patient
   - Upload a medical report
   - Check Unified Doctor Dashboard to see the analysis

3. **Check if it's working:**
   - Upload should show: "Report uploaded successfully! Analysis in progress..."
   - In Doctor Dashboard, you should see extracted text and key phrases
   - If you see "Azure Document Intelligence is not configured" → check environment variables in Render

---

## Important Notes for Production:

### ✅ DO:
- Set environment variables in **Render Dashboard** (not in code)
- Make sure the endpoint URL ends with a `/`
- Use Free (F0) tier for testing - it's free forever!
- Keep your API keys secret - never commit them to Git

### ❌ DON'T:
- Don't put credentials in `settings.py` directly
- Don't commit `.env` file to Git
- Don't share API keys publicly

---

## Media Files Storage (Important for Production):

Your uploaded report images need storage. For production, you have two options:

### Option 1: Use Render Disk (Temporary)
- Files stored on Render's disk
- ⚠️ Files may be deleted on redeploy
- Good for testing

### Option 2: Use Cloud Storage (Recommended)
For production, consider using:
- **AWS S3** (most popular)
- **Azure Blob Storage** (integrates well with Azure AI)
- **Cloudinary** (easy setup)

I can help you set this up if needed.

---

## Cost Information:

### Azure Document Intelligence:
- **Free Tier (F0):** 500 pages/month - FREE FOREVER
- **Paid Tier (S0):** ~$1-2 per 1,000 pages (only if you exceed free tier)

### Current Costs (All Free):
- ✅ Vercel: Free tier (sufficient for your traffic)
- ✅ Render: Free tier or paid (check your plan)
- ✅ Azure AI: Free tier (500 pages/month)

---

## Troubleshooting Production Issues:

### Error: "Azure Document Intelligence is not configured"
**Solution:**
1. Check Render Dashboard → Environment Variables
2. Verify both variables are present and correct
3. Click "Manual Deploy" to redeploy
4. Check logs for startup errors

### Error: "Failed to upload report"
**Solution:**
1. Check if media files directory exists on Render
2. Verify Render has write permissions
3. Consider switching to cloud storage (S3/Azure Blob)

### Error: "Database error" after upload
**Solution:**
1. Make sure migrations were run on Render
2. Go to Shell tab in Render and run:
   ```bash
   python manage.py migrate
   ```

---

## Quick Deployment Checklist:

- [ ] Create Azure Document Intelligence resource (Free F0 tier)
- [ ] Copy Endpoint and Key from Azure Portal
- [ ] Add environment variables to Render Dashboard
- [ ] Save changes (Render auto-redeploys)
- [ ] Run migrations on Render (via Shell or auto-migration)
- [ ] Test upload feature on your deployed site
- [ ] Verify analysis results in Doctor Dashboard

---

## Need Help?

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Verify Azure resource status in Azure Portal
3. Test with a simple image first (clear text, good quality)

---

**Your production deployment is ready to use Azure Document Intelligence! 🚀**
