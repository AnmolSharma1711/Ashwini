from rest_framework import serializers
from .models import Prescription, PrescriptionHistory


class PrescriptionHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for PrescriptionHistory model.
    Shows historical prescriptions for comparison with past visits.
    """
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    
    class Meta:
        model = PrescriptionHistory
        fields = ['id', 'patient_name', 'medicines', 'created_at', 'visit_date']


class PrescriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for Prescription model.
    
    The medicines field is a JSONField containing a list of medicine objects.
    Each medicine object should have:
    - name: string
    - dose: string (e.g., "once a day")
    - type: string (e.g., "Tablet", "Serum")
    - quantity: string (e.g., "Full", "Half", "5ml")
    """
    patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    
    class Meta:
        model = Prescription
        fields = ['patient_id', 'patient_name', 'medicines']
