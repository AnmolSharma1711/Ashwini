from django.contrib import admin
from .models import Report


class ReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'uploaded_at', 'analysis_status', 'confidence_score']
    list_filter = ['analysis_status', 'uploaded_at']
    search_fields = ['patient__name', 'extracted_text']
    readonly_fields = ['uploaded_at', 'analysis_status', 'extracted_text', 'key_phrases', 'confidence_score']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('patient', 'report_image', 'uploaded_by', 'uploaded_at')
        }),
        ('Analysis Results', {
            'fields': ('analysis_status', 'extracted_text', 'key_phrases', 'confidence_score', 'error_message')
        }),
        ('Doctor Review', {
            'fields': ('doctor_notes',)
        }),
    )


admin.site.register(Report, ReportAdmin)
