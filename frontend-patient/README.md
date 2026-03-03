# Ashwini Patient Portal

A secure patient portal for the Ashwini Healthcare System where patients can register, view their medical records, prescriptions, vital signs, and appointment information.

## Features

- ✅ **Patient Self-Registration** - Create account with personal information
- ✅ **Secure Login** - JWT-based authentication
- ✅ **Dashboard** - Overview of health status and upcoming appointments
- ✅ **Profile Management** - View personal and health information
- ✅ **Vital Signs** - Complete history of health measurements
- ✅ **Prescriptions** - View current medications
- ✅ **Visits** - Medical visit history and appointments
- ✅ **Responsive Design** - Works on desktop and mobile devices

## Prerequisites

- Node.js >= 18.0.0
- Backend API running at `https://ashwini-backend.onrender.com`

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The application will run at: `http://localhost:3002`

## Backend API Endpoints Used

This portal uses the following backend endpoints (all implemented in `backend/patients/patient_portal_views.py`):

### 1. Patient Registration
```
POST /api/patient-portal/register/
```
**Description:** Patient self-registration  
**Auth Required:** No  
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password_confirm": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "age": number,
  "gender": "Male|Female|Other",
  "address": "string"
}
```
**Response:**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {...},
  "patient_id": number,
  "message": "Patient registered successfully"
}
```

### 2. Patient Login
```
POST /api/auth/login/
```
**Description:** Authenticate patient  
**Auth Required:** No  
**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

### 3. Get Current User
```
GET /api/auth/me/
```
**Description:** Get current authenticated user details  
**Auth Required:** Yes (Bearer Token)  
**Response:**
```json
{
  "id": number,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "PATIENT"
}
```

### 4. Get Patient Profile
```
GET /api/patient-portal/profile/
```
**Description:** Get patient profile with health information  
**Auth Required:** Yes (PATIENT role only)  
**Response:**
```json
{
  "id": number,
  "name": "string",
  "age": number,
  "gender": "string",
  "phone": "string",
  "address": "string",
  "status": "waiting|completed|cancelled",
  "health_status": "normal|critical|stable",
  "visit_time": "datetime",
  "next_visit_date": "date",
  "latest_measurement": {...},
  "prescription": {...}
}
```

### 5. Get Patient Measurements
```
GET /api/patient-portal/measurements/
```
**Description:** Get all vital measurements for the patient  
**Auth Required:** Yes (PATIENT role only)  
**Response:** Array of measurement objects
```json
[
  {
    "id": number,
    "timestamp": "datetime",
    "blood_pressure": "string",
    "temperature": number,
    "spo2": number,
    "heart_rate": number,
    "source": "device|manual"
  }
]
```

### 6. Get Patient Prescription
```
GET /api/patient-portal/prescription/
```
**Description:** Get current prescription for the patient  
**Auth Required:** Yes (PATIENT role only)  
**Response:**
```json
{
  "patient": number,
  "medicines": [
    {
      "name": "string",
      "dose": "string",
      "type": "string",
      "quantity": "string"
    }
  ]
}
```

### 7. Get Patient Visits
```
GET /api/patient-portal/visits/
```
**Description:** Get visit history and appointments  
**Auth Required:** Yes (PATIENT role only)  
**Response:**
```json
{
  "current_visit": {
    "visit_time": "datetime",
    "reason": "string",
    "status": "string",
    "health_status": "string",
    "notes": "string",
    "next_visit_date": "date"
  }
}
```

### 8. Token Refresh
```
POST /api/auth/token/refresh/
```
**Description:** Refresh expired access token  
**Auth Required:** No  
**Request Body:**
```json
{
  "refresh": "refresh_token"
}
```
**Response:**
```json
{
  "access": "new_access_token"
}
```

## Frontend Structure

```
frontend-patient/
├── src/
│   ├── api/
│   │   └── axiosInstance.js      # Axios configuration with JWT interceptors
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication state management
│   ├── routes/
│   │   └── PrivateRoute.jsx      # Protected route wrapper
│   ├── pages/
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Profile.jsx           # Patient profile
│   │   ├── Measurements.jsx      # Vital signs history
│   │   ├── Prescription.jsx      # Prescriptions list
│   │   └── Visits.jsx            # Visit history
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── package.json
├── vite.config.js
└── index.html
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://ashwini-backend.onrender.com
```

## How to Use

### For New Patients

1. Visit the portal at `http://localhost:3002`
2. Click "Register here" on the login page
3. Fill in the registration form with:
   - Username and password
   - Personal information (name, age, gender)
   - Contact details (optional)
4. Submit the form
5. You'll be automatically logged in and redirected to the dashboard

### For Existing Patients

1. Visit the portal at `http://localhost:3002`
2. Enter your username and password
3. Click "Log In"
4. Access your dashboard and health information

### Navigation

- **Dashboard** - Overview of health status and latest information
- **Profile** - View personal and health information
- **Vitals** - Complete history of vital sign measurements
- **Prescription** - View current medications
- **Visits** - Medical visit history and next appointments
- **Logout** - Securely log out of the portal

## Security Features

- ✅ JWT-based authentication
- ✅ Automatic token refresh
- ✅ Role-based access control (PATIENT role only)
- ✅ Protected routes
- ✅ Secure token storage
- ✅ HTTPS communication with backend

## Important Notes

### Backend Requirements

This portal requires the backend to have:
1. ✅ `patient_portal_urls.py` - Already implemented
2. ✅ `patient_portal_views.py` - Already implemented
3. ✅ Patient model with user relationship
4. ✅ Measurements model
5. ✅ Prescriptions model
6. ✅ JWT authentication configured

### No Backend Changes Required

**All backend endpoints are already implemented!** The following files exist and are fully functional:

- `backend/patients/patient_portal_urls.py` - URL routing
- `backend/patients/patient_portal_views.py` - API views
- `backend/ashwini_backend/urls.py` - Main URL configuration (includes patient-portal routes)

### CORS Configuration

To allow the frontend to communicate with the backend, add the frontend URL to `CORS_ALLOWED_ORIGINS` environment variable on Render:

```
CORS_ALLOWED_ORIGINS=https://frontend-main.vercel.app,https://frontend-unified.vercel.app,http://localhost:3002
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend-patient
vercel --prod
```

Or use the Vercel Dashboard:
1. Import Git repository
2. Set root directory to `frontend-patient`
3. Add environment variable: `VITE_API_BASE_URL`
4. Deploy

## Troubleshooting

### CORS Errors
- Update `CORS_ALLOWED_ORIGINS` on Render to include your frontend URL

### 401 Unauthorized
- Check if access token is expired
- Token refresh should happen automatically
- If issues persist, log out and log in again

### Registration Fails
- Ensure all required fields are filled
- Username must be unique
- Password must be at least 6 characters
- Age must be between 1 and 150

### Empty Data on Dashboard
- Register through the main portal first (by healthcare staff)
- Add measurements through IoT devices or manual entry
- Ensure you have a patient profile linked to your user account

## Support

For issues or questions:
- Check backend API documentation
- Verify backend endpoints are running
- Check browser console for errors
- Ensure environment variables are set correctly

## License

Part of Project Ashwini Healthcare System
