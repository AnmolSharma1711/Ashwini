"""
Entry point for Render deployment
This file runs the Django application using gunicorn and binds to the PORT provided by Render
"""
import os
import sys
from gunicorn.app.base import BaseApplication

class DjangoApplication(BaseApplication):
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        config = {key: value for key, value in self.options.items()
                  if key in self.cfg.settings and value is not None}
        for key, value in config.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application

if __name__ == '__main__':
    # Get PORT from environment variable (Render provides this)
    port = os.environ.get('PORT', '8000')
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ashwini_backend.settings')
    
    try:
        from django.core.wsgi import get_wsgi_application
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Run database migrations before starting the server
    print("Running database migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate', '--no-input'])
        print("✓ Database migrations completed successfully")
    except Exception as e:
        print(f"⚠ Warning: Migration failed: {e}")
        print("Continuing to start server...")
    
    # Create default superuser if configured
    print("\n=== Superuser Configuration ===")
    superuser_username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
    superuser_email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@ashwini.com')
    superuser_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
    
    print(f"Username: {superuser_username}")
    print(f"Email: {superuser_email}")
    print(f"Password set: {'Yes' if superuser_password else 'No'}")
    
    if not superuser_password:
        print("⚠ WARNING: DJANGO_SUPERUSER_PASSWORD not set! Skipping superuser creation.")
        print("Please set this environment variable in Render dashboard.")
    else:
        try:
            print("Running superuser creation/update command...")
            sys.stdout.flush()
            execute_from_command_line(['manage.py', 'create_default_superuser'])
            print("✓ Default superuser check completed")
        except Exception as e:
            print(f"⚠ Superuser creation error: {e}")
            import traceback
            traceback.print_exc()
    print("==============================\n")
    
    application = get_wsgi_application()
    
    # Gunicorn configuration
    options = {
        'bind': f'0.0.0.0:{port}',
        'workers': 2,
        'worker_class': 'sync',
        'timeout': 120,
        'accesslog': '-',
        'errorlog': '-',
        'loglevel': 'info',
    }
    
    print(f"Starting Django application on 0.0.0.0:{port}")
    DjangoApplication(application, options).run()
