# Preventing Render Backend Sleep

Render's free tier puts services to sleep after 15 minutes of inactivity. This guide provides multiple solutions to keep your backend alive.

## 📋 Solutions Overview

| Solution | Cost | Reliability | Setup Difficulty |
|----------|------|-------------|------------------|
| Upgrade to Paid Plan | $7/month | ⭐⭐⭐⭐⭐ | Easy |
| External Monitoring | Free | ⭐⭐⭐⭐ | Easy |
| GitHub Actions | Free | ⭐⭐⭐⭐ | Medium |
| Frontend Keep-Alive | Free | ⭐⭐⭐ | Medium |
| Python Script | Free | ⭐⭐⭐⭐ | Easy |

---

## 🚀 Solution 1: Upgrade to Paid Plan (Recommended)

**Best for:** Production applications with users

**Pros:**
- Always running, no cold starts
- Better performance
- More resources

**Setup:**
1. Go to your Render dashboard
2. Upgrade your service to a paid plan ($7/month or higher)
3. Done! Your backend will never sleep

---

## 🔔 Solution 2: External Monitoring Service (Easiest Free Option)

**Best for:** Quick setup without code changes

### Using UptimeRobot (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create a free account
3. Add a new monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Ashwini Backend Keep-Alive
   - **URL:** `https://your-render-app.onrender.com/api/health/`
   - **Monitoring Interval:** 5 minutes
4. Save and activate

### Using Cron-Job.org (Free)

1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Create a new cron job:
   - **Title:** Keep Ashwini Backend Alive
   - **Address:** `https://your-render-app.onrender.com/api/health/`
   - **Schedule:** Every 10 minutes
4. Save and enable

---

## 🤖 Solution 3: GitHub Actions (Automated & Free)

**Best for:** Projects already using GitHub

**Setup:**

1. The workflow file is already created at `.github/workflows/keep-alive.yml`

2. Update the workflow file with your actual Render URL:
   ```bash
   # Edit the file and replace:
   https://your-render-app-name.onrender.com
   # with your actual URL like:
   https://ashwini-backend.onrender.com
   ```

3. Commit and push to GitHub:
   ```bash
   git add .github/workflows/keep-alive.yml
   git commit -m "Add backend keep-alive workflow"
   git push
   ```

4. Enable GitHub Actions in your repository (if not already enabled)

The workflow will ping your backend every 10 minutes automatically.

---

## 💻 Solution 4: Frontend Keep-Alive (Integrated)

**Best for:** When users frequently use your frontend

**Setup:**

The keep-alive service has been integrated into both frontends and will automatically start when users visit your app.

**How it works:**
- When a user opens your frontend, it starts pinging the backend every 10 minutes
- Keeps backend alive as long as at least one user has the app open
- No additional setup required

**To customize:**

Edit `frontend-main/src/services/keepAlive.js` or `frontend-unified/src/services/keepAlive.js`:

```javascript
const PING_INTERVAL = 10 * 60 * 1000; // Change interval here (in milliseconds)
```

---

## 🐍 Solution 5: Python Keep-Alive Script

**Best for:** Running on your local machine or a server

**Setup:**

1. Install required package:
   ```bash
   pip install requests
   ```

2. Update the backend URL in `keep_alive.py`:
   ```python
   BACKEND_URL = "https://your-actual-render-app.onrender.com"
   ```

3. Run the script:
   ```bash
   # Run in foreground
   python keep_alive.py
   
   # Or run in background (Linux/Mac)
   nohup python keep_alive.py &
   
   # Or run in background (Windows PowerShell)
   Start-Process python -ArgumentList "keep_alive.py" -WindowStyle Hidden
   ```

The script will ping your backend every 10 minutes and log the status.

---

## 🎯 Recommended Approach

**For Development/Testing:**
- Use **External Monitoring Service** (UptimeRobot) - Quick and free

**For Production:**
1. **Best:** Upgrade to Render paid plan
2. **Alternative:** Combine multiple free solutions:
   - GitHub Actions (primary)
   - Frontend Keep-Alive (backup when users are active)
   - External Monitoring (monitoring + backup)

---

## 📊 Testing Your Setup

After implementing any solution, verify it's working:

1. **Check your health endpoint:**
   ```bash
   curl https://your-render-app.onrender.com/api/health/
   ```
   
   Should return:
   ```json
   {"status": "healthy", "service": "ashwini-backend"}
   ```

2. **Monitor in Render Dashboard:**
   - Go to your service in Render
   - Check the "Events" tab
   - You should see regular activity without "Service sleeping" events

3. **Test cold start time:**
   - After 20 minutes of no activity, make a request
   - If keep-alive is working, response should be instant
   - If sleeping, first request will take 30-60 seconds

---

## 🔧 Troubleshooting

### Backend still sleeping?

1. **Check interval timing:**
   - Render sleeps after 15 minutes
   - Ensure your ping interval is < 15 minutes (recommend 10 minutes)

2. **Verify health endpoint:**
   ```bash
   curl -I https://your-render-app.onrender.com/api/health/
   ```
   Should return HTTP 200

3. **Check logs:**
   - GitHub Actions: Check workflow runs in GitHub
   - Python script: Check console output
   - Frontend: Check browser console (F12)

4. **Multiple solutions:**
   - Use 2-3 solutions together for redundancy
   - Example: GitHub Actions + External Monitor

### Need help?

Check Render logs in your dashboard under "Logs" tab to see if requests are being received.

---

## 📝 Configuration Checklist

- [ ] Backend deployed on Render
- [ ] Health endpoint working (`/api/health/`)
- [ ] Updated all Render URLs in config files
- [ ] Chose and implemented at least one keep-alive solution
- [ ] Tested that backend responds quickly after 20+ minutes
- [ ] Set up monitoring/alerts (optional)

---

## 💡 Pro Tips

1. **Combine solutions:** Use GitHub Actions + External Monitor for 99.9% uptime
2. **Monitor uptime:** Use UptimeRobot even with paid plan for alerts
3. **Optimize interval:** 10 minutes is ideal (safe margin before 15-minute timeout)
4. **Health endpoint:** Keep it lightweight - no database queries needed
5. **Environment variables:** Set `BACKEND_URL` in all scripts to your actual Render URL

---

## 📞 Support

If you're still experiencing issues:
1. Check Render service status: https://status.render.com
2. Review Render documentation: https://render.com/docs
3. Verify your Render plan limits and quotas

