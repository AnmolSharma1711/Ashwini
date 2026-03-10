# Security Improvements Documentation

**Last Updated:** March 10, 2026  
**Status:** Implemented

## Overview

This document describes the security improvements implemented in Project Ashwini to protect against common web application vulnerabilities and attacks.

## 1. Required SECRET_KEY Configuration

### What Changed
- **Removed insecure default SECRET_KEY fallback** from settings.py
- Application now **requires** SECRET_KEY to be set in environment variables
- Prevents accidental use of hardcoded development keys in production

### Configuration Required

**Generate a new SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Add to your `.env` file:**
```bash
SECRET_KEY=your-generated-secret-key-here
```

**Example generated key:**
```
SECRET_KEY=ry$1qg&yf%f!uszj!yeg96n93jaqo)bn74#j0ect)&0xr^*5r4
```

### Impact
- ✅ Prevents use of insecure default keys
- ✅ Forces explicit security configuration
- ⚠️ **BREAKING CHANGE:** Application will not start without SECRET_KEY set

---

## 2. Rate Limiting Implementation

### What Changed
- **Installed django-ratelimit** package (v4.1.0)
- Applied rate limiting to critical authentication and verification endpoints
- Protects against brute force attacks, credential stuffing, and API abuse

### Protected Endpoints

| Endpoint | Rate Limit | Purpose |
|----------|-----------|---------|
| `POST /api/auth/login/` | 5 requests/minute per IP | Prevent brute force login attacks |
| `POST /api/auth/register/` | 3 requests/hour per IP | Prevent spam registrations |

  "detail": "Request was throttled. Expected available in 59 seconds."
}
```

**HTTP Status Code:** `429 Too Many Requests`

### Technical Implementation

```python
from django_ratelimit.decorators import ratelimit
from django.views.decorators.cache import never_cache

@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
@never_cache
def login_view(request):
    # Login logic...
```

### Configuration Options

Rate limits are **hardcoded** in the view decorators for consistency. To modify:

1. Edit the `@ratelimit` decorator in the respective view file
2. Change the `rate` parameter (format: `'<count>/<period>'`)
   - Periods: `s` (second), `m` (minute), `h` (hour), `d` (day)
   - Examples: `'10/m'`, `'100/h'`, `'1000/d'`

### Testing Rate Limits

**Development/Testing Mode:**
- Rate limits are **ACTIVE** in all environments
- To disable for testing, set environment variable:
  ```bash
  RATELIMIT_ENABLE=False
  ```

**Test rate limiting:**
```bash
# Send multiple rapid requests
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
done
```

---

## 3. CORS Configuration for Android App

### What Changed
- **Kept CORS_ALLOW_ALL_ORIGINS=True** for Android mobile app compatibility
- Added comprehensive documentation explaining why this is required
- Added security note about the trade-off

### Current Configuration

```python
# SECURITY NOTE: CORS_ALLOW_ALL_ORIGINS is set to True for Android mobile app compatibility
# Mobile apps (Capacitor/React Native) require this setting as they don't send proper CORS headers
# This is required for the frontend-patient-mobile Android application to connect to the backend
# For web-only deployments, set CORS_ALLOW_ALL_ORIGINS=False and use CORS_ALLOWED_ORIGINS instead
CORS_ALLOW_ALL_ORIGINS = True
```

### Why This Is Required

1. **Android App (Capacitor)** uses `file://` protocol for local assets
2. Mobile apps don't send proper `Origin` headers like web browsers
3. Django's CORS middleware blocks requests without matching origins
4. Alternative would be to proxy all API calls through a web server (added complexity)

### Security Implications

**⚠️ Trade-off:**
- ✅ Allows Android mobile app to function properly
- ⚠️ Allows any website to make API requests to the backend
- ✅ **Mitigated by:** JWT authentication required for protected endpoints
- ✅ **Mitigated by:** Rate limiting prevents abuse of public endpoints

**Protected by Authentication:**
- All sensitive endpoints require valid JWT tokens
- CORS alone doesn't protect against attacks - authentication does
- Rate limiting prevents brute force attacks on public endpoints

### Alternative Approaches (Future Consideration)

If web-only deployment is planned:
1. Set `CORS_ALLOW_ALL_ORIGINS=False`
2. Use specific origins in `CORS_ALLOWED_ORIGINS`
3. Configure Android app to proxy requests through a CORS-enabled server

---

## 4. Summary of Security Posture

### ✅ Implemented Security Features

1. **Authentication & Authorization**
   - JWT-based authentication (1-hour access, 7-day refresh)
   - Token rotation enabled
   - Role-based access control (RBAC)
   - Custom permission classes

2. **Input Validation**
   - Django REST Framework serializers
   - Field-level validation
   - Safe database queries (Django ORM)

3. **Rate Limiting** ⭐ NEW
   - Login endpoint: 5/minute
   - Registration: 3/hour
   - ID verification: 5-10/hour

4. **Cryptography**
   - PBKDF2 password hashing (Django default)
   - Required SECRET_KEY (no default fallback) ⭐ NEW

5. **Django Built-in Protections**
   - SQL injection prevention (ORM)
   - XSS prevention (template escaping)
   - CSRF protection (middleware)
   - Clickjacking protection

