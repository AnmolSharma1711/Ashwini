# 🚀 Frontend Deployment Guide - Vercel

Deploy both Ashwini React frontends to Vercel for free hosting.

## Prerequisites
- GitHub repository with latest code (✅ already pushed)
- Vercel account (sign up free at https://vercel.com)
- Both frontends ready to deploy

---

## 📦 What's Being Deployed

1. **Frontend-Main** (Registration + Health Monitoring Station)
   - Port 4000 locally → Will get Vercel URL
   - Used by hospital staff for patient registration and monitoring

2. **Frontend-Unified** (Patient View / Doctor's Dashboard)
   - Port 3000 locally → Will get Vercel URL
   - Used by doctors to view patient data and prescriptions

---

## 🚀 Deployment Steps

### **Part 1: Deploy Frontend-Main** (10 minutes)

#### Step 1: Go to Vercel
1. Visit https://vercel.com
2. Click **"Sign Up"** (or Log In if you have an account)
3. Choose **"Continue with GitHub"** to link your account
4. Authorize Vercel to access your repositories

#### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find your **Ashwini** repository
3. Click **"Import"**

#### Step 3: Configure Project
- **Project Name**: `ashwini-frontend-main` (or your choice)
- **Framework Preset**: Select **"Create React App"**
- **Root Directory**: Click **"Edit"** → Set to `frontend-main` ⚠️ **IMPORTANT**
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `build` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

#### Step 4: Add Environment Variables (Optional)
Click **"Environment Variables"** → Add (if you want to override):
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://ashwini-backend.onrender.com`

(Not required - your code already has this as default)

#### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes for build
3. **Copy your deployment URL** when ready (e.g., `https://ashwini-frontend-main.vercel.app`)

✅ **Frontend-Main is Live!**

---

### **Part 2: Deploy Frontend-Unified** (10 minutes)

Repeat the same process for the second frontend:

#### Step 1: Add New Project
1. Go back to Vercel Dashboard
2. Click **"Add New..."** → **"Project"**
3. Select your **Ashwini** repository again

#### Step 2: Configure Project
- **Project Name**: `ashwini-frontend-unified` (or your choice)
- **Framework Preset**: **"Create React App"**
- **Root Directory**: `frontend-unified` ⚠️ **IMPORTANT**
- **Build Command**: `npm run build`
- **Output Directory**: `build`

#### Step 3: Add Environment Variables (Optional)
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://ashwini-backend.onrender.com`

#### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. **Copy your deployment URL** (e.g., `https://ashwini-frontend-unified.vercel.app`)

✅ **Frontend-Unified is Live!**

---

## 🔧 Part 3: Update Backend CORS Settings (CRITICAL!)

After both frontends are deployed, you **must** update the backend to allow them:

### Step 1: Get Your Frontend URLs
You should now have:
- Frontend-Main: `https://ashwini-frontend-main.vercel.app`
- Frontend-Unified: `https://ashwini-frontend-unified.vercel.app`

### Step 2: Update Render Backend
1. Go to https://dashboard.render.com
2. Click your **ashwini-backend** service
3. Go to **Environment** tab
4. Find or Add **`CORS_ALLOWED_ORIGINS`**
5. Set value to:
   ```
   https://ashwini-frontend-main.vercel.app,https://ashwini-frontend-unified.vercel.app
   ```
   (Comma-separated, no spaces)

6. Click **"Save Changes"**
7. Service will automatically redeploy (takes ~2 minutes)

✅ **CORS Configured!**

---

## 🧪 Testing Your Deployed Frontends

### Test Frontend-Main:
1. Visit: `https://ashwini-frontend-main.vercel.app`
2. Try registering a new patient
3. Check if data saves to backend
4. Test health monitoring dashboard

### Test Frontend-Unified:
1. Visit: `https://ashwini-frontend-unified.vercel.app`
2. Select a patient
3. View their measurements
4. Update prescription

### If CORS Error Appears:
- Check backend CORS_ALLOWED_ORIGINS includes your Vercel URLs
- Make sure no extra spaces in the environment variable
- Wait for backend redeploy to complete

---

## 🔄 Auto-Deploy Setup (Already Enabled!)

Vercel automatically:
- ✅ Deploys when you push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Provides SSL certificates (HTTPS)
- ✅ Gives you a custom domain option

---

## 📝 Custom Domains (Optional)

### Add Custom Domain to Vercel:
1. Go to Project → **Settings** → **Domains**
2. Add your domain (e.g., `app.ashwini.com`)
3. Follow DNS configuration instructions
4. Update backend CORS with your custom domain

---

## 🔍 Troubleshooting

### Build Failed?
**Check Vercel Build Logs**:
- Click the failed deployment
- View detailed error messages
- Common issues:
  - Wrong Root Directory (must be `frontend-main` or `frontend-unified`)
  - Missing dependencies (should auto-install)
  - Node version issues (Vercel uses latest by default)

### Frontend Shows "Failed to Fetch"?
- **CORS not configured**: Update backend CORS_ALLOWED_ORIGINS
- **Backend sleeping**: Visit backend URL first to wake it
- **Wrong API URL**: Check if pointing to correct backend

### Frontend Loads but No Data?
- Check browser console (F12) for errors
- Verify backend API is accessible: `https://ashwini-backend.onrender.com/api/patients/`
- Check CORS settings on backend

### 404 on Page Refresh?
- Vercel config should handle this (vercel.json routes)
- If issue persists, check vercel.json is committed

---

## 💰 Vercel Pricing

**Hobby Plan (Free)**:
- ✅ Unlimited projects
- ✅ 100 GB bandwidth/month
- ✅ SSL certificates
- ✅ Auto-deployments from GitHub
- ✅ Preview deployments
- **Cost**: $0/month

**Pro Plan** ($20/month):
- More bandwidth (1 TB)
- Team collaboration
- Priority support

For this project, **Free plan is sufficient**! 🎉

---

## 🎯 Quick Reference

### Your Deployed URLs:

**Backend**:
```
https://ashwini-backend.onrender.com
```

**Frontend-Main**:
```
https://ashwini-frontend-main.vercel.app
(or your custom name)
```

**Frontend-Unified**:
```
https://ashwini-frontend-unified.vercel.app
(or your custom name)
```

### Environment Variables to Set:

**On Render (Backend)**:
```
CORS_ALLOWED_ORIGINS=https://ashwini-frontend-main.vercel.app,https://ashwini-frontend-unified.vercel.app
```

**On Vercel (Frontends)** - Optional:
```
REACT_APP_API_URL=https://ashwini-backend.onrender.com
```

---

## 📋 Post-Deployment Checklist

- [ ] Frontend-Main deployed on Vercel
- [ ] Frontend-Unified deployed on Vercel
- [ ] Both URLs copied and saved
- [ ] Backend CORS_ALLOWED_ORIGINS updated with Vercel URLs
- [ ] Tested patient registration on Frontend-Main
- [ ] Tested patient viewing on Frontend-Unified
- [ ] Verified ESP32 can send data to backend
- [ ] All three components communicating properly

---

## 🆘 Common Commands

### Redeploy Frontend:
```bash
# Just push to GitHub - auto-deploys!
git add .
git commit -m "Update frontend"
git push
```

### Force Redeploy on Vercel:
1. Go to project in Vercel
2. Click **"Deployments"** tab
3. Click **"..."** menu on latest deployment
4. Click **"Redeploy"**

### Test Build Locally Before Deploy:
```bash
cd frontend-main
npm run build
# Check if build folder created successfully

cd ../frontend-unified
npm run build
```

---

## 🎓 Best Practices

1. **Always test locally first**: Run `npm run build` to catch errors
2. **Use environment variables**: Keep API URLs configurable
3. **Monitor deployments**: Check Vercel dashboard for build status
4. **Keep dependencies updated**: Run `npm audit fix` periodically
5. **Use preview deployments**: Test changes before merging to main

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Create React App Deployment**: https://create-react-app.dev/docs/deployment/
- **Vercel CLI**: Install with `npm i -g vercel` for command-line deploys

---

**Ready to Deploy?** Follow the steps above! 🚀

**Estimated Time**: 25-30 minutes total (both frontends + CORS update)
