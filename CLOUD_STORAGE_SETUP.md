# Cloud Storage Setup for Production

## Problem: Render's Ephemeral Filesystem

Render's filesystem is **ephemeral** - all uploaded files are deleted on every deployment. This means patient report images will disappear.

## Solution: AWS S3 (Recommended)

### Step 1: Install django-storages

Already in requirements.txt (we'll add it):
```bash
django-storages[boto3]==1.14.2
```

### Step 2: Create AWS S3 Bucket

1. Go to https://aws.amazon.com/s3/
2. Create new bucket:
   - Name: `ashwini-reports` (must be globally unique)
   - Region: `us-east-1` (or closest to you)
   - Block all public access: ✅ Keep checked
   - Versioning: Optional

3. Create IAM user for programmatic access:
   - Go to IAM → Users → Create user
   - Name: `ashwini-s3-upload`
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Create access key → Save the credentials

### Step 3: Configure Django

Add to `backend/ashwini_backend/settings.py`:

```python
# AWS S3 Configuration for Media Files
if not DEBUG:  # Only in production
    # Install: pip install django-storages[boto3]
    INSTALLED_APPS += ['storages']
    
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME', 'ashwini-reports')
    AWS_S3_REGION_NAME = 'us-east-1'
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    
    # S3 settings
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    AWS_DEFAULT_ACL = 'private'  # Files are private by default
    AWS_S3_FILE_OVERWRITE = False  # Don't overwrite files with same name
    
    # Storage backends
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
```

### Step 4: Add Environment Variables to Render

In Render Dashboard → Environment:

```bash
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_STORAGE_BUCKET_NAME=ashwini-reports
DEBUG=False
```

## Alternative: Azure Blob Storage

If you prefer Azure (integrates well with Azure Document Intelligence):

### Step 1: Install django-storages with Azure

```bash
django-storages[azure]==1.14.2
```

### Step 2: Create Azure Storage Account

1. Go to Azure Portal → Storage Accounts → Create
2. Create container named `reports`
3. Get connection string from Access Keys

### Step 3: Configure Django

```python
# Azure Blob Storage Configuration
if not DEBUG:
    INSTALLED_APPS += ['storages']
    
    AZURE_ACCOUNT_NAME = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
    AZURE_ACCOUNT_KEY = os.getenv('AZURE_STORAGE_ACCOUNT_KEY')
    AZURE_CONTAINER = 'reports'
    
    DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
```

### Step 4: Add Environment Variables to Render

```bash
AZURE_STORAGE_ACCOUNT_NAME=your_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_account_key
DEBUG=False
```

## Quick Fix for Now (Development Only)

For testing purposes, the current setup will work:
- Reports upload successfully
- BUT they disappear on redeploy
- Acceptable for testing, NOT for production

## Recommendation

**Use AWS S3** - it's the industry standard and costs about $0.023 per GB/month.

For your app with occasional report uploads:
- First 5GB/month: ~$0.12
- First 1000 requests: Free
- Very affordable for production use

## Timeline

- **Now**: Test report uploads (they work but are temporary)
- **Before launching**: Set up AWS S3 (30 minutes)
- **Production**: All uploads persist permanently ✅
