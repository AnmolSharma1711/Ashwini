from django.contrib import admin
from .models import Device, MeasurementSession


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ['device_id', 'name', 'is_active', 'last_seen']
    list_filter = ['is_active']
    search_fields = ['device_id', 'name']
    ordering = ['name']


@admin.register(MeasurementSession)
class MeasurementSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'device', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['patient__name', 'device__name']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'updated_at']
