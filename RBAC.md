# 🔐 Role-Based Access Control (RBAC)

## Overview

Complete JWT-based authentication system with role-based portal access control.

**Roles:** ADMIN, DOCTOR, NURSE, RECEPTION, PATIENT

| Role | Frontend-Main (Nurses) | Frontend-Unified (Doctors) |
|------|----------------------|--------------------------|
| ADMIN | ✅ Full Access | ✅ Full Access |
| DOCTOR | ❌ Blocked | ✅ Full Access |
| NURSE | ✅ Full Access | ❌ Blocked |
| RECEPTION | ✅ Full Access | ❌ Blocked |

---

## Quick Deploy

### 1. Backend (5 min)
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
git add . && git commit -m "Add RBAC" && git push
```

**Render Environment Variables:**
```
CORS_ALLOWED_ORIGINS=https://frontend-main.vercel.app,https://frontend-unified.vercel.app,http://localhost:3000,http://localhost:4000
```

After deployment, run in Render Shell:
```bash
python manage.py migrate
```

### 2. Frontend-Main (3 min)
```bash
cd frontend-main
npm install react-router-dom@6

# Create .env
echo "REACT_APP_API_URL=https://ashwini-backend.onrender.com" > .env
echo "REACT_APP_UNIFIED_PORTAL_URL=https://frontend-unified.vercel.app" >> .env

vercel --prod
```

### 3. Frontend-Unified (3 min)
```bash
cd frontend-unified
npm install react-router-dom@6

# Create .env
echo "REACT_APP_API_URL=https://ashwini-backend.onrender.com" > .env
echo "REACT_APP_MAIN_PORTAL_URL=https://frontend-main.vercel.app" >> .env

vercel --prod
```

---

## Creating Users

**Django Admin:** `https://ashwini-backend.onrender.com/admin/`

1. Users → Add User → Enter username/password → Save
2. Edit user → Scroll to "Role & Access" → Select role → Save

**Create Different User Roles:**
- **ADMIN** - Can access both portals
- **DOCTOR** - Can only access frontend-unified (Doctor's Portal)
- **NURSE** - Can only access frontend-main (Registration Portal)
- **RECEPTION** - Can only access frontend-main (Registration Portal)

---

## Testing Checklist

- [ ] ✅ Login as ADMIN to frontend-main → Success
- [ ] ✅ Login as ADMIN to frontend-unified → Success
- [ ] ✅ Login as DOCTOR to frontend-unified → Success
- [ ] ❌ Login as DOCTOR to frontend-main → Error
- [ ] ✅ Login as NURSE to frontend-main → Success
- [ ] ❌ Login as NURSE to frontend-unified → Error
- [ ] ✅ Logout clears localStorage
- [ ] ✅ Token auto-refreshes (check Network tab)

---

## API Endpoints

```
POST   /api/auth/login/          # Login (returns JWT + user)
POST   /api/auth/register/       # Register new user
GET    /api/auth/me/             # Get current user
POST   /api/auth/logout/         # Logout (blacklist token)
POST   /api/auth/token/refresh/  # Refresh access token
```

**Example Login:**
```bash
curl -X POST https://ashwini-backend.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

**Response:**
```json
{
  "access": "eyJ0eXAiOi...",
  "refresh": "eyJ0eXAiOi...",
  "user": {
    "id": 2,
    "username": "your_username",
    "role": "DOCTOR",
    "first_name": "First",
    "last_name": "Last"
  }
}
```

---

## Implementation Details

### Backend Files Created
- `patients/models.py` - CustomUser with role field
- `patients/permissions.py` - IsPortalAuthorized permission
- `patients/auth_serializers.py` - Auth serializers
- `patients/auth_views.py` - Login/register/logout views
- `patients/auth_urls.py` - Auth URL routing
- `ashwini_backend/settings.py` - JWT config, CORS
- `requirements.txt` - Added djangorestframework-simplejwt

### Frontend-Main Files Created
- `src/services/authService.js` - Auth management
- `src/components/Login.js` - Login page (blue theme)
- `src/components/RoleProtectedRoute.js` - Route protection
- `src/api.js` - JWT interceptors + X-Portal-Source header

### Frontend-Unified Files Created
- `src/services/authService.js` - Auth management
- `src/components/Login.js` - Login page (green theme)
- `src/components/RoleProtectedRoute.js` - Route protection
- `src/api.js` - JWT interceptors + X-Portal-Source header

---

## Security Features

- **JWT Tokens:** Access (1hr), Refresh (7d), auto-rotation
- **Dual Protection:** Frontend (RoleProtectedRoute) + Backend (IsPortalAuthorized)
- **CORS Security:** Only allowed origins can make requests
- **Token Blacklisting:** Refresh tokens invalidated on logout
- **Portal Identification:** X-Portal-Source header for backend validation

---

## Troubleshooting

**CORS Error**
- Fix: Add frontend URLs to `CORS_ALLOWED_ORIGINS` in Render

**Invalid credentials**
- Fix: Check Django Admin → Users → Verify user exists

**Access Denied**
- Fix: Update user's role in Django Admin

**401 on every request**
- Fix: Logout and login again, or clear localStorage

**React Router v7 errors**
- Fix: Downgrade to v6: `npm install react-router-dom@6`

---

## Integration Example

**Update App.js:**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import YourComponent from './components/YourComponent';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <RoleProtectedRoute>
            <YourComponent />
          </RoleProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

**Use Auth in Components:**
```javascript
import { getCurrentUser, getUserRole, logout } from '../services/authService';

const user = getCurrentUser();
const role = getUserRole();

// Logout
await logout();
window.location.href = '/login';
```

---

## Success Criteria

✅ Doctors can only login to unified portal  
✅ Nurses can only login to main portal  
✅ Admins can access both portals  
✅ Wrong portal shows clear error  
✅ JWT visible in Network tab (Authorization: Bearer)  
✅ Auto-refresh works on token expiry  
✅ Logout clears all session data  

---

**Status:** ✅ Production Ready | **Date:** March 3, 2026
