# Cloudinary Setup for Report Storage

## ✅ Why Cloudinary?

- **Free Tier**: 25 GB storage + 25 GB bandwidth/month
- **Easy Setup**: 5 minutes to configure
- **Persistent Storage**: Files never disappear
- **Optimized**: Automatic image optimization
- **CDN**: Fast delivery worldwide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Free Cloudinary Account

1. Go to https://cloudinary.com/users/register_free
2. Sign up (free, no credit card required)
3. After signup, you'll see your **Dashboard** with credentials

### Step 2: Get Your Credentials

On the Cloudinary Dashboard, you'll see:

```
Cloud Name: your_cloud_name
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 3: Add to Render Environment Variables

1. Go to https://dashboard.render.com
2. Select your **ashwini-backend** service
3. Click **Environment** tab
4. Add these three variables:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
DEBUG=False
```

4. Click **Save Changes** (Render will auto-redeploy)

### Step 4: Wait for Deployment

- Watch the Render logs
- Should see: "Installing cloudinary..." in build log
- Deployment takes ~2 minutes

### Step 5: Test Upload

1. Go to https://ashwini-frontend-main.vercel.app
2. Select a patient
3. Upload a test report image
4. **Success!** File is now stored on Cloudinary ✅

### Step 6: Verify in Cloudinary

1. Go to Cloudinary Dashboard → Media Library
2. You should see the uploaded report image
3. Files persist forever (won't disappear on redeploy)

## 📋 What Happens Now

### In Development (Local)
- `DEBUG=True` → Uses local filesystem
- Files saved to `backend/media/reports/`
- Good for testing without internet

### In Production (Render)
- `DEBUG=False` + Cloudinary vars set → Uses Cloudinary
- Files uploaded to cloud storage
- Accessible via CDN URLs
- **Never deleted** on redeploy ✅

## 🔍 How It Works

### Before (Problem)
```
User uploads → Render filesystem → Files deleted on redeploy ❌
```

### After (Solution)
```
User uploads → Cloudinary CDN → Files persist forever ✅
```

### File URL Example

**Before (local):**
```
https://ashwini-backend.onrender.com/media/reports/2026/01/19/report.jpg
```

**After (Cloudinary):**
```
https://res.cloudinary.com/your_cloud_name/image/upload/v123456/report.jpg
```

## 💰 Free Tier Limits

Cloudinary Free Plan includes:
- **25 GB** storage
- **25 GB** bandwidth/month  
- **25 credits** for transformations/month
- Unlimited images

**Estimate for your app:**
- Average report: 2-5 MB
- 25 GB = ~5,000-12,000 reports
- More than enough to start! 🎉

## ⚙️ Configuration Reference

The setup is already done in the code. Here's what was configured:

### requirements.txt
```python
cloudinary>=1.36.0
django-cloudinary-storage>=0.3.0
```

### settings.py
```python
INSTALLED_APPS = [
    # ...
    'cloudinary_storage',
    'cloudinary',
    # ...
]

# Media files configuration
if not DEBUG and os.getenv('CLOUDINARY_CLOUD_NAME'):
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
        'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
        'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
    }
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
else:
    # Local filesystem for development
    MEDIA_ROOT = BASE_DIR / 'media'
```

## 🔐 Security Notes

- ✅ API credentials stored in Render environment variables
- ✅ Files are private by default
- ✅ Access controlled through Django views
- ✅ No public URL exposure

## 🐛 Troubleshooting

### "Still using local storage in production"
**Check:**
1. `DEBUG=False` in Render environment
2. All 3 Cloudinary variables added correctly
3. Redeploy triggered after adding variables

### "Upload fails with 401 Unauthorized"
**Fix:**
- Double-check API Key and API Secret
- No spaces in environment variable values
- Cloud Name is correct (lowercase)

### "Images not showing in dashboard"
**Wait:**
- Cloudinary can take 30-60 seconds to index new uploads
- Refresh Media Library page

## 📚 Next Steps

After Cloudinary is working:

1. **Add Azure Document Intelligence** credentials for AI analysis
   - See [WHERE_TO_PUT_AZURE_API.md](WHERE_TO_PUT_AZURE_API.md)
   
2. **Test Complete Flow:**
   - Upload report → Stored on Cloudinary ✅
   - AI analysis → Extract text & key phrases ✅
   - View on doctor dashboard ✅

3. **Monitor Usage:**
   - Check Cloudinary Dashboard for storage/bandwidth usage
   - Free tier should be sufficient for initial launch

## ✅ Checklist

- [ ] Cloudinary account created
- [ ] Credentials copied from dashboard
- [ ] Environment variables added to Render
- [ ] Render redeployed successfully
- [ ] Test report uploaded
- [ ] File visible in Cloudinary Media Library
- [ ] File persists after redeploy

**Status: Ready for production! 🚀**
