from django.db import models


class Patient(models.Model):
    """
    Patient model representing a clinic/hospital patient.
    
    The patient goes through several states during their visit:
    - waiting: Registered and waiting in queue
    - checking: Currently at Health Monitoring Station
    - examined: Vitals recorded, ready for doctor
    - completed: Doctor has finished consultation
    """
    
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('checking', 'Checking'),
        ('examined', 'Examined'),
        ('completed', 'Completed'),
    ]
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    
    # Basic Demographics
    name = models.CharField(max_length=200)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Visit Information
    reason = models.TextField(blank=True, null=True, help_text="Reason for visit")
    visit_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    
    # Doctor's Section
    notes = models.TextField(blank=True, null=True, help_text="Doctor's notes")
    next_visit_date = models.DateField(blank=True, null=True)
    
    class Meta:
        ordering = ['visit_time']
    
    def __str__(self):
        return f"{self.name} ({self.age}, {self.gender}) - {self.status}"
