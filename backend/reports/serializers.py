from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report model"""
    
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    key_phrases_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'patient', 'patient_name', 'report_image',
            'uploaded_at', 'uploaded_by', 'analysis_status',
            'extracted_text', 'key_phrases', 'key_phrases_list',
            'confidence_score', 'error_message', 'doctor_notes'
        ]
        read_only_fields = ['id', 'uploaded_at', 'analysis_status', 
                          'extracted_text', 'key_phrases', 'confidence_score',
                          'error_message']
    
    def get_key_phrases_list(self, obj):
        """Return key phrases as a list"""
        return obj.get_key_phrases_list()


class ReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reports"""
    
    class Meta:
        model = Report
        fields = ['patient', 'report_image', 'uploaded_by']
    
    def validate_report_image(self, value):
        """Validate that the uploaded file is an image or PDF"""
        # Get file extension
        ext = value.name.lower().split('.')[-1] if '.' in value.name else ''
        
        # Allowed extensions
        allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf']
        
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file type '.{ext}'. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size too large. Maximum allowed: 10MB. Your file: {value.size / (1024*1024):.2f}MB"
            )
        
        return value


class ReportAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for report analysis results"""
    
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    key_phrases_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'patient', 'patient_name', 'uploaded_at',
            'analysis_status', 'extracted_text', 'key_phrases_list',
            'confidence_score', 'doctor_notes'
        ]
    
    def get_key_phrases_list(self, obj):
        """Return key phrases as a list"""
        return obj.get_key_phrases_list()
