from django.contrib import admin
from .models import Patient


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
