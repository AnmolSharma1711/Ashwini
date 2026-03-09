# Project Ashwini - API Documentation

Complete API reference for Project Ashwini health tracking system.

**Base URL**: `http://localhost:8000/api`

---

## Authentication

Currently, the API is open for development. For production, implement token-based authentication.

**Future Authentication Header**:
```
Authorization: Token <your-token>
```

---

## Patient Management

### List All Patients

**Endpoint**: `GET /api/patients/`

**Description**: Retrieve a list of all patients.

**Query Parameters**:
- `status` (optional): Filter by patient status (`waiting`, `checking`, `examined`, `completed`)

**Example Request**:
```bash
GET /api/patients/
GET /api/patients/?status=waiting
```

**Example Response**:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "age": 35,
    "gender": "Male",
    "phone": "1234567890",
    "status": "waiting",
    "visit_time": "2026-01-07T10:30:00Z",
    "reason": "Fever and cough"
  }
]
```

---

### Create New Patient

**Endpoint**: `POST /api/patients/`

**Description**: Register a new patient. Automatically creates an empty prescription record.

**Request Body**:
```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "phone": "1234567890",
  "address": "123 Main St, City",
  "reason": "Fever and cough"
}
```

**Required Fields**: `name`, `age`, `gender`

**Optional Fields**: `phone`, `address`, `reason`

**Example Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "phone": "1234567890",
  "address": "123 Main St, City",
  "reason": "Fever and cough",
  "visit_time": "2026-01-07T10:30:00Z",
  "status": "waiting",
  "notes": null,
  "next_visit_date": null,
  "latest_measurement": null,
  "prescription": {
    "medicines": []
  }
}
```

---

### Get Patient Details

**Endpoint**: `GET /api/patients/<id>/`

**Description**: Retrieve detailed information about a specific patient, including latest measurement and prescription.

**Example Request**:
```bash
GET /api/patients/1/
```

