from django.db import models
from patients.models import Patient


class PrescriptionHistory(models.Model):
    """
    Historical record of prescriptions for comparison with past visits.
    
    Stores a snapshot of the prescription whenever it's updated.
    Patients can view their prescription history to compare medications
    across different visits.
    """
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='prescription_history'
    )
    medicines = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    visit_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Prescription History'
        verbose_name_plural = 'Prescription Histories'
    
    def __str__(self):
        return f"Prescription for {self.patient.name} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"


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
