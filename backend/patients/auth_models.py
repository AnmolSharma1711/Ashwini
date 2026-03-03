from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom User model with role-based access control.
    
    Roles:
    - ADMIN: Full access to both portals
    - DOCTOR: Access only to frontend-unified (Doctor's portal)
    - NURSE: Access only to frontend-main (Registration/Health Monitoring)
    - RECEPTION: Access only to frontend-main (Registration/Health Monitoring)
    - PATIENT: Limited access (future use)
    """
    
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('NURSE', 'Nurse'),
        ('RECEPTION', 'Reception'),
        ('PATIENT', 'Patient'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='PATIENT',
        help_text="User's role determines portal access"
    )
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def can_access_main_portal(self):
        """Check if user can access frontend-main (Registration/Nurses portal)"""
        return self.role in ['ADMIN', 'NURSE', 'RECEPTION']
    
    def can_access_unified_portal(self):
        """Check if user can access frontend-unified (Doctor's portal)"""
        return self.role in ['ADMIN', 'DOCTOR']
