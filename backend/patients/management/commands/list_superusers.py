"""
Django management command to list all superusers in the database.

Usage:
    python manage.py list_superusers

This helps debug authentication issues.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Lists all superusers in the database'

    def handle(self, *args, **options):
        User = get_user_model()
        
        superusers = User.objects.filter(is_superuser=True)
        
        if not superusers.exists():
            self.stdout.write(self.style.WARNING('No superusers found in database.'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'Found {superusers.count()} superuser(s):'))
        self.stdout.write('')
        
        for user in superusers:
            self.stdout.write(f'  Username: {user.username}')
            self.stdout.write(f'  Email: {user.email}')
            self.stdout.write(f'  Is Staff: {user.is_staff}')
            self.stdout.write(f'  Is Active: {user.is_active}')
            self.stdout.write(f'  Last Login: {user.last_login or "Never"}')
            self.stdout.write('')
