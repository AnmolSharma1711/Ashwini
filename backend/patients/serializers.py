from rest_framework import serializers
from .models import Patient
from prescriptions.models import Prescription
from measurements.models import Measurement


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for prescription data."""
    
    class Meta:
        model = Prescription
        fields = ['medicines']


class LatestMeasurementSerializer(serializers.ModelSerializer):
    """Serializer for measurement data."""
    
    class Meta:
        model = Measurement
        fields = ['id', 'timestamp', 'blood_pressure', 'temperature', 'spo2', 'heart_rate', 'source']


class PatientListSerializer(serializers.ModelSerializer):
    """Serializer for patient list view - lightweight."""
    
    class Meta:
        model = Patient
        fields = ['id', 'name', 'age', 'gender', 'phone', 'status', 'visit_time', 'reason']


class PatientDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed patient view.
    
    Includes:
    - Basic demographics
    - Latest measurement
    - Prescription (medicines list)
    - Doctor's notes and next visit
    """
    
    latest_measurement = serializers.SerializerMethodField()
    prescription = PrescriptionSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'age', 'gender', 'phone', 'address', 'reason',
            'visit_time', 'status', 'notes', 'next_visit_date',
            'latest_measurement', 'prescription'
        ]
    
    def get_latest_measurement(self, obj):
        """Get the most recent measurement for this patient."""
        latest = obj.measurements.first()  # Already ordered by -timestamp
        if latest:
            return LatestMeasurementSerializer(latest).data
        return None


class PatientCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating patients."""
    
    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'age', 'gender', 'phone', 'address', 'reason',
            'status', 'notes', 'next_visit_date'
        ]
        read_only_fields = ['id']
