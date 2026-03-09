# Project Ashwini - IoT Integration Guide

## 🔌 Adding Real IoT Device Support

This guide explains how to integrate physical IoT health monitoring devices with Project Ashwini.

---

## Architecture Overview

### Current State (Manual Entry)
```
Registration Staff → Patient Queue → Health Monitoring Staff (Manual Entry) → Doctor
```

### Future State (IoT Enabled)
```
Registration Staff → Patient Queue → IoT Device (Automatic Measurement) → Doctor
                                  ↓
                          Health Monitoring Staff
                          (Supervises & Assists)
```

---

## Integration Points

### 1. Backend Device Command Polling

**Location**: `backend/devices/views.py` → `device_command()`

**Current Implementation**:
```python
return Response({"command": "idle"})
```

**IoT Implementation**:
```python
@api_view(['GET'])
def device_command(request, device_id):
    device = get_object_or_404(Device, device_id=device_id)
    device.last_seen = timezone.now()
    device.save()
    
    # Check for pending measurement sessions
    pending_session = MeasurementSession.objects.filter(
        device=device,
        status='pending'
    ).first()
    
    if pending_session:
        return Response({
            "command": "measure",
            "patient_id": pending_session.patient.id,
            "session_id": pending_session.id,
            "patient_name": pending_session.patient.name
        })
    
    return Response({"command": "idle"})
```

---

### 2. Backend Measurement Submission

**Location**: `backend/devices/views.py` → `device_measurements_create()`

**Add to existing implementation**:
```python
# After creating measurement, update session
session_id = request.data.get('session_id')
if session_id:
    try:
        session = MeasurementSession.objects.get(id=session_id)
        session.status = 'completed'
        session.save()
        
        # Update patient status
        patient = session.patient
        if patient.status == 'checking':
            patient.status = 'examined'
            patient.save()
    except MeasurementSession.DoesNotExist:
        pass
```

---

### 3. Device Authentication

**Add to**: `backend/ashwini_backend/settings.py`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

INSTALLED_APPS = [
    ...
    'rest_framework.authtoken',
]
```

**Create device tokens**:
```python
# In Django shell or management command
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from devices.models import Device

# Create a system user for each device
device = Device.objects.get(device_id='KIOSK-001')
user = User.objects.create_user(username=f'device_{device.device_id}')
token = Token.objects.create(user=user)

print(f"Device Token: {token.key}")
# Store this token in the IoT device configuration
```

**Update device views** to require authentication:
```python
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def device_command(request, device_id):
    # ... existing code
```

---

### 4. Frontend: Start Device Measurement

**Location**: `frontend-main/src/components/HealthMonitoringStation.js`

**Replace the IoT placeholder section with**:

```javascript
const [deviceMeasuring, setDeviceMeasuring] = useState(false);
const [sessionId, setSessionId] = useState(null);

const handleStartDeviceMeasurement = async () => {
  if (!selectedPatient) return;
  
  setDeviceMeasuring(true);
  
  try {
    // Create a measurement session
    const sessionResponse = await api.post('/measurement-sessions/', {
      patient: selectedPatient.id,
      device: 1, // Or selected device ID
      status: 'pending'
    });
    
    setSessionId(sessionResponse.data.id);
    
    // Update patient status to checking
    await updatePatient(selectedPatient.id, { status: 'checking' });
    
    showMessage('success', 'Device measurement initiated. Please proceed to the kiosk.');
    
    // Start polling for completion
    pollForMeasurementCompletion(sessionResponse.data.id);
    
  } catch (error) {
    showMessage('error', 'Failed to start device measurement');
    setDeviceMeasuring(false);
  }
};

const pollForMeasurementCompletion = async (sessionId) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await api.get(`/measurement-sessions/${sessionId}/`);
      
      if (response.data.status === 'completed') {
        clearInterval(pollInterval);
        setDeviceMeasuring(false);
        showMessage('success', 'Device measurement completed!');
        fetchLatestMeasurement(selectedPatient.id);
        loadPatientDetails(selectedPatient.id);
      } else if (response.data.status === 'failed') {
        clearInterval(pollInterval);
        setDeviceMeasuring(false);
        showMessage('error', 'Device measurement failed');
      }
    } catch (error) {
      clearInterval(pollInterval);
      setDeviceMeasuring(false);
      showMessage('error', 'Error checking measurement status');
    }
  }, 3000); // Poll every 3 seconds
  
  // Stop polling after 5 minutes
  setTimeout(() => clearInterval(pollInterval), 300000);
};
```

**Update the UI**:
```javascript
<button 
  className="btn btn-warning" 
  onClick={handleStartDeviceMeasurement}
  disabled={!selectedPatient || deviceMeasuring}
>
  {deviceMeasuring ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      Waiting for device measurement...
    </>
  ) : (
    'Start Device Measurement'
  )}
</button>
```

---

### 5. Add MeasurementSession API

**Create**: `backend/devices/serializers.py`

```python
from rest_framework import serializers
from .models import MeasurementSession

class MeasurementSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementSession
        fields = '__all__'
```

**Add to**: `backend/devices/views.py`

```python
from rest_framework import viewsets
from .models import MeasurementSession
from .serializers import MeasurementSessionSerializer

class MeasurementSessionViewSet(viewsets.ModelViewSet):
    queryset = MeasurementSession.objects.all()
    serializer_class = MeasurementSessionSerializer
