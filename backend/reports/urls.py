from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reports', views.ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
    path('patients/<int:patient_id>/reports/', views.patient_reports_list, name='patient-reports-list'),
    path('patients/<int:patient_id>/reports/latest/', views.patient_reports_latest, name='patient-reports-latest'),
    path('reports/<int:report_id>/analysis/', views.report_analysis, name='report-analysis'),
]
