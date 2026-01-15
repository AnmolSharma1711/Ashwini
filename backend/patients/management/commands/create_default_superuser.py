"""
Django management command to create a superuser from environment variables.

Usage:
    python manage.py create_default_superuser

Environment Variables:
    DJANGO_SUPERUSER_USERNAME (default: admin)
    DJANGO_SUPERUSER_EMAIL (default: admin@ashwini.com)
    DJANGO_SUPERUSER_PASSWORD (required for production)

This command is idempotent - it won't create duplicate users.
"""

import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Creates a superuser from environment variables if one does not exist'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from environment variables
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@ashwini.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        
        # Check if superuser already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser "{username}" already exists. Skipping creation.')
            )
            return
        
        # Validate password
        if not password:
            self.stdout.write(
                self.style.ERROR(
                    'DJANGO_SUPERUSER_PASSWORD environment variable is not set. '
                    'Cannot create superuser in production without a password.'
                )
            )
            return
        
        # Create superuser
        try:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created superuser "{username}" with email "{email}"'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )
