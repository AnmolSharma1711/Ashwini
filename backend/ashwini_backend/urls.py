"""
URL configuration for ashwini_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for deployment platforms"""
    return JsonResponse({'status': 'healthy', 'service': 'ashwini-backend'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/', include('patients.auth_urls')),  # Authentication endpoints
    path('api/', include('patients.urls')),
    path('api/', include('measurements.urls')),
    path('api/', include('devices.urls')),
    path('api/', include('reports.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
