from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Patient
from .serializers import (
    PatientListSerializer,
    PatientDetailSerializer,
    PatientCreateUpdateSerializer
)
from prescriptions.models import Prescription
from prescriptions.serializers import PrescriptionSerializer


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
    
    def create(self, request, *args, **kwargs):
        """
        Create a new patient and automatically create an empty prescription.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        
        # Automatically create an empty prescription for this patient
        Prescription.objects.create(patient=patient)
        
        # Return the full patient detail
        detail_serializer = PatientDetailSerializer(patient)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    
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
            serializer = PrescriptionSerializer(prescription, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
