from django.contrib import admin
from .models import Measurement


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'timestamp', 'blood_pressure', 'temperature', 'spo2', 'heart_rate', 'source']
    list_filter = ['source', 'timestamp']
    search_fields = ['patient__name']
    ordering = ['-timestamp']
    
    readonly_fields = ['timestamp']
