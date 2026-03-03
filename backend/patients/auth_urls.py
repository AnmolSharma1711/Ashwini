from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import (
    login_view,
    register_view,
    current_user_view,
    logout_view,
    verify_portal_access
)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('auth/me/', current_user_view, name='current-user'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/verify-portal/', verify_portal_access, name='verify-portal'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