**Example Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "phone": "1234567890",
  "address": "123 Main St, City",
  "reason": "Fever and cough",
  "visit_time": "2026-01-07T10:30:00Z",
  "status": "examined",
  "notes": "Patient has mild fever. Prescribed Paracetamol.",
  "next_visit_date": "2026-01-10",
  "latest_measurement": {
    "id": 1,
    "timestamp": "2026-01-07T11:00:00Z",
    "blood_pressure": "120/80",
    "temperature": 98.6,
    "spo2": 98.0,
    "heart_rate": 72.0,
    "source": "manual"
  },
  "prescription": {
    "medicines": [
      {
        "name": "Paracetamol",
        "dose": "three times a day",
        "type": "Tablet",
        "quantity": "Full"
      }
    ]
  }
}
```

---

### Update Patient

**Endpoint**: `PUT /api/patients/<id>/`

**Description**: Update patient information. Supports partial updates (only send fields you want to change).

**Request Body** (any subset of these fields):
```json
{
  "name": "John Doe",
  "age": 36,
  "gender": "Male",
  "phone": "9876543210",
  "address": "456 Oak Ave",
  "reason": "Follow-up visit",
  "status": "completed",
  "notes": "Patient recovered well. No further treatment needed.",
  "next_visit_date": "2026-02-07"
}
```

**Common Use Cases**:
- Update status: `{"status": "checking"}`
- Save doctor's notes: `{"notes": "...", "next_visit_date": "2026-01-10"}`
- Complete consultation: `{"status": "completed"}`

**Example Response**: Returns full patient details (same as GET).

---

### Delete Patient

**Endpoint**: `DELETE /api/patients/<id>/`

**Description**: Delete a patient and all associated data (prescriptions, measurements).

**Example Request**:
```bash
DELETE /api/patients/1/
```

**Response**: `204 No Content`

---

## Prescription Management

### Get Patient Prescription

**Endpoint**: `GET /api/patients/<id>/prescription/`

**Description**: Retrieve the prescription for a specific patient.

**Example Request**:
```bash
GET /api/patients/1/prescription/
```

**Example Response**:
```json
{
  "medicines": [
    {
      "name": "Paracetamol",
      "dose": "three times a day",
      "type": "Tablet",
      "quantity": "Full"
    },
    {
      "name": "Amoxicillin",
      "dose": "twice a day",
      "type": "Capsule",
      "quantity": "Full"
    }
  ]
}
```

---

### Update Patient Prescription

**Endpoint**: `PUT /api/patients/<id>/prescription/`

**Description**: Update the prescription medicines list. Replaces the entire medicines array.

**Request Body**:
```json
{
  "medicines": [
    {
      "name": "Paracetamol",
      "dose": "three times a day",
      "type": "Tablet",
      "quantity": "Full"
    },
    {
      "name": "Vitamin C",
      "dose": "once a day",
      "type": "Tablet",
      "quantity": "Full"
    }
  ]
}
```

**Medicine Object Fields**:
- `name` (string): Medicine name
- `dose` (string): Dosage instructions (e.g., "once a day", "twice a day")
- `type` (string): Type of medicine (e.g., "Tablet", "Capsule", "Serum", "Syrup")
- `quantity` (string): Quantity (e.g., "Full", "Half", "5ml", "10ml")

**Example Response**:
```json
{
  "medicines": [
    {
      "name": "Paracetamol",
      "dose": "three times a day",
      "type": "Tablet",
      "quantity": "Full"
    },
    {
      "name": "Vitamin C",
      "dose": "once a day",
      "type": "Tablet",
      "quantity": "Full"
    }
  ]
}
```

---

## Measurement Management

### Get Latest Measurement

**Endpoint**: `GET /api/patients/<id>/measurements/latest/`

**Description**: Retrieve the most recent measurement for a patient.

**Example Request**:
```bash
GET /api/patients/1/measurements/latest/
```

**Example Response**:
```json
{
  "id": 1,
  "timestamp": "2026-01-07T11:00:00Z",
  "blood_pressure": "120/80",
  "temperature": 37.0,
  "spo2": 98.0,
  "heart_rate": 72.0,
  "source": "manual"
}
```

**Note**: Returns `null` if no measurements exist.

---

### Get All Measurements

**Endpoint**: `GET /api/patients/<id>/measurements/`

**Description**: Retrieve all measurements for a patient, ordered by timestamp (newest first).

**Example Request**:
```bash
GET /api/patients/1/measurements/
```

**Example Response**:
```json
[
  {
    "id": 2,
    "timestamp": "2026-01-07T15:30:00Z",
    "blood_pressure": "118/78",
    "temperature": 98.2,
    "spo2": 99.0,
    "heart_rate": 68.0,
    "source": "manual"
  },
  {
    "id": 1,
    "timestamp": "2026-01-07T11:00:00Z",
    "blood_pressure": "120/80",
    "temperature": 98.6,
    "spo2": 98.0,
    "heart_rate": 72.0,
    "source": "manual"
  }
]
```

---

### Create Measurement (Manual Entry)

**Endpoint**: `POST /api/patients/<id>/measurements/`

**Description**: Record a new measurement for a patient. Used by Health Monitoring Station for manual entry.

**Request Body** (all fields optional - record what you have):
```json
{
  "blood_pressure": "120/80",
  "temperature": 98.6,
  "spo2": 98.0,
  "heart_rate": 72.0
}
```

**Field Descriptions**:
- `blood_pressure` (string, optional): Format "systolic/diastolic" (e.g., "120/80")
- `temperature` (float, optional): Temperature in Celsius
- `spo2` (float, optional): Blood oxygen saturation percentage
- `heart_rate` (float, optional): Heart rate in beats per minute

**Note**: The `source` field is automatically set to `"manual"`.

**Example Response**:
```json
{
  "id": 1,
  "patient": 1,
  "timestamp": "2026-01-07T11:00:00Z",
  "blood_pressure": "120/80",
  "temperature": 98.6,
  "spo2": 98.0,
  "heart_rate": 72.0,
  "source": "manual"
}
```

---

## IoT Device Endpoints

These endpoints are designed for future IoT device integration. They are currently implemented as stubs with clear documentation for future enhancement.

### Device Command Polling

**Endpoint**: `GET /api/devices/<device_id>/command/`

**Description**: IoT devices poll this endpoint to receive commands and instructions.

**Current Implementation**: Always returns `{"command": "idle"}`.

**Future Implementation**: 
- Check for pending MeasurementSession for this device
- Return measurement instructions if session exists
- Update device's `last_seen` timestamp

**Example Request**:
```bash
GET /api/devices/KIOSK-001/command/
```

**Current Response**:
```json
{
  "command": "idle"
}
```

**Future Response** (when measurement pending):
```json
{
  "command": "measure",
  "patient_id": 1,
  "session_id": 5,
  "patient_name": "John Doe"
}
```

**Authentication**: In production, require Token authentication.

---

### Device Measurement Submission

**Endpoint**: `POST /api/devices/<device_id>/measurements/`

**Description**: IoT devices submit captured measurements to this endpoint.

**Request Body**:
```json
{
  "patient_id": 1,
  "blood_pressure": "120/80",
  "temperature": 37.0,
  "spo2": 98.0,
  "heart_rate": 72.0
}
```

**Required Fields**: `patient_id`

**Optional Fields**: `blood_pressure`, `temperature`, `spo2`, `heart_rate` (at least one vital should be provided)

**Note**: The `source` field is automatically set to `"device"`.

**Example Response**:
```json
{
  "id": 2,
  "patient": 1,
  "timestamp": "2026-01-07T12:00:00Z",
  "blood_pressure": "120/80",
  "temperature": 37.0,
  "spo2": 98.0,
  "heart_rate": 72.0,
  "source": "device"
}
```

**Future Enhancements**:
- Verify device authentication
- Update MeasurementSession status
- Trigger UI notifications

**Authentication**: In production, require Token authentication.

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (for POST requests) |
| 204 | No Content (for DELETE requests) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Error Response Format

When an error occurs, the API returns a JSON response with error details:

```json
{
  "detail": "Error message here",
  "field_name": ["Field-specific error messages"]
}
```

**Example Validation Error**:
```json
{
  "name": ["This field is required."],
  "age": ["Ensure this value is greater than or equal to 0."]
}
```

---

## Patient Status Flow

The typical patient status progression:

```
waiting → checking → examined → completed
```

**Status Descriptions**:
- `waiting`: Patient registered, waiting in queue
- `checking`: Currently at Health Monitoring Station
- `examined`: Vitals recorded, ready for doctor
- `completed`: Doctor consultation finished

**Note**: Status can be updated at any time via `PUT /api/patients/<id>/`

---

## Testing the API

### Using curl

**List patients**:
```bash
curl http://localhost:8000/api/patients/
```

**Create patient**:
```bash
curl -X POST http://localhost:8000/api/patients/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "age": 30,
    "gender": "Male",
    "phone": "1234567890"
  }'
