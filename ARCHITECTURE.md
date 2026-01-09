# Project Ashwini - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Project Ashwini System                          │
│                  IoT-Ready Health Tracking Platform                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│  Main Frontend       │         │  Unified Frontend    │
│  (Port 4000)         │         │  (Port 3000)         │
│                      │         │                      │
│  ┌────────────────┐  │         │  ┌────────────────┐  │
│  │ Registration   │  │         │  │ Doctor's       │  │
│  │ Dashboard      │  │         │  │ Dashboard      │  │
│  └────────────────┘  │         │  └────────────────┘  │
│                      │         │                      │
│  ┌────────────────┐  │         │  ┌────────────────┐  │
│  │ Health         │  │         │  │ Patient View   │  │
│  │ Monitoring     │  │         │  │ & Prescriptions│  │
│  │ Station        │  │         │  └────────────────┘  │
│  └────────────────┘  │         │                      │
└──────────────────────┘         └──────────────────────┘
           │                                  │
           │         HTTP REST API            │
           └──────────────┬───────────────────┘
                          │
                          ▼
           ┌──────────────────────────┐
           │   Django Backend         │
           │   (Port 8000)            │
           │                          │
           │  ┌────────────────────┐  │
           │  │  REST API Layer    │  │
           │  │  (Django REST      │  │
           │  │   Framework)       │  │
           │  └────────────────────┘  │
           │           │               │
           │           ▼               │
           │  ┌────────────────────┐  │
           │  │  Business Logic    │  │
           │  │  - Patients        │  │
           │  │  - Prescriptions   │  │
           │  │  - Measurements    │  │
           │  │  - Devices (IoT)   │  │
           │  └────────────────────┘  │
           │           │               │
           │           ▼               │
           │  ┌────────────────────┐  │
           │  │  Database Layer    │  │
           │  │  (SQLite/PostgreSQL)│ │
           │  └────────────────────┘  │
           └──────────────────────────┘
                          │
                          │ (Future IoT Integration)
                          ▼
           ┌──────────────────────────┐
           │   IoT Devices            │
           │   (Not yet connected)    │
           │                          │
           │  ┌────────────────────┐  │
           │  │ Blood Pressure     │  │
           │  │ Monitor            │  │
           │  └────────────────────┘  │
           │  ┌────────────────────┐  │
           │  │ Thermometer        │  │
           │  └────────────────────┘  │
           │  ┌────────────────────┐  │
           │  │ Pulse Oximeter     │  │
           │  │ (SpO2 + HR)        │  │
           │  └────────────────────┘  │
           └──────────────────────────┘
```

---

## Data Flow Diagram

### Patient Registration Flow

```
Reception Staff
      │
      │ 1. Fill registration form
      ▼
Main Frontend (Registration Dashboard)
      │
      │ 2. POST /api/patients/
      ▼
Django Backend
      │
      │ 3. Create Patient record
      │ 4. Create empty Prescription
      ▼
Database (SQLite)
      │
      │ 5. Return patient data
      ▼
Main Frontend
      │
      │ 6. Display in patient queue
      ▼
Reception Staff
```

### Manual Vitals Recording Flow

```
Health Monitoring Staff
      │
      │ 1. Select patient
      │ 2. Enter vitals manually
      ▼
Main Frontend (Health Monitoring Station)
      │
      │ 3. POST /api/patients/<id>/measurements/
      ▼
Django Backend
      │
      │ 4. Create Measurement (source="manual")
      │ 5. Update patient status to "examined"
      ▼
Database (SQLite)
      │
      │ 6. Return measurement data
      ▼
Main Frontend
      │
      │ 7. Display latest vitals
      ▼
Health Monitoring Staff
```

### Doctor Consultation Flow

```
Doctor
      │
      │ 1. Navigate to patient
      ▼
