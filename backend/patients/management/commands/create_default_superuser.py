"""
Django management command to create or update a superuser from environment variables.

Usage:
    python manage.py create_default_superuser

Environment Variables:
    DJANGO_SUPERUSER_USERNAME (default: admin)
    DJANGO_SUPERUSER_EMAIL (default: admin@ashwini.com)
    DJANGO_SUPERUSER_PASSWORD (required for production)

This command is idempotent - if the user exists, it updates the password and email.
"""

import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Creates or updates a superuser from environment variables'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from environment variables
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@ashwini.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        
        self.stdout.write(f"Attempting superuser setup for: {username}")
        
        # Validate password
        if not password:
            self.stdout.write(
                self.style.ERROR(
                    'DJANGO_SUPERUSER_PASSWORD environment variable is not set. '
                    'Cannot create/update superuser in production without a password.'
                )
            )
            return
        
        self.stdout.write(f"Password length: {len(password)} characters")
        
        # Check if superuser already exists
        if User.objects.filter(username=username).exists():
            # Update existing superuser
            try:
                user = User.objects.get(username=username)
                self.stdout.write(f"Found existing user: {username}")
                user.email = email
                user.set_password(password)
                user.is_superuser = True
                user.is_staff = True
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Superuser "{username}" password updated successfully! Email: "{email}"'
                    )
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error updating superuser: {str(e)}')
                )
                import traceback
                self.stdout.write(traceback.format_exc())
            return
        
        # Create new superuser
        try:
            self.stdout.write(f"Creating new superuser: {username}")
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Successfully created superuser "{username}" with email "{email}"'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )
            import traceback
            self.stdout.write(traceback.format_exc())
