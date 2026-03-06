from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .auth_serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    LoginResponseSerializer
)

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login endpoint.
    
    POST /api/auth/login/
    
    Request Body:
    {
        "username": "string",  // Can be username OR patient_id for patients
        "password": "string"
    }
    
    For patients: Use patient_id (e.g., "PAT0001") as username
    For staff: Use regular username
    
    Response:
    {
        "access": "jwt_access_token",
        "refresh": "jwt_refresh_token",
        "user": {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "role": "DOCTOR"
        }
    }
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = None
    if username.upper().startswith('PAT'):
        from .models import Patient
        try:
            patient = Patient.objects.filter(patient_id=username.upper()).first()
            if patient and patient.user:
                user = authenticate(username=patient.user.username, password=password)
        except Exception as e:
            print(f"Error finding patient by patient_id: {str(e)}")
        if user is None:
            return Response(
                {'error': 'Invalid Patient ID or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    else:
        # Try normal username authentication for staff/main/unified portals
        user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return Response(
            {'error': 'User account is disabled'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    # Prepare response data
    response_data = {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    }
    
    # Add patient_id if user is a patient
    if user.role == 'PATIENT':
        try:
            patient_id = user.patient_profile.patient_id
            response_data['patient_id'] = patient_id
        except:
            pass
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    User registration endpoint.
    
    POST /api/auth/register/
    
    Request Body:
    {
        "username": "string",
        "email": "string",
        "password": "string",
        "password_confirm": "string",
        "first_name": "string",
        "last_name": "string",
        "role": "DOCTOR|NURSE|RECEPTION|PATIENT"
    }
    
    Response:
    {
        "access": "jwt_access_token",
        "refresh": "jwt_refresh_token",
        "user": {...}
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get current authenticated user information.
    
    GET /api/auth/me/
    
    Response:
    {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "DOCTOR"
    }
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint (blacklist refresh token).
    
    POST /api/auth/logout/
    
    Request Body:
    {
        "refresh": "jwt_refresh_token"
    }
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': 'Invalid token'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_portal_access(request):
    """
    Verify if user's role can access a specific portal.
    
    POST /api/auth/verify-portal/
    
    Request Body:
    {
        "portal": "main" | "unified"
    }
    
    Response:
    {
        "authorized": true|false,
        "role": "DOCTOR",
        "message": "Access granted" | "Access denied"
    }
    """
    if not request.user or not request.user.is_authenticated:
        return Response(
            {'authorized': False, 'message': 'Not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    portal = request.data.get('portal', '').lower()
    user = request.user
    role = getattr(user, 'role', None)
    
    authorized = False
    message = 'Access denied'
    
    if role == 'ADMIN':
        authorized = True
        message = 'Admins have access to all portals'
    elif portal == 'main' and role in ['NURSE', 'RECEPTION']:
        authorized = True
        message = 'Access granted to Registration portal'
    elif portal == 'unified' and role == 'DOCTOR':
        authorized = True
        message = 'Access granted to Doctor portal'
    else:
        if portal == 'main':
            message = 'You do not have access to the Registration portal'
        elif portal == 'unified':
            message = 'You do not have access to the Doctor portal'
    
    return Response({
        'authorized': authorized,
        'role': role,
        'message': message
    }, status=status.HTTP_200_OK)