```

**Update patient status**:
```bash
curl -X PUT http://localhost:8000/api/patients/1/ \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Using Postman

1. Import base URL: `http://localhost:8000/api`
2. Set headers: `Content-Type: application/json`
3. Use the endpoints documented above

### Using Django Admin

Access `http://localhost:8000/admin` to:
- View and edit all data
- Test relationships between models
- Manually create test data
- Debug API responses

---

## Rate Limiting

Currently not implemented. For production, consider:
- Rate limiting per IP address
- Device-specific rate limits
- Authenticated vs. anonymous limits

---

## Pagination

Currently not implemented. All list endpoints return full results. For large datasets, implement Django REST Framework pagination.

---

## CORS Configuration

Currently configured for:
- `http://localhost:3000` (Unified Frontend)
- `http://localhost:4000` (Main Frontend)

For production, update `CORS_ALLOWED_ORIGINS` in `backend/ashwini_backend/settings.py`.

---

## Additional Resources

- **Django REST Framework Docs**: https://www.django-rest-framework.org/
- **Project README**: See `README.md` for setup instructions
- **IoT Integration Guide**: See `IOT_INTEGRATION.md` for device integration details
- **Quick Start**: See `QUICKSTART.md` for rapid setup

---

**API Version**: 1.0  
**Last Updated**: January 7, 2026
