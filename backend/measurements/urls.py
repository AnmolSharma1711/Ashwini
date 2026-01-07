from django.urls import path
from . import views

urlpatterns = [
    path('patients/<int:patient_id>/measurements/latest/', views.patient_measurements_latest, name='patient-measurements-latest'),
    path('patients/<int:patient_id>/measurements/', views.patient_measurements_list, name='patient-measurements'),
]
