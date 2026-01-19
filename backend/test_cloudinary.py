"""
Test script to verify Cloudinary configuration and API connectivity.
Run this to check if Cloudinary credentials are working.
"""

import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ashwini_backend.settings')

import django
django.setup()

def test_cloudinary():
    """Test Cloudinary configuration"""
    print("=" * 60)
    print("CLOUDINARY CONFIGURATION TEST")
    print("=" * 60)
    
    # Check environment variables
    print("\n1. Checking Environment Variables...")
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
    api_key = os.getenv('CLOUDINARY_API_KEY')
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
    debug_mode = os.getenv('DEBUG', 'True')
    
    print(f"   CLOUDINARY_CLOUD_NAME: {'✓ Set' if cloud_name else '✗ Missing'}")
    print(f"   CLOUDINARY_API_KEY: {'✓ Set' if api_key else '✗ Missing'}")
    print(f"   CLOUDINARY_API_SECRET: {'✓ Set' if api_secret else '✗ Missing'}")
    print(f"   DEBUG: {debug_mode}")
    
    if not all([cloud_name, api_key, api_secret]):
        print("\n✗ ERROR: Cloudinary credentials not set!")
        print("   Set these environment variables in Render:")
        print("   - CLOUDINARY_CLOUD_NAME")
        print("   - CLOUDINARY_API_KEY")
        print("   - CLOUDINARY_API_SECRET")
        return False
    
    # Check if cloudinary is installed
    print("\n2. Checking Cloudinary Package...")
    try:
        import cloudinary
        import cloudinary.uploader
        import cloudinary.api
        print("   ✓ Cloudinary package installed")
    except ImportError as e:
        print(f"   ✗ Cloudinary package not installed: {e}")
        print("   Run: pip install cloudinary django-cloudinary-storage")
        return False
    
    # Check Django settings
    print("\n3. Checking Django Settings...")
    from django.conf import settings
    
    if hasattr(settings, 'CLOUDINARY_STORAGE'):
        print("   ✓ CLOUDINARY_STORAGE configured")
        print(f"   Cloud Name: {settings.CLOUDINARY_STORAGE.get('CLOUD_NAME', 'Not set')}")
    else:
        print("   ✗ CLOUDINARY_STORAGE not configured")
    
    if hasattr(settings, 'DEFAULT_FILE_STORAGE'):
        storage_backend = settings.DEFAULT_FILE_STORAGE
        print(f"   File Storage Backend: {storage_backend}")
        if 'cloudinary' in storage_backend.lower():
            print("   ✓ Using Cloudinary storage")
        else:
            print(f"   ! Using local storage (DEBUG={settings.DEBUG})")
    
    # Test Cloudinary API connection
    print("\n4. Testing Cloudinary API Connection...")
    try:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        
        # Try to get account info (this verifies credentials)
        result = cloudinary.api.ping()
        print("   ✓ Cloudinary API connection successful!")
        print(f"   Status: {result.get('status', 'Unknown')}")
        return True
        
    except Exception as e:
        print(f"   ✗ Cloudinary API connection failed: {e}")
        print("\n   Possible issues:")
        print("   - Invalid credentials")
        print("   - Network connectivity problem")
        print("   - Cloudinary service down")
        return False

def test_upload():
    """Test file upload to Cloudinary"""
    print("\n" + "=" * 60)
    print("TESTING FILE UPLOAD")
    print("=" * 60)
    
    try:
        import cloudinary
        import cloudinary.uploader
        from io import BytesIO
        from PIL import Image
        
        # Create a small test image
        print("\n1. Creating test image...")
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        print("   ✓ Test image created")
        
        # Upload to Cloudinary
        print("\n2. Uploading to Cloudinary...")
        result = cloudinary.uploader.upload(
            img_bytes,
            folder="test",
            resource_type="image"
        )
        
        print("   ✓ Upload successful!")
        print(f"   Public ID: {result.get('public_id')}")
        print(f"   URL: {result.get('secure_url')}")
        print(f"   Format: {result.get('format')}")
        print(f"   Size: {result.get('bytes')} bytes")
        
        # Clean up - delete test image
        print("\n3. Cleaning up test image...")
        cloudinary.uploader.destroy(result.get('public_id'))
        print("   ✓ Test image deleted")
        
        return True
        
    except Exception as e:
        print(f"\n   ✗ Upload test failed: {e}")
        return False

if __name__ == '__main__':
    print("\n🔍 Starting Cloudinary Configuration Tests...\n")
    
    config_ok = test_cloudinary()
    
    if config_ok:
        upload_ok = test_upload()
        
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        if upload_ok:
            print("\n✅ All tests passed! Cloudinary is working correctly.")
            print("\nYour report uploads will now be stored on Cloudinary.")
        else:
            print("\n⚠️  Configuration OK but upload failed.")
            print("   Check network connectivity and try again.")
    else:
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print("\n❌ Configuration test failed. Fix the issues above and try again.")
    
    print()
