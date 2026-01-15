# ⚡ Vercel Deployment Quick Checklist

## ✅ Pre-Deployment (Done!)
- [x] vercel.json created for both frontends
- [x] package.json updated with vercel-build script
- [x] API URLs configured to use deployed backend
- [x] Changes ready to push

---

## 🚀 Your Steps (25 minutes)

### 1️⃣ Push Changes to GitHub (2 min)
```bash
git add .
git commit -m "Add Vercel deployment config"
git push
```

### 2️⃣ Deploy Frontend-Main (10 min)
- [ ] Go to https://vercel.com and sign up/login with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import your Ashwini repository
- [ ] **Root Directory**: `frontend-main` ⚠️
- [ ] Project Name: `ashwini-frontend-main`
- [ ] Framework: Create React App
- [ ] Click "Deploy" and wait
- [ ] **Copy URL**: ___________________________

### 3️⃣ Deploy Frontend-Unified (10 min)
- [ ] Click "Add New..." → "Project" again
- [ ] Select Ashwini repository
- [ ] **Root Directory**: `frontend-unified` ⚠️
- [ ] Project Name: `ashwini-frontend-unified`
- [ ] Framework: Create React App
- [ ] Click "Deploy" and wait
- [ ] **Copy URL**: ___________________________

### 4️⃣ Update Backend CORS (3 min)
- [ ] Go to https://dashboard.render.com
- [ ] Open ashwini-backend service
- [ ] Go to Environment tab
- [ ] Add/Update: `CORS_ALLOWED_ORIGINS`
- [ ] Value: `https://YOUR-MAIN-URL.vercel.app,https://YOUR-UNIFIED-URL.vercel.app`
- [ ] Save (auto-redeploys)

### 5️⃣ Test Everything (5 min)
- [ ] Visit Frontend-Main URL → Register a patient
- [ ] Visit Frontend-Unified URL → View patient data
- [ ] Check browser console for errors
- [ ] Verify data flows between frontend ↔ backend

---

## 🔗 Important URLs to Save

After deployment, save these:

```
Backend:  https://ashwini-backend.onrender.com
Main:     https://_________________.vercel.app
Unified:  https://_________________.vercel.app
```

---

## ⚠️ Common Pitfalls

1. **Forgot Root Directory**: Must set `frontend-main` or `frontend-unified`
2. **CORS Error**: Update backend CORS_ALLOWED_ORIGINS with Vercel URLs
3. **Build Failed**: Check Vercel logs - usually wrong directory
4. **Backend Sleeping**: First request takes 30 sec if using free tier

---

## 💡 Pro Tips

- ✅ Vercel auto-deploys on every git push
- ✅ Free SSL certificates (HTTPS) included
- ✅ Preview deployments for pull requests
- ✅ 100 GB bandwidth/month on free plan

---

See **FRONTEND_DEPLOYMENT_GUIDE.md** for detailed instructions!
