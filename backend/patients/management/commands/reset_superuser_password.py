"""
Django management command to reset superuser password from environment variables.

Usage:
    python manage.py reset_superuser_password

Environment Variables:
    DJANGO_SUPERUSER_USERNAME (default: admin)
    DJANGO_SUPERUSER_PASSWORD (required)

This command will update the password for an existing superuser.
"""

import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Resets the superuser password from environment variables'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from environment variables
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        
        # Validate password
        if not password:
            self.stdout.write(
                self.style.ERROR(
                    'DJANGO_SUPERUSER_PASSWORD environment variable is not set. '
                    'Cannot reset password without a password.'
                )
            )
            return
        
        # Check if superuser exists
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Superuser "{username}" does not exist.')
            )
            self.stdout.write(
                self.style.WARNING('Run "python manage.py create_default_superuser" first.')
            )
            return
        
        # Update password
        try:
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully reset password for superuser "{username}"'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error resetting password: {str(e)}')
            )