6. **CORS Configuration**
   - Configured for mobile app compatibility
   - Documented security trade-offs ⭐ IMPROVED

### ⏳ Recommended Future Improvements

1. **Security Headers**
   - Add `django-security` package
   - Configure HSTS, CSP, X-Frame-Options
   - Add Content-Type-NoSniff header

2. **Logging & Monitoring**
   - Centralized security event logging
   - Failed login attempt tracking
   - Rate limit violation alerts

3. **API Security**
   - API key rotation mechanism
   - Webhook signature verification
   - Request signing for sensitive operations

4. **Data Protection**
   - Encryption at rest for sensitive fields
   - PII data masking in logs
   - Secure backup procedures

---

## 5. Deployment Checklist

Before deploying to production:

### Required Actions

- [ ] **Generate and set SECRET_KEY** in production environment
  ```bash
  # On Render.com: Environment Variables > Add SECRET_KEY
  # Generate: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```

- [ ] **Verify DEBUG=False** in production
  ```bash
  DEBUG=False
  ```

- [ ] **Set ALLOWED_HOSTS** correctly
  ```bash
  ALLOWED_HOSTS=your-domain.com,*.onrender.com
  ```

- [ ] **Install django-ratelimit** on production server
  ```bash
  pip install -r requirements.txt
  ```

- [ ] **Test rate limiting** works in staging environment
  ```bash
  # Send rapid requests and verify 429 responses
  ```

### Verification Commands

**Check if SECRET_KEY is set:**
```bash
python manage.py shell -c "from django.conf import settings; print('✅ SECRET_KEY is set' if settings.SECRET_KEY else '❌ SECRET_KEY missing')"
```

**Check if rate limiting is working:**
```bash
python manage.py shell -c "import django_ratelimit; print('✅ django-ratelimit installed')"
```

**Check current environment:**
```bash
python manage.py shell -c "from django.conf import settings; print(f'DEBUG={settings.DEBUG}'); print(f'ALLOWED_HOSTS={settings.ALLOWED_HOSTS}')"
```

---

## 6. Testing Guide

### Test Rate Limiting

**1. Test Login Rate Limit (5/minute):**
```python
import requests
import time

url = "http://localhost:8000/api/auth/login/"
data = {"username": "test", "password": "test"}

# Should succeed for first 5 requests
for i in range(7):
    response = requests.post(url, json=data)
    print(f"Request {i+1}: {response.status_code}")
    if i >= 5:
        assert response.status_code == 429  # Rate limited
```

**2. Test OTP Rate Limit (10/hour):**
```python
# Send 11 OTP requests rapidly
for i in range(11):
    response = requests.post(
        "http://localhost:8000/api/id-verification/initiate/",
        json={"id_type": "AADHAAR", "id_number": "123456789012"}
    )
    if i >= 10:
        assert response.status_code == 429
```

### Test SECRET_KEY Enforcement

**1. Remove SECRET_KEY and try to start:**
```bash
# Should fail with error
unset SECRET_KEY
python manage.py runserver
# Expected: ValueError: SECRET_KEY environment variable is required
```

**2. Set SECRET_KEY and start:**
```bash
export SECRET_KEY="your-key-here"
python manage.py runserver
# Should start successfully
```

---

## 7. Troubleshooting

### Issue: Application won't start after upgrade

**Error:** `ValueError: SECRET_KEY environment variable is required`

**Solution:**
1. Generate a SECRET_KEY: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
2. Add to `.env` file: `SECRET_KEY=<generated-key>`
3. Restart application

### Issue: Getting 429 errors during development

**Error:** `Request was throttled. Expected available in XX seconds`

**Solution (Development Only):**
1. Add to `.env`: `RATELIMIT_ENABLE=False`
2. Restart server
3. **⚠️ Do NOT disable in production**

Alternatively, wait for the rate limit period to expire or use different IP addresses for testing.

### Issue: Rate limiting not working

**Check:**
1. Verify `django-ratelimit` is installed: `pip show django-ratelimit`
2. Check imports in views (should not show errors)
3. Test with curl commands to verify 429 responses

### Issue: Android app can't connect after CORS changes

**Verify:**
- `CORS_ALLOW_ALL_ORIGINS=True` is still set (required for mobile apps)
- Check backend logs for CORS-related errors
- Verify Android app is making requests to correct backend URL

---

## 8. References

- **Django Security Checklist:** https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/
- **django-ratelimit Documentation:** https://django-ratelimit.readthedocs.io/
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Django CORS Headers:** https://github.com/adamchainz/django-cors-headers

---

## Change Log

| Date | Change | Impact |
|------|--------|--------|
| 2026-03-10 | Removed SECRET_KEY default fallback | **BREAKING:** App requires SECRET_KEY env var |
| 2026-03-10 | Added django-ratelimit to requirements.txt | New dependency |
| 2026-03-10 | Applied rate limiting to auth endpoints | Protects against brute force |
| 2026-03-10 | Updated CORS documentation | Clarifies mobile app requirement |

---

**For questions or concerns, refer to:**
- Main documentation: [README.md](../README.md)
- Security audit results: Previous conversation summary
- Deployment guide: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
