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
        - Critical: Temp <34.5°C or >38.5°C, HR <55 or >105 BPM, SpO2 <88%
        - Needs Attention: Temp 34.5-35°C or 37-38.5°C, HR 55-65 or 80-105 BPM, SpO2 88-94%
        - Stable: Temp 35-37°C, HR 65-80 BPM, SpO2 94-100%
        """
        from django.utils import timezone
        
        latest = self.measurements.first()  # Already ordered by -timestamp
        
        if not latest:
            self.health_status = 'unknown'
            self.priority_score = 0
            self.last_assessment_time = timezone.now()
            self.save()
            return
        
        temp = latest.temperature
        hr = latest.heart_rate
        spo2 = latest.spo2
        
        # Check if we have at least one vital sign to assess
        if temp is None and hr is None and spo2 is None:
            self.health_status = 'unknown'
            self.priority_score = 0
            self.last_assessment_time = timezone.now()
            self.save()
            return
        
        # Critical conditions - any one critical makes the status critical
        is_critical = False
        is_mild = False
        
        # Temperature assessment
        if temp is not None:
            if temp < 34.5 or temp > 38.5:
                is_critical = True
            elif (34.5 <= temp < 35) or (37 < temp <= 38.5):
                is_mild = True
        
        # Heart Rate assessment
        if hr is not None:
            if hr < 55 or hr > 105:
                is_critical = True
            elif (55 <= hr < 65) or (80 < hr <= 105):
                is_mild = True
        
        # SpO2 assessment
        if spo2 is not None:
            if spo2 < 88:
                is_critical = True
            elif 88 <= spo2 < 94:
                is_mild = True
        
        # Determine final status (critical > mild > normal)
        if is_critical:
            self.health_status = 'critical'
            self.priority_score = 100
        elif is_mild:
            self.health_status = 'mild'
            self.priority_score = 50
        else:
            self.health_status = 'normal'
            self.priority_score = 10
        
        self.last_assessment_time = timezone.now()
        self.save()
