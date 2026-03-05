"""
URL Configuration for Patient Portal APIs
"""

from django.urls import path
from .patient_portal_views import (
    patient_register_view,
    patient_profile_view,
    patient_measurements_view,
    patient_prescription_view,
    patient_prescription_history_view,
    patient_visits_view
)

urlpatterns = [
    # Patient registration (public)
    path('register/', patient_register_view, name='patient-register'),
    
    # Patient portal endpoints (authenticated patients only)
    path('profile/', patient_profile_view, name='patient-profile'),
    path('measurements/', patient_measurements_view, name='patient-measurements'),
    path('prescription/', patient_prescription_view, name='patient-prescription'),
    path('prescription-history/', patient_prescription_history_view, name='patient-prescription-history'),
    path('visits/', patient_visits_view, name='patient-visits'),
]
