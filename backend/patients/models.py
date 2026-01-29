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
        
        Priority: SpO2 > Heart Rate > Temperature (temperature has lowest importance)
        
        Classification Rules:
        SpO2 (Primary):
        - Critical: <88%
        - Needs Attention: 88-94%
        - Stable: 94-100%
        
        Heart Rate (Primary):
        - Critical: <55 or >105 BPM
        - Needs Attention: 55-65 or 80-105 BPM
        - Stable: 65-80 BPM
        
        Temperature (Low Priority - only extreme values matter):
        - Critical: <33°C or >40°C (only very extreme)
        - Needs Attention: 33-34°C or 39-40°C (moderately extreme)
        - Stable: 34-39°C (wider tolerance)
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
        
        # Track critical and mild conditions separately
        is_critical = False
        is_mild = False
        
        # SpO2 assessment (HIGH PRIORITY)
        if spo2 is not None:
            if spo2 < 88:
                is_critical = True
            elif 88 <= spo2 < 94:
                is_mild = True
        
        # Heart Rate assessment (HIGH PRIORITY)
        if hr is not None:
            if hr < 55 or hr > 105:
                is_critical = True
            elif (55 <= hr < 65) or (85 < hr <= 105):
                is_mild = True
        
        # Temperature assessment (LOW PRIORITY - only extreme values trigger alerts)
        # Wider tolerance: slightly off temperature doesn't affect status
        if temp is not None:
            if temp < 33 or temp > 40:
                # Only very extreme temperatures are critical
                is_critical = True
            elif (33 <= temp < 34) or (39 < temp <= 40):
                # Moderately extreme temperatures need attention
                is_mild = True
            # Temperature 34-39°C is considered acceptable (wider range)
        
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
