from django.db import models
from patients.models import Patient


class Prescription(models.Model):
    """
    Prescription model - one-to-one relationship with Patient.
    
    Stores the list of medicines as a JSON field. Each medicine object contains:
    - name: Medicine name (string)
    - dose: Dosage instructions (string, e.g., "once a day")
    - type: Type of medicine (string, e.g., "Tablet", "Serum")
    - quantity: Quantity (string, e.g., "Full", "Half", "5ml", "10ml")
    
    Example medicines JSON:
    [
        {
            "name": "Paracetamol",
            "dose": "twice a day",
            "type": "Tablet",
            "quantity": "Full"
        },
        {
            "name": "IV Saline",
            "dose": "once",
            "type": "Serum",
            "quantity": "500ml"
        }
    ]
    """
    
    patient = models.OneToOneField(
        Patient,
        on_delete=models.CASCADE,
        related_name='prescription',
        primary_key=True
    )
    medicines = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"Prescription for {self.patient.name}"
