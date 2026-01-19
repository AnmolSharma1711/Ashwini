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
        
        # Get the file URL (works with both local storage and Cloudinary)
        file_url = report.report_image.url
        
        # Analyze the document
        result = service.analyze_document(file_url)
        
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
        try:
            # For file uploads, use request.FILES instead of request.data
            report_image = request.FILES.get('report_image')
            uploaded_by = request.data.get('uploaded_by', 'system')
            
            logger.info(f"=== Report Upload Debug ===")
            logger.info(f"request.FILES keys: {list(request.FILES.keys())}")
            logger.info(f"request.data keys: {list(request.data.keys())}")
            
            if not report_image:
                logger.error("No report image in request.FILES")
                return Response(
                    {'error': 'No report image provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"File name: {report_image.name}")
            logger.info(f"File size: {report_image.size} bytes")
            logger.info(f"Content type: {report_image.content_type}")
            
            # Try to validate if it's an image using Pillow
            try:
                from PIL import Image
                report_image.seek(0)
                img = Image.open(report_image)
                logger.info(f"Image format: {img.format}, Size: {img.size}, Mode: {img.mode}")
                report_image.seek(0)  # Reset for Django to use
            except Exception as img_error:
                logger.error(f"Pillow image validation failed: {img_error}")
            
            data = {
                'patient': patient.id,
                'report_image': report_image,
                'uploaded_by': uploaded_by
            }
            
            # Read file data for Azure analysis BEFORE saving to Cloudinary
            # This avoids URL access issues with Cloudinary
            report_image.seek(0)
            file_data = report_image.read()
            report_image.seek(0)  # Reset for saving
            
            serializer = ReportCreateSerializer(data=data)
            if serializer.is_valid():
                logger.info("Serializer valid, attempting to save...")
                report = serializer.save(analysis_status='pending')
                logger.info(f"Report saved successfully with ID: {report.id}")
                
                # Trigger analysis using the file data we already read
                try:
                    service = get_document_intelligence_service()
                    if service.is_configured():
                        report.analysis_status = 'processing'
                        report.save()
                        
                        # Analyze from bytes directly - no Cloudinary URL needed!
                        result = service.analyze_document_from_bytes(file_data)
                        
                        if result['success']:
                            report.extracted_text = result['extracted_text']
                            report.key_phrases = result['key_phrases']
                            report.confidence_score = result['confidence_score']
                            report.analysis_status = 'completed'
                            report.error_message = None
                        else:
                            report.analysis_status = 'failed'
                            report.error_message = result.get('error', 'Unknown error')
                        report.save()
                    else:
                        report.analysis_status = 'failed'
                        report.error_message = "Azure Document Intelligence is not configured"
                        report.save()
                except Exception as e:
                    logger.error(f"Error analyzing report {report.id}: {str(e)}")
                    report.analysis_status = 'failed'
                    report.error_message = str(e)
                    report.save()
                
                report.refresh_from_db()
                output_serializer = ReportSerializer(report)
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            
            logger.error(f"Serializer validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error uploading report: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to upload report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
