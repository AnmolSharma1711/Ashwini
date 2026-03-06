from rest_framework import serializers
from .models import Patient, VisitHistory
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
        fields = [
            'id', 'patient_id', 'name', 'age', 'gender', 'phone', 'status', 'visit_time', 
            'reason', 'health_status', 'priority_score', 'last_assessment_time'
        ]


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
            'id', 'patient_id', 'name', 'age', 'gender', 'phone', 'address', 'reason',
            'visit_time', 'status', 'notes', 'next_visit_date',
            'latest_measurement', 'prescription', 
            'health_status', 'priority_score', 'last_assessment_time'
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
            'id', 'patient_id', 'name', 'age', 'gender', 'phone', 'address', 'reason',
            'status', 'notes', 'next_visit_date',
            'data_collection_consent', 'data_usage_consent', 'privacy_policy_acknowledged'
        ]
        read_only_fields = ['id', 'patient_id']
    
    def validate_age(self, value):
        """Validate age field - reject empty strings and invalid values."""
        if value is None:
            raise serializers.ValidationError("Age is required.")
        
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise serializers.ValidationError("Age cannot be empty.")
            try:
                value = int(value)
            except ValueError:
                raise serializers.ValidationError("Age must be a valid number.")
        
        if value < 0 or value > 150:
            raise serializers.ValidationError("Age must be between 0 and 150.")
        
        return value
    
    def validate(self, data):
        """Validate consent fields for new patient registration."""
        # Check if this is a new patient creation (not an update)
        if not self.instance:
            # Require all consent fields for new registrations
            required_consents = ['data_collection_consent', 'data_usage_consent', 'privacy_policy_acknowledged']
            
            for consent_field in required_consents:
                if not data.get(consent_field, False):
                    field_name = consent_field.replace('_', ' ').title()
                    raise serializers.ValidationError({
                        consent_field: f"{field_name} is required for new patient registration."
                    })
        
        return data


class VisitHistorySerializer(serializers.ModelSerializer):
    """Serializer for visit history records."""
    
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    
    class Meta:
        model = VisitHistory
        fields = [
            'id', 'patient_name', 'visit_time', 'reason', 'status',
            'health_status', 'notes', 'next_visit_date', 'archived_at'
        ]
