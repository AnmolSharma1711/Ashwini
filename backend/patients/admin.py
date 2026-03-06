from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Patient, VisitHistory, ConsentLog


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Admin configuration for CustomUser model"""
    
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Role & Access', {
            'fields': ('role',)
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role & Access', {
            'fields': ('role',)
        }),
    )


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'age', 'gender', 'status', 'visit_time']
    list_filter = ['status', 'gender', 'visit_time']
    search_fields = ['name', 'phone']
    ordering = ['-visit_time']
    
    fieldsets = (
        ('Demographics', {
            'fields': ('name', 'age', 'gender', 'phone', 'address')
        }),
        ('Visit Information', {
            'fields': ('reason', 'visit_time', 'status')
        }),
        ('Doctor\'s Notes', {
            'fields': ('notes', 'next_visit_date')
        }),
    )
    
    readonly_fields = ['visit_time']


@admin.register(VisitHistory)
class VisitHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'visit_time', 'status', 'health_status', 'archived_at']
    list_filter = ['status', 'health_status', 'visit_time']
    search_fields = ['patient__name', 'reason', 'notes']
    ordering = ['-visit_time']
    readonly_fields = ['archived_at']


@admin.register(ConsentLog)
class ConsentLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'action', 'timestamp', 'consent_version', 'ip_address']
    list_filter = ['action', 'timestamp', 'consent_version']
    search_fields = ['patient__patient_id', 'patient__name', 'ip_address']
    ordering = ['-timestamp']
    readonly_fields = ['timestamp', 'ip_address', 'user_agent']
    
    fieldsets = (
        ('Patient Information', {
            'fields': ('patient', 'action', 'timestamp')
        }),
        ('Consent Details', {
            'fields': ('data_collection_consent', 'data_usage_consent', 'privacy_policy_acknowledged', 'consent_version')
        }),
        ('Audit Information', {
            'fields': ('ip_address', 'user_agent', 'notes')
        }),
    )