Unified Frontend (Doctor's Dashboard)
      │
      │ 2. GET /api/patients/<id>/
      ▼
Django Backend
      │
      │ 3. Fetch patient with latest measurement
      ▼
Database (SQLite)
      │
      │ 4. Return full patient details
      ▼
Unified Frontend
      │
      │ 5. Display patient info, vitals, prescription
      ▼
Doctor
      │
      │ 6. Add medicines, notes, next visit
      │
      │ 7a. PUT /api/patients/<id>/prescription/
      │ 7b. PUT /api/patients/<id>/
      ▼
Django Backend
      │
      │ 8. Update prescription & patient records
      ▼
Database (SQLite)
```

### Future IoT Device Flow

```
IoT Device (Kiosk)
      │
      │ 1. Poll for commands
      │    GET /api/devices/<device_id>/command/
      ▼
Django Backend
      │
      │ 2. Check for pending MeasurementSession
      │ 3. Return {"command": "measure", "patient_id": X}
      ▼
IoT Device
      │
      │ 4. Capture vitals from sensors
      │    - Blood pressure monitor
      │    - Thermometer
      │    - Pulse oximeter
      │
      │ 5. POST /api/devices/<device_id>/measurements/
      ▼
Django Backend
      │
      │ 6. Create Measurement (source="device")
      │ 7. Update MeasurementSession to "completed"
      │ 8. Update patient status
      ▼
Database (SQLite)
      │
      │ 9. Notify frontend via WebSocket (future)
      ▼
Health Monitoring Station UI
      │
      │ 10. Display real-time vitals
      ▼
Health Monitoring Staff
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────┐
│ Patient                                                 │
├─────────────────────────────────────────────────────────┤
│ PK │ id (AutoField)                                     │
│    │ name (CharField)                                   │
│    │ age (IntegerField)                                 │
│    │ gender (CharField) [Male/Female/Other]             │
│    │ phone (CharField, optional)                        │
│    │ address (TextField, optional)                      │
│    │ reason (TextField, optional)                       │
│    │ visit_time (DateTimeField, auto)                   │
│    │ status (CharField) [waiting/checking/examined/     │
│    │                     completed]                     │
│    │ notes (TextField, optional)                        │
│    │ next_visit_date (DateField, optional)              │
└─────────────────────────────────────────────────────────┘
                           │
                           │ 1:1
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Prescription                                            │
├─────────────────────────────────────────────────────────┤
│ PK │ patient (OneToOneField → Patient)                  │
│    │ medicines (JSONField)                              │
│    │   [                                                │
│    │     {name, dose, type, quantity},                  │
│    │     ...                                            │
│    │   ]                                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Patient                                                 │
└─────────────────────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Measurement                                             │
├─────────────────────────────────────────────────────────┤
│ PK │ id (AutoField)                                     │
│ FK │ patient (ForeignKey → Patient)                     │
│    │ timestamp (DateTimeField, auto)                    │
│    │ blood_pressure (CharField, optional)               │
│    │ temperature (FloatField, optional)                 │
│    │ spo2 (FloatField, optional)                        │
│    │ heart_rate (FloatField, optional)                  │
│    │ source (CharField) [manual/device]                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Device (IoT)                                            │
├─────────────────────────────────────────────────────────┤
│ PK │ id (AutoField)                                     │
│    │ device_id (CharField, unique)                      │
│    │ name (CharField)                                   │
│    │ is_active (BooleanField)                           │
│    │ last_seen (DateTimeField, optional)                │
└─────────────────────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────┐
│ MeasurementSession (IoT Workflow)                       │
├─────────────────────────────────────────────────────────┤
│ PK │ id (AutoField)                                     │
│ FK │ patient (ForeignKey → Patient)                     │
│ FK │ device (ForeignKey → Device)                       │
│    │ status (CharField) [pending/in_progress/           │
│    │                     completed/failed]              │
│    │ created_at (DateTimeField, auto)                   │
│    │ updated_at (DateTimeField, auto)                   │
└─────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Backend Components

```
backend/
│
├── ashwini_backend/           # Project configuration
│   ├── settings.py            # Django settings, CORS, DB config
│   ├── urls.py                # Main URL routing
│   └── wsgi.py / asgi.py      # WSGI/ASGI application
│
├── patients/                  # Patient management
│   ├── models.py              # Patient model
│   ├── serializers.py         # Patient serializers (DRF)
│   ├── views.py               # Patient ViewSet
│   ├── urls.py                # Patient API routes
│   └── admin.py               # Django admin config
│
├── prescriptions/             # Prescription management
│   ├── models.py              # Prescription model (1:1 with Patient)
│   ├── serializers.py         # Prescription serializers
│   └── admin.py               # Admin config
│
├── measurements/              # Vitals/measurements
│   ├── models.py              # Measurement model (N:1 with Patient)
│   ├── serializers.py         # Measurement serializers
│   ├── views.py               # Measurement API views
│   ├── urls.py                # Measurement routes
│   └── admin.py               # Admin config
│
└── devices/                   # IoT device management
    ├── models.py              # Device & MeasurementSession models
    ├── views.py               # IoT placeholder endpoints
    ├── urls.py                # Device routes
    └── admin.py               # Admin config
```

### Frontend Components

```
frontend-main/                 # Main Frontend (Port 4000)
│
├── src/
│   ├── components/
│   │   ├── RegistrationDashboard.js    # Patient registration UI
│   │   └── HealthMonitoringStation.js  # Vitals entry UI
│   │
│   ├── api.js                 # Axios API client
│   ├── App.js                 # Main app with tab navigation
│   └── index.js               # Entry point
│
└── .env                       # REACT_APP_API_URL config

frontend-unified/              # Unified Frontend (Port 3000)
│
├── src/
│   ├── components/
│   │   └── PatientView.js     # Comprehensive patient view
│   │
│   ├── api.js                 # Axios API client
│   ├── App.js                 # Navigation & patient switching
│   └── index.js               # Entry point
│
└── .env                       # REACT_APP_API_URL config
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend Framework** | Django 4.2+ | Web framework, ORM, admin |
| **API Framework** | Django REST Framework | RESTful API creation |
| **Database (Dev)** | SQLite | Lightweight development database |
| **Database (Prod)** | PostgreSQL (ready) | Production database |
| **CORS** | django-cors-headers | Cross-origin requests |
| **Frontend Framework** | React 18+ | UI components, state management |
| **UI Library** | Bootstrap 5 | Responsive design, components |
| **HTTP Client** | Axios | API communication |
| **Package Manager** | npm | Frontend dependencies |
| **Python Version** | 3.8+ | Backend runtime |
| **Node.js Version** | 16+ | Frontend build tools |

---

## Security Architecture

### Current Security (Development)

```
Frontend (React)
      │
      │ HTTP (localhost)
      │ CORS: Allowed
      ▼
Backend (Django)
      │
      │ CSRF: Enabled for web
      │ Auth: Open
      ▼
Database (SQLite)
      │
      │ File-based
      │ Local access only
```

### Recommended Production Security

```
Frontend (React)
      │
      │ HTTPS (TLS 1.3)
      │ CORS: Restricted domains
      ▼
Backend (Django)
      │
      │ Token Authentication (DRF)
      │ Role-based Permissions
      │ Rate Limiting
      │ Input Validation
      │ CSRF Protection
      ▼
Database (PostgreSQL)
      │
      │ Encrypted connections
      │ User privileges
      │ Backup strategy
```

### IoT Device Security (Future)

```
IoT Device
      │
      │ TLS/SSL
      │ Token Authentication
      │ Device certificates
      ▼
Backend API
      │
      │ Verify device identity
      │ Rate limit per device
      │ Audit logging
```

---

## Deployment Architecture (Future)

### Development

```
Single Machine
├── Backend (localhost:8000)
├── Frontend Main (localhost:4000)
└── Frontend Unified (localhost:3000)
```

### Production

```
┌─────────────────────────────────────────┐
│ Load Balancer                           │
└─────────────────────────────────────────┘
            │
            ├───────────┬───────────┐
            ▼           ▼           ▼
    ┌───────────┐ ┌───────────┐ ┌───────────┐
    │ Backend   │ │ Backend   │ │ Backend   │
    │ Server 1  │ │ Server 2  │ │ Server 3  │
    └───────────┘ └───────────┘ └───────────┘
            │           │           │
            └───────────┴───────────┘
                      │
                      ▼
            ┌─────────────────┐
            │ PostgreSQL DB   │
            │ (Primary)       │
            └─────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │ PostgreSQL DB   │
            │ (Replica)       │
            └─────────────────┘

┌─────────────────────────────────────────┐
│ CDN / Static File Hosting               │
│ - Frontend bundles                      │
│ - Static assets                         │
└─────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Limitations
- Single server deployment
- SQLite (not suitable for concurrent writes)
- No caching layer
- No background task queue

### Future Enhancements
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for sessions, API responses
- **Task Queue**: Celery for async operations
- **WebSockets**: Real-time device updates
- **Message Broker**: RabbitMQ or Redis
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

## Integration Points

### External Systems (Future)

```
Project Ashwini Backend
        │
        ├─── Laboratory System (HL7/FHIR)
        │
        ├─── Pharmacy System (ePrescription)
        │
        ├─── Insurance Portal (Claims)
        │
        ├─── Telemedicine Platform (Video calls)
        │
        └─── Mobile App (Patient portal)
```

---

**Architecture Version**: 1.0  
**Last Updated**: January 7, 2026
