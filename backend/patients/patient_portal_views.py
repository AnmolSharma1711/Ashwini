"""
Patient Portal API Views

These views allow patients to:
- Register with their personal information
- View their own profile and visit history
- View their prescriptions
- View their measurement history
- Check next appointment dates
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction

from .models import CustomUser, Patient
from .serializers import PatientDetailSerializer
from .auth_serializers import UserSerializer, UserRegistrationSerializer
from prescriptions.models import Prescription
from prescriptions.serializers import PrescriptionSerializer
from measurements.models import Measurement
from measurements.serializers import MeasurementSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def patient_register_view(request):
    """
    Patient self-registration endpoint.
    
    POST /api/patient-portal/register/
    
    Request Body:
    {
        "username": "string",
        "email": "string",
        "password": "string",
        "password_confirm": "string",
        "first_name": "string",
        "last_name": "string",
        "phone": "string",
        "age": number,
        "gender": "Male|Female|Other",
        "address": "string"
    }
    
    Response:
    {
        "access": "jwt_access_token",
        "refresh": "jwt_refresh_token",
        "user": {...},
        "message": "Patient registered successfully"
    }
    """
    # Extract user fields for CustomUser creation
    user_data = {
        'username': request.data.get('username'),
        'email': request.data.get('email'),
        'password': request.data.get('password'),
        'password_confirm': request.data.get('password_confirm'),
        'first_name': request.data.get('first_name'),
        'last_name': request.data.get('last_name'),
        'role': 'PATIENT'  # Force PATIENT role
    }
    
    # Extract patient profile fields
    patient_data = {
        'name': f"{request.data.get('first_name')} {request.data.get('last_name')}",
        'age': request.data.get('age'),
        'gender': request.data.get('gender'),
        'phone': request.data.get('phone'),
        'address': request.data.get('address'),
    }
    
    # Validate required fields
    if not all([user_data['username'], user_data['email'], user_data['password'], 
                patient_data['age'], patient_data['gender']]):
        return Response(
            {'error': 'Username, email, password, age, and gender are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user and patient profile in a transaction
    try:
        with transaction.atomic():
            # Check if phone number is already associated with a user account
            if patient_data.get('phone'):
                existing_with_user = Patient.objects.filter(
                    phone=patient_data['phone'],
                    user__isnull=False  # Already has a user account
                ).first()
                
                if existing_with_user:
                    return Response(
                        {
                            'error': 'A patient account with this phone number already exists.',
                            'message': 'Please login with your existing credentials or contact reception.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Check if a patient with this phone number already exists (registered by reception)
            existing_patient = None
            if patient_data.get('phone'):
                existing_patient = Patient.objects.filter(
                    phone=patient_data['phone'],
                    user__isnull=True  # Not yet linked to a user account
                ).first()
            
            if existing_patient:
                # Link the existing patient to this new user account
                # But first create the user
                user_serializer = UserRegistrationSerializer(data=user_data)
                if not user_serializer.is_valid():
                    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                user = user_serializer.save()
                
                # Link and update existing patient
                existing_patient.user = user
                existing_patient.name = patient_data['name']  # Update name if needed
                existing_patient.age = patient_data['age']
                existing_patient.gender = patient_data['gender']
                if patient_data.get('address'):
                    existing_patient.address = patient_data['address']
                existing_patient.save()
                patient = existing_patient
                
                # Ensure prescription exists for this patient
                Prescription.objects.get_or_create(patient=patient, defaults={'medicines': []})
                
                message = 'Patient account linked to existing record successfully'
            else:
                # Create CustomUser first
                user_serializer = UserRegistrationSerializer(data=user_data)
                if not user_serializer.is_valid():
                    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                user = user_serializer.save()
                
                # Create new Patient profile linked to this user
                patient = Patient.objects.create(
                    user=user,
                    name=patient_data['name'],
                    age=patient_data['age'],
                    gender=patient_data['gender'],
                    phone=patient_data.get('phone', ''),
                    address=patient_data.get('address', ''),
                    status='waiting'  # Default status
                )
                
                # Create empty prescription for this patient
                Prescription.objects.create(patient=patient)
                
                message = 'Patient registered successfully'
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'patient_id': patient.id,
                'message': message
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_profile_view(request):
    """
    Get current patient's profile with latest visit information.
    
    GET /api/patient-portal/profile/
    
    Response:
    {
        "id": 1,
        "name": "John Doe",
        "age": 35,
        "gender": "Male",
        "phone": "+1234567890",
        "address": "123 Main St",
        "status": "completed",
        "visit_time": "2024-01-15T10:30:00Z",
        "next_visit_date": "2024-02-15",
        "health_status": "normal",
        "latest_measurement": {...},
        "prescription": {...}
    }
    """
    user = request.user
    
    # Check if user is a patient
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get patient profile
    try:
        patient = user.patient_profile
    except Patient.DoesNotExist:
        return Response(
            {'error': 'No patient profile found for this user'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = PatientDetailSerializer(patient)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_measurements_view(request):
    """
    Get all measurements for the current patient.
    
    GET /api/patient-portal/measurements/
    
    Response: Array of measurement objects sorted by timestamp (latest first)
    [
        {
            "id": 1,
            "timestamp": "2024-01-15T10:45:00Z",
            "blood_pressure": "120/80",
            "temperature": 36.5,
            "spo2": 98.0,
            "heart_rate": 72.0,
            "source": "device"
        },
        ...
    ]
    """
    user = request.user
    
    # Check if user is a patient
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get patient profile
    try:
        patient = user.patient_profile
    except Patient.DoesNotExist:
        return Response(
            {'error': 'No patient profile found for this user'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get all measurements for this patient
    measurements = Measurement.objects.filter(patient=patient).order_by('-timestamp')
    serializer = MeasurementSerializer(measurements, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_prescription_view(request):
    """
    Get prescription for the current patient.
    
    GET /api/patient-portal/prescription/
    
    Response:
    {
        "patient": 1,
        "medicines": [
            {
                "name": "Paracetamol",
                "dose": "twice a day",
                "type": "Tablet",
                "quantity": "Full"
            }
        ]
    }
    """
    user = request.user
    
    # Check if user is a patient
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get patient profile
    try:
        patient = user.patient_profile
    except Patient.DoesNotExist:
        return Response(
            {'error': 'No patient profile found for this user'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get prescription (one-to-one relationship)
    try:
        prescription = patient.prescription
        serializer = PrescriptionSerializer(prescription)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Prescription.DoesNotExist:
        return Response(
            {'message': 'No prescription found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_prescription_history_view(request):
    """
    Get prescription history for the current patient to compare past prescriptions.
    
    GET /api/patient-portal/prescription-history/
    
    Response: Array of historical prescriptions sorted by date (latest first)
    [
        {
            "id": 1,
            "medicines": [...],
            "created_at": "2024-01-15T10:45:00Z",
            "visit_date": "2024-01-15T09:00:00Z"
        },
        ...
    ]
    """
    from prescriptions.models import PrescriptionHistory
    from prescriptions.serializers import PrescriptionHistorySerializer
    
    user = request.user
    
    # Check if user is a patient
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get patient profile
    try:
        patient = user.patient_profile
    except Patient.DoesNotExist:
        return Response(
            {'error': 'No patient profile found for this user'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get prescription history
    history = PrescriptionHistory.objects.filter(patient=patient)
    serializer = PrescriptionHistorySerializer(history, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_visits_view(request):
    """
    Get visit history for the current patient.
    
    GET /api/patient-portal/visits/
    
    Response:
    {
        "current_visit": {...},
        "visit_history": [...]
    }
    """
    from .models import VisitHistory
    from .serializers import VisitHistorySerializer
    
    user = request.user
    
    # Check if user is a patient
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get patient profile
    try:
        patient = user.patient_profile
    except Patient.DoesNotExist:
        return Response(
            {'error': 'No patient profile found for this user'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get current visit info
    current_visit = {
        'visit_time': patient.visit_time,
        'reason': patient.reason,
        'status': patient.status,
        'health_status': patient.health_status,
        'notes': patient.notes,
        'next_visit_date': patient.next_visit_date
    }
    
    # Get visit history
    history = VisitHistory.objects.filter(patient=patient)
    history_serializer = VisitHistorySerializer(history, many=True)
    
    response_data = {
        'current_visit': current_visit,
        'visit_history': history_serializer.data
    }
    
    return Response(response_data, status=status.HTTP_200_OK)
