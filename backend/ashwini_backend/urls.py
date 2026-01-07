"""
URL configuration for ashwini_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('patients.urls')),
    path('api/', include('measurements.urls')),
    path('api/', include('devices.urls')),
]