```

**Update**: `backend/devices/urls.py`

```python
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'measurement-sessions', views.MeasurementSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('devices/<str:device_id>/command/', views.device_command),
    path('devices/<str:device_id>/measurements/', views.device_measurements_create),
]
```

---

## IoT Device Implementation

### Device-Side Code (Python Example)

```python
import requests
import time
import json

# Configuration
API_BASE = "http://your-server:8000/api"
DEVICE_ID = "KIOSK-001"
DEVICE_TOKEN = "your-device-token-here"  # From Token creation step

headers = {
    "Authorization": f"Token {DEVICE_TOKEN}",
    "Content-Type": "application/json"
}

def poll_for_command():
    """Poll server for commands"""
    try:
        response = requests.get(
            f"{API_BASE}/devices/{DEVICE_ID}/command/",
            headers=headers,
            timeout=10
        )
        return response.json()
    except Exception as e:
        print(f"Error polling: {e}")
        return {"command": "idle"}

def measure_vitals():
    """
    Interface with actual hardware to capture vitals.
    This is a stub - replace with actual device communication.
    """
    # TODO: Replace with actual hardware interface
    vitals = {
        "blood_pressure": read_bp_sensor(),      # e.g., "120/80"
        "temperature": read_temp_sensor(),       # e.g., 98.6
        "spo2": read_spo2_sensor(),             # e.g., 98.0
        "heart_rate": read_hr_sensor()          # e.g., 72.0
    }
    return vitals

def submit_measurement(patient_id, session_id, vitals):
    """Submit captured measurements to server"""
    payload = {
        "patient_id": patient_id,
        "session_id": session_id,
        **vitals
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/devices/{DEVICE_ID}/measurements/",
            headers=headers,
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        print(f"Measurement submitted successfully for patient {patient_id}")
        return True
    except Exception as e:
        print(f"Error submitting measurement: {e}")
        return False

def main_loop():
    """Main device loop"""
    print(f"Device {DEVICE_ID} starting...")
    
    while True:
        # Poll for command
        command_data = poll_for_command()
        command = command_data.get("command", "idle")
        
        if command == "measure":
            patient_id = command_data.get("patient_id")
            session_id = command_data.get("session_id")
            patient_name = command_data.get("patient_name", "Unknown")
            
            print(f"Starting measurement for {patient_name} (ID: {patient_id})")
            
            # Display on device screen
            display_message(f"Please stand by, {patient_name}")
            
            # Capture vitals from hardware
            vitals = measure_vitals()
            
            # Submit to server
            success = submit_measurement(patient_id, session_id, vitals)
            
            if success:
                display_message("Measurement complete. Thank you!")
            else:
                display_message("Error. Please see staff.")
            
            time.sleep(5)  # Show message for 5 seconds
            clear_display()
        
        # Wait before next poll
        time.sleep(5)

if __name__ == "__main__":
    main_loop()
```

---

## Hardware Recommendations

### Suggested IoT Sensors

1. **Blood Pressure Monitor**
   - Module: HEM-7120 or similar with serial/USB output
   - Protocol: Serial communication or Bluetooth

2. **Infrared Thermometer**
   - Module: MLX90614 or similar
   - Interface: I2C

3. **Pulse Oximeter**
   - Module: MAX30102 or similar
   - Interface: I2C
   - Measures: SpO₂ and Heart Rate

4. **Computing Platform**
   - Raspberry Pi 4 (recommended)
   - Or any Linux-based SBC with GPIO/I2C/Serial

5. **Display**
   - 7-inch touchscreen for patient feedback
   - Or simple LCD for status messages

---

## Testing IoT Integration

### 1. Register a Device
```python
# Django shell
from devices.models import Device

device = Device.objects.create(
    device_id="KIOSK-001",
    name="Main Reception Kiosk",
    is_active=True
)
```

### 2. Test Command Polling
```bash
curl http://localhost:8000/api/devices/KIOSK-001/command/
# Should return: {"command": "idle"}
```

### 3. Create a Test Session
```python
# Django shell
from devices.models import MeasurementSession
from patients.models import Patient

patient = Patient.objects.first()
session = MeasurementSession.objects.create(
    patient=patient,
    device=device,
    status='pending'
)
```

### 4. Test Command Polling Again
```bash
curl http://localhost:8000/api/devices/KIOSK-001/command/
# Should return: {"command": "measure", "patient_id": ..., "session_id": ...}
```

### 5. Submit Test Measurement
```bash
curl -X POST http://localhost:8000/api/devices/KIOSK-001/measurements/ \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "session_id": 1,
    "blood_pressure": "120/80",
    "temperature": 98.6,
    "spo2": 98.0,
    "heart_rate": 72.0
  }'
```

---

## Security Considerations

1. **Device Authentication**: Use token-based auth
2. **HTTPS**: Always use HTTPS in production
3. **Network Isolation**: Keep IoT devices on separate VLAN
4. **Input Validation**: Validate all sensor readings
5. **Rate Limiting**: Prevent device spam
6. **Audit Logging**: Log all device communications

---

## Troubleshooting IoT Issues

### Device Can't Connect
- Verify network connectivity
- Check firewall rules
- Ensure API is accessible from device network
- Verify token authentication

### Measurements Not Recording
- Check device logs
- Verify patient_id exists
- Ensure session is in 'pending' status
- Check measurement format matches API spec

### Session Stuck in Pending
- Add timeout mechanism (auto-fail after 10 minutes)
- Implement manual session cancellation
- Check device is polling regularly

---

## Performance Optimization

For multiple devices:
- Implement WebSocket for real-time updates
- Use Redis for session caching
- Add message queue (Celery) for async processing
- Load balance API servers

---

**Ready to connect real hardware!** 🔌
