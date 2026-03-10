# Deployment Checklist for Ashwini Project

## ✅ Completed Cleanup Tasks

### Backend
- ✅ Removed debug/test scripts:
  - check_all_data.py
  - check_all_patients.py
  - check_measurements.py
  - check_orphaned_data.py
  - check_patients.py
  - check_user.py
  - test_api_logic.py

- ✅ Environment Configuration:
  - DEBUG mode controlled by environment variable
  - SECRET_KEY uses environment variable
  - ALLOWED_HOSTS configurable via environment
  - Database URL supports both SQLite (dev) and PostgreSQL (production)

- ✅ Created .env.example with all required environment variables

### Frontend (All 3 apps)
- ✅ Removed console.log statements from production code
- ✅ API URLs configured via environment variables
- ✅ Created .env.example files for all frontends:
  - frontend-main/.env.example
  - frontend-unified/.env.example
  - frontend-patient/.env.example

- ✅ .gitignore properly configured for all frontends

## 📋 Pre-Deployment Checklist

### Backend Deployment (Render/Heroku/Railway)

1. **Environment Variables** - Set these in your hosting platform:
   ```
   # REQUIRED - Application will NOT start without this
   SECRET_KEY=<your-generated-secret-key-from-command-below>
   # Generate using: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   
   DEBUG=False
   ALLOWED_HOSTS=your-backend-domain.com
   DATABASE_URL=<provided-by-hosting-platform>
   
   # REQUIRED FOR CORS - Your deployed frontend URLs
   CORS_ALLOWED_ORIGINS=https://your-main-frontend.vercel.app,https://your-unified-frontend.vercel.app,https://your-patient-frontend.vercel.app
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Azure (for document intelligence)
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your_endpoint
   AZURE_DOCUMENT_INTELLIGENCE_KEY=your_key
   
   # Superuser
   DJANGO_SUPERUSER_USERNAME=admin
   DJANGO_SUPERUSER_EMAIL=admin@ashwini.com
   DJANGO_SUPERUSER_PASSWORD=<strong-password>
   ```

2. **Database**:
   - Use PostgreSQL in production (Render provides this)
   - SQLite is for development only

3. **Static Files**:
   - Run: `python manage.py collectstatic --no-input`
   - Configured in build.sh

4. **Migrations**:
   - Automatically run via start.sh on deployment

### Frontend Deployment (Vercel/Netlify)

**Frontend-Main (Registration Portal)**
1. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-domain.com
   ```
2. Build command: `npm run build`
3. Output directory: `build`

**Frontend-Unified (Doctor's Portal)**
1. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-domain.com
   ```
2. Build command: `npm run build`
3. Output directory: `build`

**Frontend-Patient (Patient Portal)**
1. Set environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```
2. Build command: `npm run build`
3. Output directory: `dist`

## 🔒 Security Considerations

- ✅ SECRET_KEY not hardcoded (REQUIRED - app won't start without it)
- ✅ Rate limiting enabled (5 login attempts/minute, 3 registrations/hour)
- ✅ DEBUG=False in production
- ✅ ALLOWED_HOSTS restricted
- ✅ CORS properly configured (allows all origins for Android app compatibility)
- ✅ JWT authentication enabled
- ✅ Role-based access control implemented
- ✅ Sensitive files (.env, db.sqlite3) in .gitignore

## 📁 Files Safe to Delete Before Deployment

These files are already in .gitignore and won't be committed:
- `backend/db.sqlite3` (development database)
- `backend/__pycache__/` directories
- `backend/venv/` directory
- `frontend-*/node_modules/` directories
- `frontend-*/.env` files (use .env.example as template)
- `backend/media/` (production uses Cloudinary)

## 🚀 Deployment Order

1. **Deploy Backend First**
   - Get the backend URL
   - Verify it's running: `https://your-backend.com/api/health/` (if health endpoint exists)

2. **Deploy Frontends**
   - Set REACT_APP_API_URL / VITE_API_BASE_URL to backend URL
   - Deploy each frontend separately

3. **Post-Deployment**
   - Test login on all portals
   - Verify patient registration
   - Test IoT device connection
   - Test prescription and report features

## 📝 Notes

- All test/debug files have been removed
- Console.log statements removed from production code
- Environment variables properly configured
- .gitignore files updated
- Ready for deployment! 🎉
