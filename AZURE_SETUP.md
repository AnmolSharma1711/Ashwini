# Azure Document Intelligence Setup Guide

This application uses Azure Document Intelligence (formerly Form Recognizer) to analyze medical reports.

## Setup Steps:

### 1. Create Azure Account
- Go to https://portal.azure.com
- Sign up for a free Azure account (includes $200 credit)

### 2. Create Document Intelligence Resource
1. In Azure Portal, click "Create a resource"
2. Search for "Document Intelligence" or "Form Recognizer"
3. Click "Create"
4. Fill in the details:
   - Subscription: Select your subscription
   - Resource group: Create new or use existing
   - Region: Choose a region close to you
   - Name: Choose a unique name (e.g., ashwini-doc-intelligence)
   - Pricing tier: Select Free F0 (500 pages/month free) or S0 for production

### 3. Get Your Credentials
1. After deployment, go to your Document Intelligence resource
2. Click on "Keys and Endpoint" in the left menu
3. Copy:
   - **Endpoint**: e.g., https://ashwini-doc-intelligence.cognitiveservices.azure.com/
   - **Key 1**: Your API key

### 4. Configure Backend
1. Copy `.env.example` to `.env` in the backend directory
2. Update the following variables:
   ```
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-endpoint-here
   AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key-here
   ```

### 5. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 6. Run Migrations
```bash
python manage.py makemigrations reports
python manage.py migrate
```

### 7. Test the Feature
1. Start the backend server
2. Upload a medical report through the Health Monitoring Station
3. Check the Report Analysis section to view extracted text and key phrases

## Features:
- **OCR (Optical Character Recognition)**: Extracts all text from medical reports
- **Key Phrase Extraction**: Identifies important medical terms and phrases
- **Confidence Scoring**: Provides accuracy metrics for the analysis
- **Multi-format Support**: Works with JPG, PNG, and PDF files

## Pricing:
- Free tier: 500 pages/month (sufficient for testing)
- Standard tier: Pay-as-you-go pricing
- More info: https://azure.microsoft.com/pricing/details/form-recognizer/

## Troubleshooting:
- Ensure your Azure credentials are correct in the .env file
- Check that the endpoint URL ends with a forward slash
- Verify that the Document Intelligence resource is in an active state
- Check backend logs for any API errors
