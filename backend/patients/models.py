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
    
    # Health Status & Prioritization
    HEALTH_STATUS_CHOICES = [
        ('critical', 'Critical'),
        ('mild', 'Mild'),
        ('normal', 'Normal'),
        ('unknown', 'Unknown'),
    ]
    
    health_status = models.CharField(
        max_length=20, 
        choices=HEALTH_STATUS_CHOICES, 
        default='unknown',
        help_text="Auto-calculated based on latest measurements"
    )
    priority_score = models.IntegerField(
        default=0,
        help_text="Higher score = higher priority (0-100)"
    )
    last_assessment_time = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-priority_score', 'visit_time']
    
    def __str__(self):
        return f"{self.name} ({self.age}, {self.gender}) - {self.status}"
    
    def assess_health_status(self):
        """
        Auto-assess health status based on latest measurements.
        
        Classification Rules:
        - Critical: Temp >38°C or <35°C, HR >120 or <50 BPM
        - Mild: Temp 37.5-38°C or 35-36°C, HR 100-120 or 50-60 BPM
        - Normal: Temp 36-37.5°C, HR 60-100 BPM
        """
        from django.utils import timezone
        
        latest = self.measurements.first()  # Already ordered by -timestamp
        
        if not latest or not latest.temperature or not latest.heart_rate:
            self.health_status = 'unknown'
            self.priority_score = 0
            self.last_assessment_time = timezone.now()
            self.save()
            return
        
        temp = latest.temperature
        hr = latest.heart_rate
        
        # Critical conditions
        if temp > 38 or temp < 35 or hr > 120 or hr < 50:
            self.health_status = 'critical'
            self.priority_score = 100
        # Mild conditions
        elif (37.5 <= temp <= 38) or (35 <= temp < 36) or (100 <= hr <= 120) or (50 <= hr < 60):
            self.health_status = 'mild'
            self.priority_score = 50
        # Normal
        else:
            self.health_status = 'normal'
            self.priority_score = 10
        
        self.last_assessment_time = timezone.now()
        self.save()
