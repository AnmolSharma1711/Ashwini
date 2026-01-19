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
