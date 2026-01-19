from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import os
import logging

from .models import Report
from .serializers import ReportSerializer, ReportCreateSerializer, ReportAnalysisSerializer
from .services import get_document_intelligence_service
from patients.models import Patient

logger = logging.getLogger(__name__)


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Report model.
    
    Endpoints:
    - GET /api/reports/ - List all reports
    - POST /api/reports/ - Upload a new report (triggers analysis)
    - GET /api/reports/{id}/ - Get specific report details
    - PATCH /api/reports/{id}/ - Update report (e.g., doctor notes)
    - DELETE /api/reports/{id}/ - Delete report
    """
    
    queryset = Report.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        return ReportSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Upload and analyze a report.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Save the report
        report = serializer.save(analysis_status='pending')
        
        # Trigger analysis asynchronously
        # In production, consider using Celery or similar task queue
        try:
            self._analyze_report(report)
        except Exception as e:
            logger.error(f"Error analyzing report {report.id}: {str(e)}")
            report.analysis_status = 'failed'
            report.error_message = str(e)
            report.save()
        
        # Return the report with updated status
        report.refresh_from_db()
        output_serializer = ReportSerializer(report)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    def _analyze_report(self, report):
        """Analyze the report using Azure Document Intelligence"""
        report.analysis_status = 'processing'
        report.save()
        
        # Get the service
        service = get_document_intelligence_service()
        
        if not service.is_configured():
            report.analysis_status = 'failed'
            report.error_message = "Azure Document Intelligence is not configured. Please set the required environment variables."
            report.save()
            return
        
        # Get the file path
        file_path = report.report_image.path
        
        # Analyze the document
        result = service.analyze_document(file_path)
        
        if result['success']:
            report.extracted_text = result['extracted_text']
            report.key_phrases = result['key_phrases']
            report.confidence_score = result['confidence_score']
            report.analysis_status = 'completed'
            report.error_message = None
        else:
            report.analysis_status = 'failed'
            report.error_message = result.get('error', 'Unknown error occurred')
        
        report.save()
    
    @action(detail=True, methods=['post'])
    def reanalyze(self, request, pk=None):
        """
        Re-analyze an existing report.
        """
        report = self.get_object()
        
        try:
            self._analyze_report(report)
            report.refresh_from_db()
            serializer = ReportSerializer(report)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET', 'POST'])
def patient_reports_list(request, patient_id):
    """
    Get all reports for a patient or create a new one.
    
    GET /api/patients/<patient_id>/reports/
    Returns a list of all reports for the patient.
    
    POST /api/patients/<patient_id>/reports/
    Upload a new report for the patient.
    Body: multipart/form-data with 'report_image' file
    """
    patient = get_object_or_404(Patient, id=patient_id)
    
    if request.method == 'GET':
        reports = patient.reports.all()
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create report for this patient
        data = request.data.copy()
        data['patient'] = patient.id
        
        if 'uploaded_by' not in data:
            data['uploaded_by'] = 'system'
        
        serializer = ReportCreateSerializer(data=data)
        if serializer.is_valid():
            report = serializer.save(analysis_status='pending')
            
            # Trigger analysis
            try:
                viewset = ReportViewSet()
                viewset._analyze_report(report)
            except Exception as e:
                logger.error(f"Error analyzing report {report.id}: {str(e)}")
                report.analysis_status = 'failed'
                report.error_message = str(e)
                report.save()
            
            report.refresh_from_db()
            output_serializer = ReportSerializer(report)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def patient_reports_latest(request, patient_id):
    """
    Get the latest report for a patient.
    
    GET /api/patients/<patient_id>/reports/latest/
    """
    patient = get_object_or_404(Patient, id=patient_id)
    latest = patient.reports.first()  # Already ordered by -uploaded_at
    
    if latest:
        serializer = ReportSerializer(latest)
        return Response(serializer.data)
    else:
        return Response(None, status=status.HTTP_200_OK)


@api_view(['GET'])
def report_analysis(request, report_id):
    """
    Get analysis results for a specific report.
    
    GET /api/reports/<report_id>/analysis/
    """
    report = get_object_or_404(Report, id=report_id)
    serializer = ReportAnalysisSerializer(report)
    return Response(serializer.data)
