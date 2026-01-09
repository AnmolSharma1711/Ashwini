# Project Ashwini

**An IoT-Ready Automated Health Tracking System for Clinics and Hospitals**

Project Ashwini is a full-stack web application designed to efficiently manage patient flow and health monitoring in clinical settings. The system currently supports manual data entry while being fully architected for future IoT device integration.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [IoT Integration Points](#iot-integration-points)
- [Usage Guide](#usage-guide)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

Project Ashwini streamlines patient management through three main roles:

1. **Reception/Registration Staff**: Register patients and manage the waiting queue
2. **Collector/Nurse (Health Monitoring Station)**: Record patient vitals (manual or device-based)
3. **Doctor**: Review patient details, vitals, prescriptions, and provide care

The system is built with clear separation of concerns and well-documented integration points for IoT devices.

---

## ✨ Features

### Current Features
- **Patient Registration**: Complete demographic capture with visit tracking
- **Patient Queue Management**: Real-time status tracking (waiting → checking → examined → completed)
- **Manual Vitals Entry**: Record blood pressure, temperature, SpO₂, heart rate
- **Prescription Management**: Add/edit medicines with dose, type, and quantity
- **Doctor's Notes**: Clinical observations and next visit scheduling
- **Patient Navigation**: Easy previous/next patient browsing for doctors
- **Real-time Updates**: Automatic data synchronization across views

### IoT-Ready Architecture
- **Device Management Models**: Ready for IoT device registration and tracking
- **Measurement Session Tracking**: Framework for device-initiated measurements
- **Stub API Endpoints**: Pre-built endpoints for device communication
- **Clear Integration Points**: Well-documented locations for IoT implementation

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: SQLite (development), easily switchable to PostgreSQL (production)
- **API**: RESTful JSON APIs with CORS support

### Frontend
- **Framework**: React 18+ with Hooks
- **UI Library**: Bootstrap 5
- **HTTP Client**: Axios
- **Routing**: Component-based navigation

### Development
- **Python**: 3.8+
- **Node.js**: 16+
- **Package Manager**: npm

---

## 📁 Project Structure

```
Ashwini/
├── backend/                          # Django Backend
│   ├── ashwini_backend/              # Main project settings
│   │   ├── settings.py               # Django configuration
│   │   ├── urls.py                   # URL routing
│   │   └── ...
│   ├── patients/                     # Patient management app
│   │   ├── models.py                 # Patient model
│   │   ├── views.py                  # Patient API views
│   │   ├── serializers.py            # Patient serializers
│   │   └── admin.py                  # Admin interface
│   ├── prescriptions/                # Prescription management app
│   │   ├── models.py                 # Prescription model (JSON medicines)
│   │   └── ...
│   ├── measurements/                 # Vitals/measurements app
│   │   ├── models.py                 # Measurement model (IoT-ready)
│   │   ├── views.py                  # Measurement APIs
│   │   └── ...
│   ├── devices/                      # IoT device management app
│   │   ├── models.py                 # Device & MeasurementSession models
│   │   ├── views.py                  # IoT placeholder endpoints
│   │   └── ...
│   ├── manage.py                     # Django management script
│   ├── requirements.txt              # Python dependencies
│   └── .env.template                 # Environment variable template
│
├── frontend-main/                    # Main Frontend (Port 4000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── RegistrationDashboard.js    # Patient registration UI
│   │   │   └── HealthMonitoringStation.js  # Vitals entry UI
│   │   ├── App.js                    # Main app component
│   │   ├── api.js                    # API client
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env                          # API URL configuration
│
└── frontend-unified/                 # Doctor's Dashboard (Port 3000)
    ├── src/
    │   ├── components/
    │   │   └── PatientView.js        # Comprehensive patient view
    │   ├── App.js                    # Navigation & patient switching
    │   ├── api.js                    # API client
    │   └── index.js
    ├── public/
    ├── package.json
    └── .env                          # API URL configuration
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- pip (Python package manager)
- npm (Node package manager)

### Backend Setup

1. **Navigate to backend directory**:
   ```powershell
   cd d:\Ashwini\backend
   ```

2. **Create a virtual environment** (recommended):
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate
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
   Follow the prompts to set username and password.

6. **Start the Django server**:
   ```powershell
   python manage.py runserver 0.0.0.0:8000
   ```

   Backend will be available at: `http://localhost:8000`
   Admin interface at: `http://localhost:8000/admin`

### Frontend Setup - Main (Registration + Health Monitoring)

1. **Navigate to frontend-main directory**:
   ```powershell
   cd d:\Ashwini\frontend-main
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Verify .env file** (should contain):
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```powershell
   npm start
   ```

   Main Frontend will be available at: `http://localhost:4000`

### Frontend Setup - Unified (Doctor's Dashboard)

1. **Open a new terminal** and navigate to frontend-unified directory:
   ```powershell
   cd d:\Ashwini\frontend-unified
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Verify .env file** (should contain):
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```powershell
   npm start
   ```

   Unified Frontend will be available at: `http://localhost:3000`

### Verify Installation

With all three servers running:
- Backend API: http://localhost:8000/api/patients/
- Main Frontend: http://localhost:4000
- Doctor's Dashboard: http://localhost:3000
- Django Admin: http://localhost:8000/admin

---

## 📡 API Endpoints

### Patient Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/` | List all patients (supports `?status=` filter) |
| POST | `/api/patients/` | Create new patient (auto-creates prescription) |
| GET | `/api/patients/<id>/` | Get patient details with latest measurement |
| PUT | `/api/patients/<id>/` | Update patient (partial updates allowed) |
| DELETE | `/api/patients/<id>/` | Delete patient |

### Prescription Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/<id>/prescription/` | Get patient's prescription |
| PUT | `/api/patients/<id>/prescription/` | Update prescription medicines |

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
| GET | `/api/patients/<id>/measurements/latest/` | Get latest measurement |
| GET | `/api/patients/<id>/measurements/` | Get all measurements (history) |
| POST | `/api/patients/<id>/measurements/` | Create manual measurement |

**Measurement Format**:
```json
{
  "blood_pressure": "120/80",
  "temperature": 98.6,
  "spo2": 98.0,
  "heart_rate": 72.0
}
```

### IoT Device Endpoints (Stub/Placeholder)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices/<device_id>/command/` | Device polls for commands |
| POST | `/api/devices/<device_id>/measurements/` | Device submits measurements |

---

## 🔌 IoT Integration Points

The system is designed with clear integration points for IoT devices. Here's where to add IoT functionality:

### 1. Backend: Device Command Polling
**File**: `backend/devices/views.py`
**Function**: `device_command()`

Currently returns `{"command": "idle"}`. 

**To implement**:
- Check for pending `MeasurementSession` for the device
- Return patient_id and session_id if measurement needed
- Update device `last_seen` timestamp

### 2. Backend: Device Measurement Submission
**File**: `backend/devices/views.py`
**Function**: `device_measurements_create()`

Currently accepts measurements with `source="device"`.

**To implement**:
- Add device authentication (token-based)
- Update associated `MeasurementSession` status
- Trigger real-time notifications to UI
- Validate measurement ranges

### 3. Frontend: Device Measurement UI
**File**: `frontend-main/src/components/HealthMonitoringStation.js`

Look for the "IoT Device Integration (Future)" card.

**To implement**:
- Add "Start Device Measurement" button functionality
- Create MeasurementSession via API
- Poll for session completion
- Display real-time measurement updates
- Show device status and connectivity

### 4. Models Ready for IoT
- `Device`: Tracks physical IoT devices
- `MeasurementSession`: Links device, patient, and measurement workflow
- `Measurement.source`: Distinguishes manual vs device measurements

### 5. Authentication
Currently APIs are open. For production:
- Add token authentication for devices
- Implement role-based permissions (doctor, nurse, admin)
- See comments in `backend/ashwini_backend/settings.py`

---

## 📖 Usage Guide

### For Registration Staff

1. Access Main Frontend at http://localhost:4000
2. Click "Registration Dashboard"
3. Fill patient details form and click "Register Patient"
4. View patient queue in the table on the right
5. Patient status starts as "waiting"

### For Health Monitoring Staff

1. Access Main Frontend at http://localhost:4000
2. Click "Health Monitoring Station"
3. Select a patient from dropdown (or auto-selected)
4. Click "Start Health Check" if patient is waiting
5. Enter vitals manually in the form
6. Click "Save Measurement"
7. Patient status updates to "examined"

### For Doctors

1. Access Unified Frontend at http://localhost:3000
2. Use "Previous Patient" / "Next Patient" buttons to navigate
3. Review patient information and latest vitals
4. Add medicines to prescription:
   - Enter name, dose, type, quantity
   - Click "+ Add Medicine"
   - Repeat for all medicines
   - Click "Save All Changes to Prescription"
5. Add clinical notes in "Doctor's Notes" section
6. Set next visit date if needed
7. Click "Save Notes & Next Visit"
8. When done, click "Mark as Completed"

---

## 🔮 Future Enhancements

### Short Term
- [ ] User authentication and role-based access control
- [ ] Real-time notifications using WebSockets
- [ ] Appointment scheduling system
- [ ] Print prescription functionality
- [ ] Export patient reports (PDF)

### Medium Term
- [ ] IoT device integration (BP monitor, thermometer, pulse oximeter)
- [ ] Automated measurement capture workflow
- [ ] Device health monitoring dashboard
- [ ] Multi-language support
- [ ] Mobile responsive enhancements

### Long Term
- [ ] AI-based anomaly detection in vitals
- [ ] Integration with laboratory systems
- [ ] Telemedicine capabilities
- [ ] Analytics dashboard for hospital management
- [ ] Integration with pharmacy systems
- [ ] Patient mobile app for appointments and reports

---

## 🗃️ Database Schema

### Key Models

**Patient**
- Demographics: name, age, gender, phone, address
- Visit: reason, visit_time, status
- Doctor: notes, next_visit_date

**Prescription** (One-to-One with Patient)
- medicines: JSONField with array of medicine objects

**Measurement** (Many-to-One with Patient)
- Vitals: blood_pressure, temperature, spo2, heart_rate
- Metadata: timestamp, source (manual/device)

**Device** (IoT)
- device_id, name, is_active, last_seen

**MeasurementSession** (IoT Workflow)
- patient, device, status, timestamps

---

## 🔒 Security Considerations

### Current Implementation
- CORS enabled for localhost:3000 and localhost:4000
- Django CSRF protection enabled
- Basic input validation in serializers

### For Production
- [ ] Enable HTTPS
- [ ] Configure SECRET_KEY from environment
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS properly
- [ ] Implement authentication (JWT tokens recommended)
- [ ] Add rate limiting
- [ ] Enable logging and monitoring
- [ ] Sanitize all user inputs
- [ ] Implement device authentication for IoT endpoints

---

## 📝 License

This project is part of a demonstration/educational initiative. Please add appropriate license information before production use.

---

## 🤝 Contributing

This is a reference implementation. To contribute:

1. Follow the existing code structure
2. Document all IoT integration points clearly
3. Test all API endpoints
4. Ensure UI is responsive and user-friendly
5. Update this README with any architectural changes

---

## 📞 Support

For issues or questions:
- Review the API documentation above
- Check Django admin at http://localhost:8000/admin for data inspection
- Examine browser console for frontend errors
- Check Django console for backend errors

---

## 🎓 Learning Resources

- **Django REST Framework**: https://www.django-rest-framework.org/
- **React Documentation**: https://react.dev/
- **Bootstrap**: https://getbootstrap.com/
- **IoT with Python**: For future device integration planning

---

**Built with ❤️ for better healthcare management**
