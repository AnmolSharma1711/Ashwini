from rest_framework import serializers
from .models import Measurement


class MeasurementSerializer(serializers.ModelSerializer):
    """
    Serializer for Measurement model.
    
    IoT Integration Point:
    This serializer is used for both manual entry and device-captured measurements.
    The 'source' field is automatically set based on the endpoint used.
    """
    
    class Meta:
        model = Measurement
        fields = [
            'id', 'patient', 'timestamp',
            'blood_pressure', 'temperature', 'spo2', 'heart_rate',
            'source'
        ]
        read_only_fields = ['id', 'timestamp', 'patient']


class MeasurementCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating measurements.
    Excludes patient and source (set by view).
    """
    
    class Meta:
        model = Measurement
        fields = ['blood_pressure', 'temperature', 'spo2', 'heart_rate']
