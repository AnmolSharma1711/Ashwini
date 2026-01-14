from django.urls import path
from . import views

urlpatterns = [
    # IoT Device Endpoints
    path('devices/<str:device_id>/command/', views.device_command, name='device-command'),
    path('devices/<str:device_id>/measurements/', views.device_measurements_create, name='device-measurements-create'),
    # Measurement Session Endpoints
    path('measurement-sessions/', views.create_measurement_session, name='create-measurement-session'),
]
