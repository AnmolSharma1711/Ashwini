from rest_framework import serializers
from .models import Prescription


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
    
    class Meta:
        model = Prescription
        fields = ['medicines']
