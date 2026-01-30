from django.db import models
from patients.models import Patient


class Measurement(models.Model):
    """
    Measurement model for storing patient vital signs.
    
    This model is designed to support both manual entry and IoT device integration.
    Currently, measurements are entered manually via the Health Monitoring Station UI.
    
    IoT Integration Point:
    In the future, IoT devices will POST measurements directly to this model via the API.
    The 'source' field distinguishes between manual and device-captured measurements.
    
    Fields can be optional to support partial measurements.
    """
    
    SOURCE_CHOICES = [
        ('manual', 'Manual Entry'),
        ('device', 'IoT Device'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='measurements'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Vital Signs (all optional to support partial measurements)
    blood_pressure = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Format: systolic/diastolic (e.g., 120/80)"
    )
    temperature = models.FloatField(
        blank=True,
        null=True,
        help_text="Temperature in Celsius"
    )
    spo2 = models.FloatField(
        blank=True,
        null=True,
        help_text="Blood oxygen saturation in percentage"
    )
    heart_rate = models.FloatField(
        blank=True,
        null=True,
        help_text="Heart rate in beats per minute"
    )
    
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default='manual'
    )
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Measurement for {self.patient.name} at {self.timestamp}"
