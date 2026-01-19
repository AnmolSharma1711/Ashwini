from django.db import models
from patients.models import Patient
import json


class Report(models.Model):
    """
    Report model for storing medical report images and their analysis.
    
    Integrates with Azure Document Intelligence API to:
    - Extract text from uploaded medical report images (OCR)
    - Analyze and extract key phrases
    - Store analysis results for doctor's review
    """
    
    ANALYSIS_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    
    # File upload - accepts both images and PDFs
    report_image = models.FileField(
        upload_to='reports/%Y/%m/%d/',
        help_text="Medical report (jpg, png, pdf)"
    )
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.CharField(
        max_length=100,
        default='system',
        help_text="User who uploaded the report"
    )
    
    # Analysis status
    analysis_status = models.CharField(
        max_length=20,
        choices=ANALYSIS_STATUS_CHOICES,
        default='pending'
    )
    
    # Extracted content
    extracted_text = models.TextField(
        blank=True,
        null=True,
        help_text="Full text extracted from the report using OCR"
    )
    
    # Key phrases (stored as JSON array)
    key_phrases = models.JSONField(
        blank=True,
        null=True,
        help_text="Key medical phrases extracted from the report"
    )
    
    # Analysis metadata
    confidence_score = models.FloatField(
        blank=True,
        null=True,
        help_text="Overall confidence score of the OCR analysis"
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        help_text="Error message if analysis failed"
    )
    
    # Notes from doctor
    doctor_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Doctor's notes about this report"
    )
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Report for {self.patient.name} - {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_key_phrases_list(self):
        """Helper method to get key phrases as a Python list"""
        if isinstance(self.key_phrases, list):
            return self.key_phrases
        elif isinstance(self.key_phrases, str):
            try:
                return json.loads(self.key_phrases)
            except:
                return []
        return []
