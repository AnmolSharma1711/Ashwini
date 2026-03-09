# Project Ashwini

**A Comprehensive IoT-Ready Healthcare Management Platform for Clinics and Hospitals**

Project Ashwini is an enterprise-grade, full-stack healthcare management system with multi-platform support, role-based access control, patient portal, mobile applications, and IoT device integration capabilities. The platform streamlines patient flow, vitals monitoring, prescription management, medical report analysis, and patient engagement.

---
## Live Application Links:
Patient Portal - https://ashwini-patient.vercel.app
Doctor's Portal - https://ashwini-unified-view.vercel.app
Reception Portal - https://ashwini-frontend-main.vercel.app
Patient Apk File- https://drive.google.com/file/d/1UoXjzWolk13Ztbwss2lLqTOc-DgAyMJZ/view?usp=sharing
---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Setup Instructions](#setup-instructions)
- [User Roles & RBAC](#user-roles--rbac)
- [API Endpoints](#api-endpoints)
- [IoT Integration](#iot-integration)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Project Ashwini is a complete healthcare ecosystem supporting multiple user types:

### Staff Portals
1. **Reception/Registration Staff**: Patient registration and queue management
2. **Nurses/Health Monitoring**: Record patient vitals (manual or IoT-based)
3. **Doctors**: Comprehensive patient view with vitals, prescriptions, medical reports, and notes

### Patient Portals
4. **Patient Web Portal**: Self-service access to health records, prescriptions, and visit history
5. **Patient Mobile App**: Native Android application for on-the-go health tracking

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Project Ashwini Platform                          │
│            Multi-Portal Healthcare Management System                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Main Frontend   │  │ Unified Frontend │  │  Patient Portal  │
│  (Port 4000)     │  │  (Port 3000)     │  │  (Vite)          │
│                  │  │                  │  │                  │
│ • Registration   │  │ • Doctor View    │  │ • Dashboard      │
│ • Health Monitor │  │ • Prescriptions  │  │ • Measurements   │
│ • Report Upload  │  │ • Patient Nav    │  │ • Prescriptions  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                                                      │
┌─────────────────────────────────────────────┐      │
│      Patient Mobile App (Android)           │      │
│                                             │      │
│  • Native Android (Capacitor)               │◄─────┘
│  • Health Tracking & Reports                │
│  • Offline Capability                       │
└─────────────────────────────────────────────┘
           │                    │                    │
           └────────────────────┼────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │   Django Backend     │
                    │   (Port 8000)        │
                    │                      │
                    │  • REST API          │
                    │  • JWT Auth          │
                    │  • RBAC              │
                    │  • PostgreSQL/SQLite │
                    └──────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │   External Services  │
                    │                      │
                    │  • Azure AI (OCR)    │
                    │  • Cloudinary        │
                    │  • IoT Devices       │
                    └──────────────────────┘
```

---

## ✨ Features

### Current Features

#### Patient Management
- **Patient Registration**: Complete demographic capture with auto-generated patient IDs
- **Queue Management**: Real-time status tracking (waiting → checking → examined → completed)
- **Multi-Visit Support**: Track visit history and patient journey
- **Patient Portal Integration**: Link patients to user accounts for self-service access

#### Health Monitoring
- **Manual Vitals Entry**: Blood pressure, temperature, SpO₂, heart rate, height, weight
- **Measurement History**: Track vitals over time with trend analysis
- **IoT-Ready Framework**: Pre-built models and endpoints for device integration
- **Real-time Updates**: Automatic synchronization across all interfaces

#### Clinical Management
- **Prescription Management**: Add/edit medicines with dose, type, and quantity
- **Prescription History**: Track medication changes across visits
- **Doctor's Notes**: Clinical observations and next visit scheduling
- **Patient Navigation**: Easy previous/next patient browsing for doctors

#### Medical Report Analysis
- **Report Upload**: Support for images and PDFs
- **AI-Powered OCR**: Azure Document Intelligence integration for text extraction
- **Key Phrase Analysis**: Automatic extraction of important medical terms
- **Cloud Storage**: Cloudinary integration for production deployments

#### Authentication & Security
- **JWT-Based Authentication**: Secure token-based auth for all portals
- **Role-Based Access Control (RBAC)**: Five user roles (Admin, Doctor, Nurse, Reception, Patient)
- **Portal-Specific Access**: Automatic routing based on user role
- **Consent Management**: GDPR-compliant consent logging

#### Patient Portal Features
- **Personal Dashboard**: Overview of health metrics and upcoming visits
- **Measurement Tracking**: View vitals history with interactive charts
- **Prescription Access**: Current and historical prescriptions
- **Visit History**: Comprehensive record of past consultations
- **Profile Management**: Update contact information and preferences

#### Mobile Application
- **Native Android App**: Built with Capacitor for native performance
- **Offline Support**: Access health data without internet
- **Push Notifications**: Appointment reminders and health alerts
- **Responsive Design**: Optimized for mobile devices
- **CI/CD Pipeline**: GitHub Actions for automated builds

### IoT-Ready Architecture
- **Device Management Models**: Complete device registration and tracking system
- **Measurement Session Tracking**: Workflow for device-initiated measurements
- **ESP32 Integration**: Sample code and setup guide for IoT devices
- **RESTful Device APIs**: Pre-built endpoints for device communication
- **Real-time Synchronization**: Automatic updates when devices submit data

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Authentication**: djangorestframework-simplejwt (JWT tokens)
- **Database**: SQLite (development) / PostgreSQL (production)
- **API**: RESTful JSON APIs with CORS support
- **AI Integration**: Azure Document Intelligence for OCR
- **Storage**: Cloudinary for media files (production)
- **Server**: Gunicorn with Whitenoise for static files

### Frontend Stack

#### Main Frontend (Staff Portal)
- **Framework**: React 18+ with Create React App
- **UI**: Bootstrap 5 + Custom CSS
- **HTTP**: Axios
- **Routing**: React Router v6
- **Markdown**: react-markdown with remark-gfm
- **Port**: 4000

#### Unified Frontend (Doctor's Portal)
- **Framework**: React 18+ with Create React App
- **UI**: Bootstrap 5 + Custom CSS
- **HTTP**: Axios
- **Routing**: React Router v6
- **Port**: 3000

#### Patient Portal (Web)
- **Framework**: React 18+ with Vite
- **UI**: Custom CSS with modern gradients
- **HTTP**: Axios
- **Routing**: React Router v6
- **Charts**: Recharts for health data visualization

#### Patient Mobile App
- **Framework**: React 18+ with Vite
- **Native**: Capacitor 6.0
- **Platform**: Android (iOS capable)
- **UI**: Responsive mobile-first design
- **Charts**: Recharts for health metrics
- **Build**: Gradle-based Android build system

### IoT Integration
- **Device**: ESP32 microcontrollers
- **Protocol**: HTTP/REST
- **Language**: Arduino (C++)

### Deployment & DevOps
- **Backend**: Render.com (or Heroku)
- **Frontend**: Vercel
- **Mobile**: Google Play Store (Android)
- **CI/CD**: GitHub Actions for Android builds
- **Version Control**: Git/GitHub

### Development Tools
- **Python**: 3.8+
- **Node.js**: 16+
- **Package Managers**: pip, npm
- **Scripts**: PowerShell automation scripts
- **Android Studio**: For mobile development

---

## 📁 Project Structure

```
Ashwini/
├── .github/                          # GitHub Configuration
│   ├── workflows/
│   │   └── android-build.yml         # CI/CD for Android app builds
│   └── ANDROID_BUILD_SETUP.md
│
├── backend/                          # Django Backend (Port 8000)
│   ├── ashwini_backend/              # Main Django project
│   │   ├── settings.py               # Django configuration (CORS, JWT, DB)
│   │   ├── urls.py                   # Root URL routing
│   │   ├── wsgi.py                   # WSGI application
│   │   └── asgi.py                   # ASGI application
│   │
│   ├── patients/                     # Patient Management App
│   │   ├── models.py                 # Patient, VisitHistory, ConsentLog
│   │   ├── views.py                  # Patient CRUD APIs
│   │   ├── serializers.py            # Patient serializers
│   │   ├── auth_models.py            # CustomUser with RBAC roles
│   │   ├── auth_views.py             # JWT login/register/role endpoints
│   │   ├── auth_serializers.py       # Authentication serializers
│   │   ├── auth_urls.py              # Auth API routes
│   │   ├── patient_portal_views.py   # Patient portal-specific views
│   │   ├── patient_portal_urls.py    # Patient portal API routes
│   │   ├── permissions.py            # Custom permission classes
│   │   ├── urls.py                   # Patient API routes
│   │   └── admin.py                  # Django admin configuration
│   │
│   ├── measurements/                 # Vitals/Measurements App
│   │   ├── models.py                 # Measurement model (IoT-ready)
│   │   ├── views.py                  # Measurement CRUD APIs
│   │   ├── serializers.py            # Measurement serializers
│   │   └── urls.py                   # Measurement API routes
│   │
│   ├── prescriptions/                # Prescription Management App
│   │   ├── models.py                 # Prescription, PrescriptionHistory
│   │   ├── serializers.py            # Prescription serializers
│   │   └── admin.py                  # Admin interface
│   │
│   ├── devices/                      # IoT Device Management App
│   │   ├── models.py                 # Device, MeasurementSession models
│   │   ├── views.py                  # Device command/measurement APIs
│   │   ├── urls.py                   # Device API routes
│   │   └── admin.py                  # Device admin interface
│   │
│   ├── reports/                      # Medical Report Analysis App
│   │   ├── models.py                 # Report model
│   │   ├── views.py                  # Report upload & analysis APIs
│   │   ├── services.py               # Azure AI integration
│   │   ├── storage.py                # Cloudinary custom storage
│   │   ├── serializers.py            # Report serializers
│   │   └── urls.py                   # Report API routes
│   │
│   ├── media/                        # Uploaded files (development)
│   │   └── reports/
│   │
│   ├── manage.py                     # Django CLI
│   ├── requirements.txt              # Python dependencies
│   ├── db.sqlite3                    # SQLite database (development)
│   ├── build.sh                      # Render.com build script
│   ├── start.sh                      # Render.com start script
│   └── Procfile                      # Heroku deployment config
│
├── frontend-main/                    # Main Frontend - Staff Portal (Port 4000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── RegistrationDashboard.js    # Patient registration UI
│   │   │   ├── HealthMonitoringStation.js  # Vitals entry UI
│   │   │   ├── ReportAnalysis.js           # Report upload & AI analysis
│   │   │   ├── Login.js                    # Staff authentication
│   │   │   └── RoleProtectedRoute.js       # RBAC route guard
│   │   ├── App.js                    # Main routing & navigation
│   │   ├── api.js                    # Axios API client
│   │   └── index.js                  # React entry point
│   ├── public/
│   │   └── index.html
│   ├── package.json                  # Dependencies & scripts
│   ├── vercel.json                   # Vercel deployment config
│   └── .env                          # API URL configuration
│
├── frontend-unified/                 # Doctor's Dashboard (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatientView.js        # Comprehensive patient view
│   │   │   ├── Login.js              # Doctor authentication
│   │   │   └── RoleProtectedRoute.js # RBAC route guard
│   │   ├── App.js                    # Patient navigation & switching
│   │   ├── api.js                    # Axios API client
│   │   └── index.js                  # React entry point
│   ├── public/
│   │   └── index.html
│   ├── package.json                  # Dependencies & scripts
│   ├── vercel.json                   # Vercel deployment config
│   └── .env                          # API URL configuration
│
├── frontend-patient/                 # Patient Web Portal (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Patient login
│   │   │   ├── Register.jsx          # Patient registration
│   │   │   ├── Dashboard.jsx         # Health overview
│   │   │   ├── Measurements.jsx      # Vitals history with charts
│   │   │   ├── Prescription.jsx      # Current & past prescriptions
│   │   │   ├── Visits.jsx            # Visit history
│   │   │   └── Profile.jsx           # Profile management
│   │   ├── components/               # Reusable UI components
│   │   ├── context/                  # Auth context
│   │   ├── routes/                   # Route configuration
│   │   └── api/                      # API client
│   ├── index.html
│   ├── package.json                  # Vite & dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── vercel.json                   # Vercel deployment
│   └── README.md                     # Patient portal documentation
│
├── frontend-patient-mobile/          # Patient Mobile App (Android)
│   ├── android/                      # Android native project
│   │   ├── app/
│   │   │   └── src/main/
│   │   │       ├── AndroidManifest.xml
│   │   │       ├── res/              # App resources
│   │   │       └── assets/           # Web assets
│   │   ├── build.gradle              # Android build config
│   │   ├── gradle.properties
│   │   └── gradlew                   # Gradle wrapper
│   │
│   ├── src/                          # React source (same as patient portal)
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── routes/
│   │   └── api/
│   │
│   ├── resources/                    # App icons & splash screens
│   │   ├── icon.png
│   │   └── splash.png
│   │
│   ├── capacitor.config.json         # Capacitor configuration
│   ├── package.json                  # Capacitor & dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── setup.ps1                     # Windows setup script
│   ├── setup.sh                      # Linux/Mac setup script
│   ├── ICON_SETUP_GUIDE.md           # Icon generation guide
│   └── README.md                     # Mobile app documentation
│
├── IoT-Integration/                  # IoT Device Code
│   └── iot_integration_with_api/
│       ├── iot_integration_with_api.ino  # ESP32 Arduino code
│       └── keys.h                    # WiFi & API credentials
│
├── API_DOCUMENTATION.md              # Complete API reference
├── ARCHITECTURE.md                   # System architecture details
├── DEPLOYMENT_GUIDE.md               # Production deployment guide
├── DEPLOYMENT_CHECKLIST.md           # Pre-deployment checklist
├── IOT_INTEGRATION.md                # IoT integration guide
├── ESP32_SETUP_GUIDE.md              # ESP32 device setup
├── RBAC.md                           # Role-based access control guide
├── QUICKSTART.md                     # 5-minute quick start
├── USER_GUIDE.md                     # End-user documentation
├── SUPERUSER_GUIDE.md                # Admin user guide
├── MOBILE_APP_SUMMARY.md             # Mobile app overview
├── Ashwini_Project_Report.md         # Complete project report
│
├── setup.ps1                         # Complete project setup (Windows)
├── start-servers.ps1                 # Start all servers (Windows)
├── render.yaml                       # Render.com deployment config
├── LICENSE                           # Project license
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Option 1: Automated Setup (Windows - Recommended)

```powershell
# Clone the repository
git clone https://github.com/yourusername/ashwini.git
cd ashwini

# Run automated setup script
.\setup.ps1

# Start all servers in separate windows
.\start-servers.ps1
```

### Option 2: Quick Start Guide

See [QUICKSTART.md](QUICKSTART.md) for a detailed 5-minute setup guide.

### Option 3: Manual Setup

Follow the detailed instructions in the [Setup Instructions](#setup-instructions) section below.

---

## 📝 Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- pip (Python package manager)
- npm (Node package manager)
- Android Studio (optional, for mobile development)

### Backend Setup

1. **Navigate to backend directory**:
   ```powershell
   cd backend
   ```

2. **Create a virtual environment** (recommended):
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate      # Windows
   # source venv/bin/activate   # Linux/Mac
   ```

3. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Run database migrations**:
   ```powershell
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser** (for Django admin):
   ```powershell
   python manage.py createsuperuser
   ```
   Follow the prompts to set username, email, and password.

6. **Start the Django server**:
   ```powershell
   python manage.py runserver 0.0.0.0:8000
   ```

   Backend will be available at: `http://localhost:8000`
   Admin interface at: `http://localhost:8000/admin`
   API root at: `http://localhost:8000/api/`

### Frontend Setup - Main Portal (Registration + Health Monitoring)

1. **Open a new terminal** and navigate to frontend-main:
   ```powershell
   cd frontend-main
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure environment** (.env file should contain):
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```powershell
   npm start
   ```

   Main Frontend will be available at: `http://localhost:4000`

### Frontend Setup - Unified Portal (Doctor's Dashboard)

1. **Open a new terminal** and navigate to frontend-unified:
   ```powershell
   cd frontend-unified
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure environment** (.env file should contain):
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```powershell
   npm start
   ```

   Unified Frontend will be available at: `http://localhost:3000`

### Frontend Setup - Patient Portal (Web)

1. **Open a new terminal** and navigate to frontend-patient:
   ```powershell
   cd frontend-patient
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure API** in `src/api/axios.js`:
   ```javascript
   const API_URL = 'http://localhost:8000';
   ```

4. **Start the development server**:
   ```powershell
   npm run dev
   ```

   Patient Portal will be available at: `http://localhost:5173` (or similar Vite port)

### Mobile App Setup (Android)

See [frontend-patient-mobile/README.md](frontend-patient-mobile/README.md) for detailed setup instructions.

Quick setup:
```powershell
cd frontend-patient-mobile
npm install
npx cap sync android
npm run android    # Opens Android Studio
```

### Verify Installation

With all servers running, you should have:
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin
- **Main Frontend**: http://localhost:4000
- **Unified Frontend**: http://localhost:3000
- **Patient Portal**: http://localhost:5173

---

## 👥 User Roles & RBAC

Project Ashwini implements comprehensive Role-Based Access Control (RBAC) with five distinct user roles:

### Role Overview

| Role | Portal Access | Permissions |
|------|--------------|-------------|
| **ADMIN** | All portals | Full system access, user management, all operations |
| **DOCTOR** | Unified Portal | Patient view, prescriptions, notes, complete consultations |
| **NURSE** | Main Portal | Health monitoring, vitals entry, patient status updates |
| **RECEPTION** | Main Portal | Patient registration, queue management |
| **PATIENT** | Patient Portal | Personal health data, prescriptions, visit history |

### Authentication

- **JWT-based**: Secure token authentication for all API calls
- **Login Endpoints**: Separate login APIs for staff and patients
- **Role Verification**: Automatic role checking on protected routes
- **Session Management**: Token refresh mechanism for extended sessions

### Example Users

After running `python manage.py createsuperuser`, you can create additional users via Django admin or registration APIs.

**Test Accounts** (create these in Django admin for testing):
- Doctor: `username: doctor1, password: <your-password>`, Role: DOCTOR
- Nurse: `username: nurse1, password: <your-password>`, Role: NURSE
- Reception: `username: reception1, password: <your-password>`, Role: RECEPTION

See [RBAC.md](RBAC.md) for complete RBAC implementation details.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Staff login (returns JWT token + role) |
| POST | `/api/auth/register/` | Staff registration |
| GET | `/api/auth/role/` | Get current user's role |
| POST | `/api/patient-portal/auth/login/` | Patient login |
| POST | `/api/patient-portal/auth/register/` | Patient registration |

### Patient Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/` | List all patients (supports `?status=` filter) |
| POST | `/api/patients/` | Create new patient (auto-generates ID) |
| GET | `/api/patients/<id>/` | Get patient details with latest measurement |
| PUT/PATCH | `/api/patients/<id>/` | Update patient (partial updates allowed) |
| DELETE | `/api/patients/<id>/` | Delete patient |
| GET | `/api/patients/<id>/history/` | Get patient visit history |

### Prescription Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/<id>/prescription/` | Get patient's current prescription |
| PUT/PATCH | `/api/patients/<id>/prescription/` | Update prescription medicines |
| GET | `/api/patients/<id>/prescription/history/` | Get prescription history |

**Prescription Format**:
```json
{
  "medicines": [
    {
      "name": "Paracetamol",
      "dose": "twice a day",
      "type": "Tablet",
      "quantity": "Full"
    }
  ]
}
```

### Measurement Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/<id>/measurements/` | Get all measurements (history) |
| GET | `/api/patients/<id>/measurements/latest/` | Get latest measurement |
| POST | `/api/patients/<id>/measurements/` | Create manual measurement |

**Measurement Format**:
```json
{
  "blood_pressure": "120/80",
  "temperature": 98.6,
  "spo2": 98.0,
  "heart_rate": 72.0,
  "height": 170,
  "weight": 70
}
```

### Medical Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/` | List all reports |
| POST | `/api/reports/` | Upload new report with OCR analysis |
| GET | `/api/reports/<id>/` | Get report details |
| GET | `/api/reports/patient/<patient_id>/` | Get all reports for a patient |

### IoT Device Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices/` | List all registered devices |
| GET | `/api/devices/<device_id>/command/` | Device polls for commands |
| POST | `/api/devices/<device_id>/measurements/` | Device submits measurements |

### Patient Portal APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient-portal/dashboard/` | Patient dashboard data |
| GET | `/api/patient-portal/measurements/` | Patient's measurement history |
| GET | `/api/patient-portal/prescriptions/` | Patient's prescriptions |
| GET | `/api/patient-portal/visits/` | Patient's visit history |
| PUT | `/api/patient-portal/profile/` | Update patient profile |

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference with request/response examples.

---

## 🔌 IoT Integration

Project Ashwini is designed with IoT integration in mind. The system includes:

### IoT Components

1. **Device Management**: Register and track IoT devices
2. **Measurement Sessions**: Workflow for device-initiated measurements
3. **Command Polling**: Devices poll for patient measurement instructions
4. **Data Submission**: Devices POST vitals data to the backend

### ESP32 Integration

Sample ESP32 code is provided in `IoT-Integration/iot_integration_with_api/`

**Setup Steps**:
1. Install Arduino IDE with ESP32 support
2. Configure WiFi credentials in `keys.h`
3. Set API URL in `keys.h`
4. Upload code to ESP32
5. Register device in Django admin

### Integration Points

**Backend**:
- `backend/devices/views.py` - Device API endpoints
- `backend/devices/models.py` - Device and MeasurementSession models

**Frontend**:
- `frontend-main/src/components/HealthMonitoringStation.js` - IoT device UI placeholders

See [IOT_INTEGRATION.md](IOT_INTEGRATION.md) and [ESP32_SETUP_GUIDE.md](ESP32_SETUP_GUIDE.md) for detailed integration instructions.

---

## 🚀 Deployment

### Production Deployment

The system is designed for easy cloud deployment:

#### Backend (Render.com)
```bash
# Connect GitHub repository to Render
# Use render.yaml for automatic configuration
# Set environment variables in Render dashboard
```

#### Frontend (Vercel)
```bash
# Frontend-main
cd frontend-main
vercel --prod

# Frontend-unified
cd frontend-unified
vercel --prod

# Frontend-patient
cd frontend-patient
vercel --prod
```

#### Mobile App (Google Play Store)

GitHub Actions workflow automatically builds APK on push to main branch.

```bash
# Manual build
cd frontend-patient-mobile
npm run build
npx cap sync android
# Open in Android Studio and build release APK
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) and [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for complete deployment instructions.

---

## 📚 Documentation

Comprehensive documentation is available:

| Document | Description |
|----------|-------------|
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Complete API reference |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment guide |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre-deployment checklist |
| [IOT_INTEGRATION.md](IOT_INTEGRATION.md) | IoT device integration |
| [ESP32_SETUP_GUIDE.md](ESP32_SETUP_GUIDE.md) | ESP32 hardware setup |
| [RBAC.md](RBAC.md) | Role-based access control |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute quick start |
| [USER_GUIDE.md](USER_GUIDE.md) | End-user documentation |
| [SUPERUSER_GUIDE.md](SUPERUSER_GUIDE.md) | Admin user guide |
| [MOBILE_APP_SUMMARY.md](MOBILE_APP_SUMMARY.md) | Mobile app overview |
| [Ashwini_Project_Report.md](Ashwini_Project_Report.md) | Complete project report |

---

## 📖 Usage Guide

### For Registration Staff

1. Access Main Frontend at http://localhost:4000
2. Login with RECEPTION or ADMIN role
3. Click "Registration Dashboard"
4. Fill patient details form and click "Register Patient"
5. View patient queue in real-time
6. Patient status starts as "waiting"

### For Health Monitoring Staff

1. Access Main Frontend at http://localhost:4000
2. Login with NURSE or ADMIN role
3. Click "Health Monitoring Station"
4. Select a patient from dropdown
5. Click "Start Health Check" if patient is waiting
6. Enter vitals manually in the form
7. Click "Save Measurement"
8. Patient status updates to "examined"

### For Doctors

1. Access Unified Frontend at http://localhost:3000
2. Login with DOCTOR or ADMIN role
3. Use "Previous Patient" / "Next Patient" buttons to navigate
4. Review patient information and latest vitals
5. Add medicines to prescription
6. Add clinical notes in "Doctor's Notes" section
7. Set next visit date if needed
8. Click "Mark as Completed" when finished

### For Patients

**Web Portal**:
1. Access Patient Portal at http://localhost:5173
2. Register or login with patient credentials
3. View dashboard with health overview
4. Navigate to Measurements, Prescriptions, or Visits
5. Update profile information

**Mobile App**:
1. Install Android APK on device
2. Login with patient credentials
3. Access health data on-the-go
4. View charts and historical data

See [USER_GUIDE.md](USER_GUIDE.md) for detailed usage instructions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Django and Django REST Framework communities
- React and Vite communities
- Capacitor for mobile app capabilities
- Azure AI for OCR services
- All contributors and testers

---

## 📞 Support

For questions, issues, or support:
- Open an issue on GitHub
- Check documentation in the `/docs` folder
- Review existing issues and discussions

---

**Project Ashwini** - Empowering Healthcare with Technology 🏥💙
