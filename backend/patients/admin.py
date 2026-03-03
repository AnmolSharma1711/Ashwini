from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Patient


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
