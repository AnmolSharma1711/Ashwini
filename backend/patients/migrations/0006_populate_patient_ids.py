# Generated manually to fix patient_id for existing records

from django.db import migrations


def populate_patient_ids(apps, schema_editor):
    """
    Populate patient_id for all patients that have empty patient_id.
    This fixes the unique constraint violation on Render deployment.
    """
    Patient = apps.get_model('patients', 'Patient')
    db_alias = schema_editor.connection.alias
    
    # Get all patients with empty or null patient_id
    patients_without_id = Patient.objects.using(db_alias).filter(
        models.Q(patient_id='') | models.Q(patient_id__isnull=True)
    ).order_by('id')
    
    if not patients_without_id.exists():
        return  # Nothing to do
    
    # Get the highest existing patient number
    all_patients = Patient.objects.using(db_alias).exclude(
        models.Q(patient_id='') | models.Q(patient_id__isnull=True)
    )
    
    max_num = 0
    for patient in all_patients:
        if patient.patient_id and patient.patient_id.startswith('PAT'):
            try:
                num = int(patient.patient_id[3:])
                max_num = max(max_num, num)
            except (ValueError, IndexError):
                continue
    
    # Assign patient_ids to patients without one
    for patient in patients_without_id:
        max_num += 1
        patient.patient_id = f'PAT{max_num:04d}'
        patient.save(update_fields=['patient_id'])


def reverse_populate(apps, schema_editor):
    """
    Reverse operation - set patient_ids back to empty.
    This is not recommended but provided for completeness.
    """
    pass  # Cannot safely reverse this operation


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0005_patient_consent_timestamp_patient_consent_version_and_more'),
    ]

    operations = [
        migrations.RunPython(populate_patient_ids, reverse_populate),
    ]
