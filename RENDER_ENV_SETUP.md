# Render Environment Variables - Quick Reference

## 🚀 Required Environment Variables for Production

Add these in Render Dashboard → Your Service → Environment tab

### Django Configuration
```bash
DEBUG=False
SECRET_KEY=generate-a-new-secret-key-here
ALLOWED_HOSTS=ashwini-backend.onrender.com,*.onrender.com
```

### CORS Settings
```bash
CORS_ALLOWED_ORIGINS=https://ashwini-frontend-main.vercel.app,https://ashwini-unified-view.vercel.app
```

### Cloudinary Storage
Get credentials from: https://cloudinary.com/console

```bash
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

### Azure Document Intelligence  
Get credentials from: https://portal.azure.com → Your Document Intelligence Resource

```bash
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=<your_endpoint_url>
AZURE_DOCUMENT_INTELLIGENCE_KEY=<your_api_key>
```

---

## ✅ After Adding Variables

1. Click **Save Changes** in Render
2. Wait for auto-redeploy (2-3 minutes)
3. Test report upload at https://ashwini-frontend-main.vercel.app
4. Verify files appear in Cloudinary dashboard
5. Check AI analysis works in doctor dashboard

---

## 📝 Notes

- `DEBUG=False` enables Cloudinary storage and production security
- All variable names are case-sensitive
- Endpoint URLs should end with trailing `/`
- After saving, Render automatically redeploys

For detailed setup instructions, see project documentation files.
