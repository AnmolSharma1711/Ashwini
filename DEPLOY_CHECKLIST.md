# 🚀 Quick Deploy Checklist

## ✅ Completed
- [x] Settings updated for production (env variables)
- [x] Dependencies added (gunicorn, whitenoise, psycopg2)
- [x] Procfile and runtime.txt created
- [x] Changes pushed to GitHub

## 📋 Your Steps (30 minutes)

### 1️⃣ Create PostgreSQL Database (5 min)
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → PostgreSQL
- [ ] Name: `ashwini-db`, Free tier
- [ ] **Copy Internal Database URL** when ready

### 2️⃣ Deploy Web Service (10 min)
- [ ] Click "New +" → Web Service
- [ ] Connect GitHub repo
- [ ] **Root Directory**: `backend` ⚠️
- [ ] Build: `pip install -r requirements.txt`
- [ ] Start: `gunicorn ashwini_backend.wsgi --log-file -`
- [ ] Add environment variables:
  ```
  DATABASE_URL = <paste from step 1>
  SECRET_KEY = <generate random 50+ chars>
  DEBUG = False
  ALLOWED_HOSTS = ashwini-backend.onrender.com
  CORS_ALLOWED_ORIGINS = http://localhost:3000,http://localhost:4000
  ```
- [ ] Create service and wait for deploy

### 3️⃣ Run Migrations (2 min)
- [ ] Go to service → Shell tab
- [ ] Run: `python manage.py migrate`
- [ ] Run: `python manage.py collectstatic --noinput`

### 4️⃣ Test (3 min)
- [ ] Visit: `https://ashwini-backend.onrender.com/api/patients/`
- [ ] Should see `[]` (empty list)

### 5️⃣ Update Your Code (10 min)
- [ ] ESP32: Change URL in `keys.h` to `https://ashwini-backend.onrender.com`
- [ ] Frontend: Change URL in `api.js` to `https://ashwini-backend.onrender.com`
- [ ] Flash ESP32 with new code
- [ ] Rebuild and redeploy frontends

---

## 🔗 Important URLs

After deployment, save these:
- Backend API: `https://YOUR-SERVICE-NAME.onrender.com`
- Admin Panel: `https://YOUR-SERVICE-NAME.onrender.com/admin/`
- Database: (internal only - accessed via service)

---

## 💡 Pro Tips

1. **Generate SECRET_KEY**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(50))"
   ```

2. **Free Tier Note**: Service spins down after 15 min idle
   - First request after sleep = ~30 sec delay
   - Upgrade to $7/mo Starter to stay always-on

3. **Create Admin User** (optional):
   ```bash
   python manage.py createsuperuser
   ```

---

See **DEPLOYMENT_GUIDE.md** for detailed instructions with screenshots and troubleshooting!
