from django.db import models
from patients.models import Patient


class Device(models.Model):
    """
    Device model representing physical IoT health monitoring devices.
    
    IoT Integration Point:
    This model will track the IoT devices (health monitoring kiosks) deployed
    in the clinic/hospital. Each device will have a unique device_id that it
    uses to authenticate and communicate with the backend.
    
    Future Implementation:
    - Devices will poll for commands via GET /api/devices/<device_id>/command/
    - Devices will push measurements via POST /api/devices/<device_id>/measurements/
    - Add authentication mechanism (token-based) for device security
    - Track device health and connectivity status
    """
    
    device_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200, help_text="Friendly name (e.g., 'Kiosk 1')")
    is_active = models.BooleanField(default=True)
    last_seen = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} ({self.device_id})"


class MeasurementSession(models.Model):
    """
    MeasurementSession model for tracking device measurement sessions.
    
    IoT Integration Point:
    This model represents a session when a patient is being measured via an IoT device.
    
    Workflow (Future Implementation):
    1. Staff assigns a patient to a device (creates session with status='pending')
    2. Device polls /api/devices/<device_id>/command/ and receives patient_id
    3. Device starts measurement, updates session to 'in_progress'
    4. Device captures vitals and POSTs to /api/devices/<device_id>/measurements/
    5. Session marked as 'completed'
    
    For now, this model exists but is not actively used. Manual measurements
    bypass this workflow.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='measurement_sessions'
    )
    device = models.ForeignKey(
        Device,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session for {self.patient.name} on {self.device.name} - {self.status}"
