from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Device, MeasurementSession
from measurements.models import Measurement
from measurements.serializers import MeasurementSerializer, MeasurementCreateSerializer
from patients.models import Patient


@api_view(['GET'])
def device_command(request, device_id):
    """
    IoT Integration Point: Device Command Polling Endpoint
    
    GET /api/devices/<device_id>/command/
    
    This endpoint is intended for physical IoT health monitoring devices to poll
    for commands and instructions.
    
    Current Implementation (Stub):
    - Always returns { "command": "idle" }
    - Updates device's last_seen timestamp
    
    Future Implementation:
    1. Check if there's a pending MeasurementSession for this device
    2. If yes, return:
       {
         "command": "measure",
         "patient_id": <id>,
         "session_id": <session_id>
       }
    3. Device starts measurement and updates session status
    4. Device posts results to /api/devices/<device_id>/measurements/
    
    Authentication Note:
    In production, this endpoint should require token-based authentication
    to verify the device identity.
    """
    
    # Verify device exists and update last_seen
    device = get_object_or_404(Device, device_id=device_id)
    device.last_seen = timezone.now()
    device.save()
    
    # Check for pending measurement sessions
    pending_session = MeasurementSession.objects.filter(
        device=device,
        status='pending'
    ).first()
    
    if pending_session:
        # Update session status to in_progress
        pending_session.status = 'in_progress'
        pending_session.save()
        
        return Response({
            "command": "measure",
            "patient_id": pending_session.patient.id,
            "session_id": pending_session.id,
            "patient_name": pending_session.patient.name
        })
    
    # No pending measurement, return idle
    return Response({
        "command": "idle"
    })


@api_view(['POST'])
def device_measurements_create(request, device_id):
    """
    IoT Integration Point: Device Measurement Submission Endpoint
    
    POST /api/devices/<device_id>/measurements/
    Body: {
        "patient_id": <id>,
        "blood_pressure": "120/80",  // optional
        "temperature": 98.6,          // optional
        "spo2": 98.0,                 // optional
        "heart_rate": 72.0            // optional
    }
    
    This endpoint is intended for physical IoT health monitoring devices to submit
    captured vital signs measurements.
    
    Current Implementation:
    - Validates input data
    - Creates a Measurement record with source="device"
    - Returns the created measurement
    
    Future Enhancements:
    1. Verify device authentication (token-based)
    2. Update associated MeasurementSession status to 'completed'
    3. Trigger notifications to Health Monitoring Station UI
    4. Validate measurement ranges and flag anomalies
    
    Authentication Note:
    In production, this endpoint should require token-based authentication
    to verify the device identity and prevent unauthorized data submission.
    """
    
    # Verify device exists and update last_seen
    device = get_object_or_404(Device, device_id=device_id)
    device.last_seen = timezone.now()
    device.save()
    
    # Extract patient_id from request
    patient_id = request.data.get('patient_id')
    if not patient_id:
        return Response(
            {"error": "patient_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    patient = get_object_or_404(Patient, id=patient_id)
    
    # Validate measurement data
    serializer = MeasurementCreateSerializer(data=request.data)
    if serializer.is_valid():
        # Create measurement with source="device"
        measurement = serializer.save(
            patient=patient,
            source='device'
        )
        
        # Future: Update MeasurementSession status
        # session_id = request.data.get('session_id')
        # if session_id:
        #     session = MeasurementSession.objects.get(id=session_id)
        #     session.status = 'completed'
        #     session.save()
        
        response_serializer = MeasurementSerializer(measurement)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_measurement_session(request):
    """
    Create a new measurement session for IoT device.
    
    POST /api/measurement-sessions/
    Body: {
        "patient": <patient_id>,
        "device": <device_id>
    }
    """
    patient_id = request.data.get('patient')
    device_id = request.data.get('device')
    
    if not patient_id or not device_id:
        return Response(
            {"error": "patient and device are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    patient = get_object_or_404(Patient, id=patient_id)
    device = get_object_or_404(Device, id=device_id)
    
    # Create new measurement session with pending status
    session = MeasurementSession.objects.create(
        patient=patient,
        device=device,
        status='pending'
    )
    
    # Update patient status to checking
    patient.status = 'checking'
    patient.save()
    
    return Response({
        "id": session.id,
        "patient": session.patient.id,
        "device": session.device.id,
        "status": session.status,
        "message": f"Measurement session created. Device will receive measurement instructions."
    }, status=status.HTTP_201_CREATED)
