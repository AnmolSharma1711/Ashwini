from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Patient, ConsentLog
from .serializers import (
    PatientListSerializer,
    PatientDetailSerializer,
    PatientCreateUpdateSerializer
)
from prescriptions.models import Prescription
from prescriptions.serializers import PrescriptionSerializer


def get_client_ip(request):
    """Extract client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_consent(patient, request, action='CONSENT_GRANTED'):
    """Log patient consent action for audit trail."""
    try:
        ConsentLog.objects.create(
            patient=patient,
            action=action,
            consent_version='1.0',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            data_collection_consent=patient.data_collection_consent,
            data_usage_consent=patient.data_usage_consent,
            privacy_policy_acknowledged=patient.privacy_policy_acknowledged
        )
    except Exception as e:
        print(f"Warning: Failed to log consent: {str(e)}")


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Patient CRUD operations.
    
    Endpoints:
    - GET /api/patients/ - List all patients (with optional ?status= filter)
    - GET /api/patients/prioritized/ - List patients sorted by health priority
    - POST /api/patients/ - Create new patient (auto-creates empty prescription)
    - GET /api/patients/<id>/ - Get patient details with latest measurement & prescription
    - PUT /api/patients/<id>/ - Update patient (partial updates allowed)
    - DELETE /api/patients/<id>/ - Delete patient
    - GET /api/patients/<id>/prescription/ - Get patient's prescription
    - PUT /api/patients/<id>/prescription/ - Update patient's prescription
    - POST /api/patients/<id>/assess_health/ - Manually trigger health assessment
    """
    
    queryset = Patient.objects.all()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list' or self.action == 'prioritized':
            return PatientListSerializer
        elif self.action == 'retrieve':
            return PatientDetailSerializer
        else:
            return PatientCreateUpdateSerializer
    
    def get_queryset(self):
        """
        Optionally filter patients by status.
        Example: GET /api/patients/?status=waiting
        """
        queryset = Patient.objects.all()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset
    
    @action(detail=False, methods=['get'])
    def prioritized(self, request):
        """
        Get patients sorted by health priority (critical first).
        
        GET /api/patients/prioritized/
        Returns patients ordered by: priority_score DESC, visit_time ASC
        """
        patients = Patient.objects.all().order_by('-priority_score', 'visit_time')
        
        # Optional filter by health status
        health_filter = request.query_params.get('health_status', None)
        if health_filter:
            patients = patients.filter(health_status=health_filter)
        
        serializer = self.get_serializer(patients, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search for patients by patient_id, phone, or name.
        
        GET /api/patients/search/?q=<search_term>
        
        Searches in the following order:
        1. Exact match by patient_id
        2. Exact match by phone number
        3. Partial match by name (case-insensitive)
        
        Returns list of matching patients.
        """
        search_term = request.query_params.get('q', '').strip()
        
        if not search_term:
            return Response(
                {'error': 'Search term required. Use ?q=<patient_id|phone|name>'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try exact match by patient_id first
        patient = Patient.objects.filter(patient_id=search_term).first()
        if patient:
            serializer = PatientDetailSerializer(patient)
            return Response({'results': [serializer.data], 'count': 1})
        
        # Try exact match by phone
        patients = Patient.objects.filter(phone=search_term)
        if patients.exists():
            serializer = PatientListSerializer(patients, many=True)
            return Response({'results': serializer.data, 'count': patients.count()})
        
        # Try partial match by name (case-insensitive)
        patients = Patient.objects.filter(name__icontains=search_term)
        serializer = PatientListSerializer(patients, many=True)
        return Response({'results': serializer.data, 'count': patients.count()})
    
    def create(self, request, *args, **kwargs):
        """
        Register a patient for a new visit.
        
        Search priority for existing patients:
        1. patient_id (if provided)
        2. phone + name combination
        
        - If patient exists: Update visit information and reset status (returning patient)
        - If patient is new: Create new patient record
        - Preserves user account, measurements, and prescription history
        """
        try:
            patient_id = request.data.get('patient_id')
            phone = request.data.get('phone')
            name = request.data.get('name')
            
            # Check if patient already exists
            existing_patient = None
            
            # Priority 1: Search by patient_id if provided
            if patient_id:
                existing_patient = Patient.objects.filter(patient_id=patient_id).first()
            
            # Priority 2: Search by name + phone number if patient_id not found
            if not existing_patient and phone and name:
                existing_patient = Patient.objects.filter(phone=phone, name=name).first()
        
        except Exception as e:
            print(f"Error checking for existing patient: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Failed to check patient records',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if existing_patient:
            # Archive current visit to history before updating
            from .models import VisitHistory
            if existing_patient.visit_time:  # Only archive if there was a previous visit
                try:
                    VisitHistory.objects.create(
                        patient=existing_patient,
                        visit_time=existing_patient.visit_time,
                        reason=existing_patient.reason or '',
                        status=existing_patient.status or 'waiting',
                        health_status=existing_patient.health_status or 'unknown',
                        notes=existing_patient.notes or '',
                        next_visit_date=existing_patient.next_visit_date
                    )
                except Exception as e:
                    # Log error but don't fail registration
                    print(f"Warning: Could not archive visit history: {str(e)}")
            
            # Patient is returning - update visit information
            # Note: name and phone are used to identify patient, so they don't change
            try:
                # Handle age - only update if valid
                age = request.data.get('age')
                if age is not None:
                    if isinstance(age, str):
                        age = age.strip()
                    if age and age != '':
                        try:
                            existing_patient.age = int(age)
                        except (ValueError, TypeError):
                            pass  # Keep existing age if conversion fails
                
                # Update other fields
                gender = request.data.get('gender')
                if gender:
                    existing_patient.gender = gender
                
                address = request.data.get('address')
                if address:
                    existing_patient.address = address
                
                existing_patient.reason = request.data.get('reason', '')
                existing_patient.status = 'waiting'  # Reset status for new visit
                existing_patient.notes = ''  # Clear previous visit notes
                existing_patient.visit_time = timezone.now()  # New visit time
            except Exception as e:
                print(f"Error updating patient fields: {str(e)}")
                import traceback
                traceback.print_exc()
            
            # Create user account if credentials provided and patient doesn't have one
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            
            if username and email and password and not existing_patient.user:
                from .models import CustomUser
                from .auth_serializers import UserRegistrationSerializer
                from django.db import transaction
                
                name_parts = existing_patient.name.split(' ', 1)
                first_name = name_parts[0] if len(name_parts) > 0 else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                user_data = {
                    'username': username,
                    'email': email,
                    'password': password,
                    'password_confirm': password,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': 'PATIENT'
                }
                
                try:
                    with transaction.atomic():
                        user_serializer = UserRegistrationSerializer(data=user_data)
                        if user_serializer.is_valid():
                            existing_patient.user = user_serializer.save()
                        # Silently ignore user creation errors for returning patients
                except Exception:
                    pass  # Patient can still check in without portal access
            
            try:
                existing_patient.save()
            except Exception as e:
                print(f"Error saving existing patient: {str(e)}")
                import traceback
                traceback.print_exc()
                return Response({
                    'error': 'Failed to save patient data',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Ensure prescription exists
            if not hasattr(existing_patient, 'prescription'):
                Prescription.objects.create(patient=existing_patient)
            
            serializer = PatientDetailSerializer(existing_patient)
            return Response({
                'message': 'Returning patient checked in successfully',
                'patient': serializer.data,
                'patient_id': existing_patient.patient_id,  # Display patient_id
                'is_returning': True,
                'username': existing_patient.user.username if existing_patient.user else None
            }, status=status.HTTP_200_OK)
        
        # New patient - proceed with creation
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if user account credentials are provided
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = None
        if username and email and password:
            # Create user account for patient portal access
            from .models import CustomUser
            from .auth_serializers import UserRegistrationSerializer
            from django.db import transaction
            
            # Extract name parts from patient name
            name_parts = request.data.get('name', '').split(' ', 1)
            first_name = name_parts[0] if len(name_parts) > 0 else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            user_data = {
                'username': username,
                'email': email,
                'password': password,
                'password_confirm': password,  # Same as password
                'first_name': first_name,
                'last_name': last_name,
                'role': 'PATIENT'
            }
            
            try:
                with transaction.atomic():
                    user_serializer = UserRegistrationSerializer(data=user_data)
                    if user_serializer.is_valid():
                        user = user_serializer.save()
                    else:
                        return Response(
                            {'error': 'User creation failed', 'details': user_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            except Exception as e:
                return Response(
                    {'error': f'User account creation failed: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Save patient with optional user link
        patient = serializer.save(user=user)
        
        # Set consent timestamp
        patient.consent_timestamp = timezone.now()
        patient.save()
        
        # Log consent for audit trail
        log_consent(patient, request, action='CONSENT_GRANTED')
        
        # Automatically create an empty prescription for this patient
        Prescription.objects.create(patient=patient)
        
        # Return the full patient detail with patient_id prominently shown
        detail_serializer = PatientDetailSerializer(patient)
        return Response({
            'message': 'New patient registered successfully',
            'patient': detail_serializer.data,
            'patient_id': patient.patient_id,  # Prominently display patient_id
            'is_returning': False,
            'username': patient.user.username if patient.user else None
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """
        Update patient. Supports partial updates.
        """
        partial = kwargs.pop('partial', True)  # Allow partial updates by default
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full detail view
        detail_serializer = PatientDetailSerializer(instance)
        return Response(detail_serializer.data)
    
    @action(detail=True, methods=['post'])
    def assess_health(self, request, pk=None):
        """
        Manually trigger health status assessment based on latest measurements.
        
        POST /api/patients/<id>/assess_health/
        """
        patient = self.get_object()
        patient.assess_health_status()
        
        serializer = PatientDetailSerializer(patient)
        return Response({
            'message': 'Health assessment completed',
            'patient': serializer.data
        })
    
    @action(detail=True, methods=['get', 'put'], url_path='prescription')
    def prescription(self, request, pk=None):
        """
        Get or update patient's prescription.
        
        GET /api/patients/<id>/prescription/
        Returns: { "medicines": [...] }
        
        PUT /api/patients/<id>/prescription/
        Body: { "medicines": [ { name, dose, type, quantity }, ... ] }
        """
        patient = self.get_object()
        
        # Get or create prescription
        prescription, created = Prescription.objects.get_or_create(
            patient=patient,
            defaults={'medicines': []}
        )
        
        if request.method == 'GET':
            serializer = PrescriptionSerializer(prescription)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            # Archive current prescription to history before updating
            if prescription.medicines:  # Only archive if there are existing medicines
                from prescriptions.models import PrescriptionHistory
                PrescriptionHistory.objects.create(
                    patient=patient,
                    medicines=prescription.medicines,
                    visit_date=patient.visit_time
                )
            
            serializer = PrescriptionSerializer(prescription, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='prescription-history')
    def prescription_history(self, request, pk=None):
        """
        Get patient's prescription history for comparison with past visits.
        
        GET /api/patients/<id>/prescription-history/
        Returns: [ { "id": 1, "medicines": [...], "created_at": "...", "visit_date": "..." }, ... ]
        """
        from prescriptions.models import PrescriptionHistory
        from prescriptions.serializers import PrescriptionHistorySerializer
        
        patient = self.get_object()
        history = PrescriptionHistory.objects.filter(patient=patient)
        serializer = PrescriptionHistorySerializer(history, many=True)
        return Response(serializer.data)
