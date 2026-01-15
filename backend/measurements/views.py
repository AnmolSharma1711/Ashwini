from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Measurement
from .serializers import MeasurementSerializer, MeasurementCreateSerializer
from patients.models import Patient


@api_view(['GET'])
def patient_measurements_latest(request, patient_id):
    """
    Get the latest measurement for a patient.
    
    GET /api/patients/<patient_id>/measurements/latest/
    
    Returns the most recent Measurement record or null if none exists.
    """
    patient = get_object_or_404(Patient, id=patient_id)
    latest = patient.measurements.first()  # Already ordered by -timestamp
    
    if latest:
        serializer = MeasurementSerializer(latest)
        return Response(serializer.data)
    else:
        return Response(None, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def patient_measurements_list(request, patient_id):
    """
    Get all measurements for a patient or create a new one.
    
    GET /api/patients/<patient_id>/measurements/
    Returns a list of all Measurement records, ordered by timestamp (newest first).
    
    POST /api/patients/<patient_id>/measurements/
    Body: {
        "blood_pressure": "120/80",  // optional
        "temperature": 98.6,          // optional
        "spo2": 98.0,                 // optional
        "heart_rate": 72.0            // optional
    }
    Creates a new measurement with source="manual".
    """
    patient = get_object_or_404(Patient, id=patient_id)
    
    if request.method == 'GET':
        measurements = patient.measurements.all()
        serializer = MeasurementSerializer(measurements, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MeasurementCreateSerializer(data=request.data)
        if serializer.is_valid():
            measurement = serializer.save(
                patient=patient,
                source='manual'
            )
            
            # Auto-assess patient health status after new measurement
            patient.assess_health_status()
            
            response_serializer = MeasurementSerializer(measurement)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
