from django.contrib import admin
from .models import Prescription


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'get_medicine_count']
    search_fields = ['patient__name']
    
    def get_medicine_count(self, obj):
        return len(obj.medicines) if obj.medicines else 0
    get_medicine_count.short_description = 'Number of Medicines'
