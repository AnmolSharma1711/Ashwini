"""
Django settings for ashwini_backend project.

Generated for Project Ashwini - IoT-ready health tracking system.
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables from .env file
load_dotenv()

# Import cloudinary if available
try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
except ImportError:
    cloudinary = None

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY is required - must be set in environment variables
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY environment variable is required. "
        "Set it in your .env file or environment."
    )

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Hosts: comma-separated list from env or default to allow all for quick deploys
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# Custom User Model
AUTH_USER_MODEL = 'patients.CustomUser'


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'cloudinary_storage',
    'cloudinary',
    
    # Project apps
    'patients',
    'prescriptions',
    'measurements',
    'devices',
    'reports',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ashwini_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ashwini_backend.wsgi.application'


# Database
# Use DATABASE_URL (Heroku/Render style) if provided, otherwise default to SQLite for dev
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    # Development: SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Use WhiteNoise for static file serving in production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files (User uploads)
# In production, use Cloudinary for persistent storage
if not DEBUG and os.getenv('CLOUDINARY_CLOUD_NAME') and cloudinary:
    # Cloudinary Configuration
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
        'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
        'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
    }
    
    # Initialize cloudinary
    if cloudinary:
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET'),
            secure=True
        )
    
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    MEDIA_URL = '/media/'  # Cloudinary will handle the actual URL
else:
    # Local filesystem for development
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'
    # Ensure media directories exist in development
    os.makedirs(MEDIA_ROOT / 'reports', exist_ok=True)

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    # Note: We don't set DEFAULT_PERMISSION_CLASSES globally
    # Instead, we apply permissions per-view or per-viewset
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}


# CORS Configuration - Allow React frontends to communicate
# In production: MUST set CORS_ALLOWED_ORIGINS environment variable
# In development: Localhost URLs are automatically allowed when DEBUG=True

CORS_ALLOWED_ORIGINS_ENV = os.environ.get('CORS_ALLOWED_ORIGINS')

if CORS_ALLOWED_ORIGINS_ENV:
    # Production: Use environment variable (comma-separated URLs)
    CORS_ALLOWED_ORIGINS = [url.strip() for url in CORS_ALLOWED_ORIGINS_ENV.split(',') if url.strip()]
elif DEBUG:
    # Development only: Allow localhost URLs
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",  # Doctor's Portal (frontend-unified)
        "http://localhost:3001",  # Development alternate port
        "http://localhost:3002",  # Patient Portal (frontend-patient)
        "http://localhost:3003",  # Patient Portal alternate port
        "http://localhost:3004",  # Patient Portal alternate port 2
        "http://localhost:4000",  # Registration Portal (frontend-main)
        "http://localhost:4001",  # Registration Portal alternate port
        "http://localhost:5173",  # Vite default port (patient portal)
    ]
else:
    # Production without CORS_ALLOWED_ORIGINS set: Empty list (secure default)
    CORS_ALLOWED_ORIGINS = []
    print("WARNING: CORS_ALLOWED_ORIGINS not set in production! Set this environment variable.")

# SECURITY NOTE: CORS_ALLOW_ALL_ORIGINS is set to True for Android mobile app compatibility
# Mobile apps (Capacitor/React Native) require this setting as they don't send proper CORS headers
# This is required for the frontend-patient-mobile Android application to connect to the backend
# For web-only deployments, set CORS_ALLOW_ALL_ORIGINS=False and use CORS_ALLOWED_ORIGINS instead
CORS_ALLOW_ALL_ORIGINS = True

# Allow credentials for JWT authentication
CORS_ALLOW_CREDENTIALS = True

# Allow necessary headers for authentication and portal identification
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-portal-source',  # Custom header for portal identification
]
