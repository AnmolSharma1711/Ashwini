# Security Update - Quick Setup Guide

## ⚠️ IMPORTANT: Required Actions After Update

This update implements critical security improvements. **Your application will not start** until you complete these steps.

## Step 1: Generate SECRET_KEY (REQUIRED)

Run this command to generate a secure SECRET_KEY:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Example output:**
```
ry$1qg&yf%f!uszj!yeg96n93jaqo)bn74#j0ect)&0xr^*5r4
```

## Step 2: Update Your .env File (REQUIRED)

Add the generated SECRET_KEY to your `backend/.env` file:

```bash
# Required - Application won't start without this
SECRET_KEY=ry$1qg&yf!uszj!yeg96n93jaqo)bn74#j0ect)&0xr^*5r4

# Existing settings...
DEBUG=True
# ... rest of your .env file
```

## Step 3: Install New Dependencies (REQUIRED)

The django-ratelimit package is already installed. If you need to reinstall:

```bash
cd backend
pip install -r requirements.txt
```

## Step 4: Test Your Setup

Start the development server to verify everything works:

```bash
cd backend
python manage.py runserver
```

**Expected:** Server starts successfully  
**If you see error:** `ValueError: SECRET_KEY environment variable is required` → Go back to Step 2

## What Changed?

### ✅ Security Improvements

1. **Required SECRET_KEY**
   - Removed insecure default SECRET_KEY
   - Application now requires explicit SECRET_KEY configuration
   - Prevents accidental use of development keys in production

2. **Rate Limiting**
   - Login: 5 attempts/minute per IP
   - Registration: 3 attempts/hour per IP
   - Protects against brute force attacks

3. **CORS Documentation**
   - Kept `CORS_ALLOW_ALL_ORIGINS=True` for Android app compatibility
   - Added clear documentation explaining why this is required

## Rate Limits Overview

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| Login | 5/min | Prevent brute force |
| Registration | 3/hour | Prevent spam |

## Testing Rate Limits

Send multiple rapid requests to test:

```bash
# Test login rate limit (will block after 5 requests)
for i in {1..7}; do
  curl -X POST http://localhost:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo "Request $i"
done
```

**Expected:** First 5 succeed, requests 6-7 return `429 Too Many Requests`

## For Production Deployment

Update your hosting platform's environment variables:

**Render.com:**
1. Go to Dashboard → Your Service → Environment
2. Add: `SECRET_KEY` = `<your-generated-key>`
3. Save and redeploy

**Heroku:**
```bash
heroku config:set SECRET_KEY="your-generated-key"
```

**Vercel/Other:**
Add SECRET_KEY to environment variables in platform settings

## Troubleshooting

### App won't start: "SECRET_KEY environment variable is required"

**Fix:** Add SECRET_KEY to your `.env` file (see Step 2)

### Getting 429 errors during testing

**Expected behavior** - rate limiting is working!

**To disable during development** (not recommended):
```bash
# Add to .env
RATELIMIT_ENABLE=False
```

### Android app can't connect

**Verify:** CORS_ALLOW_ALL_ORIGINS is still True in settings.py
- This setting is **required** for the mobile app to work
- We kept it enabled for your Android application

## Documentation

For detailed information, see:
- [SECURITY_IMPROVEMENTS.md](Documentation/SECURITY_IMPROVEMENTS.md) - Full security documentation
- [ID_VERIFICATION_GUIDE.md](backend/ID_VERIFICATION_GUIDE.md) - ID verification setup
- [README.md](README.md) - Project overview

## Need Help?

If you encounter issues:
1. Check that SECRET_KEY is set in `.env`
2. Verify django-ratelimit is installed: `pip show django-ratelimit`
3. Check Django version: `python manage.py --version` (should be 4.2+)
4. Review error messages carefully

---

**Status:** ✅ Ready for deployment after completing steps above
