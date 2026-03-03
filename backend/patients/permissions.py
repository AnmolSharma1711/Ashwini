from rest_framework import permissions


class IsPortalAuthorized(permissions.BasePermission):
    """
    Custom permission to check if user's role matches the portal they're accessing.
    
    This checks the Origin or X-Portal-Source header to determine which frontend
    is making the request, then verifies the user's role is authorized for that portal.
    
    Portal Authorization Rules:
    - ADMIN: Can access BOTH portals
    - DOCTOR: Can ONLY access frontend-unified
    - NURSE/RECEPTION: Can ONLY access frontend-main
    - PATIENT: No portal access (default deny)
    """
    
    message = "Your role is not authorized to access this portal."
    
    # Define which origins correspond to which portal
    MAIN_PORTAL_ORIGINS = [
        'http://localhost:4000',
        'https://frontend-main.vercel.app',
        # Add other main portal URLs as needed
    ]
    
    UNIFIED_PORTAL_ORIGINS = [
        'http://localhost:3000',
        'https://frontend-unified.vercel.app',
        # Add other unified portal URLs as needed
    ]
    
    def has_permission(self, request, view):
        """
        Check if the authenticated user's role is authorized for the requesting portal.
        """
        # Allow unauthenticated access to login/register endpoints
        if not request.user or not request.user.is_authenticated:
            return True
        
        # Get the origin from the request headers
        origin = request.META.get('HTTP_ORIGIN', '')
        portal_source = request.META.get('HTTP_X_PORTAL_SOURCE', '')
        
        user = request.user
        role = getattr(user, 'role', None)
        
        # ADMIN can access everything
        if role == 'ADMIN':
            return True
        
        # Determine which portal is making the request
        is_main_portal = origin in self.MAIN_PORTAL_ORIGINS or portal_source == 'frontend-main'
        is_unified_portal = origin in self.UNIFIED_PORTAL_ORIGINS or portal_source == 'frontend-unified'
        
        # DOCTOR can only access unified portal
        if role == 'DOCTOR':
            if is_unified_portal:
                return True
            if is_main_portal:
                self.message = "Doctors can only access the Doctor's portal (frontend-unified)."
                return False
        
        # NURSE and RECEPTION can only access main portal
        if role in ['NURSE', 'RECEPTION']:
            if is_main_portal:
                return True
            if is_unified_portal:
                self.message = f"{role.title()}s can only access the Registration portal (frontend-main)."
                return False
        
        # PATIENT or unknown role - deny access
        self.message = "You do not have permission to access this portal."
        return False


class IsAdminUser(permissions.BasePermission):
    """
    Permission class that only allows ADMIN role users.
    """
    
    message = "Only administrators can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'ADMIN'
        )


class IsDoctorOrAdmin(permissions.BasePermission):
    """
    Permission class that allows DOCTOR or ADMIN roles.
    """
    
    message = "Only doctors or administrators can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) in ['DOCTOR', 'ADMIN']
        )


class IsNurseReceptionOrAdmin(permissions.BasePermission):
    """
    Permission class that allows NURSE, RECEPTION, or ADMIN roles.
    """
    
    message = "Only nurses, reception staff, or administrators can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) in ['NURSE', 'RECEPTION', 'ADMIN']
        )
