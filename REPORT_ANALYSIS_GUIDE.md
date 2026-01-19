# Medical Report Analysis Feature - Setup Guide

## Overview
This feature enables doctors to upload medical reports (lab results, prescriptions, medical documents) from the Health Monitoring Station and automatically extract text and key medical phrases using Azure Document Intelligence AI.

## Architecture

### Backend Components:
1. **Report Model** (`backend/reports/models.py`): Stores report images and analysis results
2. **Azure Service** (`backend/reports/services.py`): Integrates with Azure Document Intelligence API
3. **API Endpoints** (`backend/reports/views.py`): Handles report upload and retrieval
4. **Serializers** (`backend/reports/serializers.py`): Data serialization for API responses

### Frontend Components:
1. **HealthMonitoringStation** (Updated): Added report upload functionality
2. **ReportAnalysis** (New): Displays extracted text and key phrases
3. **API Functions** (`api.js`): Added report-related API calls

## Setup Instructions

### 1. Azure Configuration (Required)
Follow the detailed guide in `AZURE_SETUP.md` to:
- Create an Azure account
- Set up Document Intelligence resource
- Get your API credentials

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install new dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env

# Edit .env and add your Azure credentials
# AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-endpoint
# AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key

# Create migrations for the new reports app
python manage.py makemigrations reports

# Apply migrations
python manage.py migrate

# Create media directory for uploads
New-Item -ItemType Directory -Force -Path media

# Start the server
python manage.py runserver
```

### 3. Frontend Setup

```powershell
# Navigate to frontend directory
cd frontend-main

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

## Usage

### Uploading a Report:
1. Open the Health Monitoring Station
2. Select a patient
3. Scroll to "Upload Medical Report" section
4. Click "Select Report Image/PDF"
5. Choose a medical report file (JPG, PNG, or PDF)
6. Click "Upload & Analyze Report"
7. Wait for the analysis to complete

### Viewing Analysis:
1. Click "View Report Analysis" button
2. The Report Analysis section will display:
   - List of all uploaded reports for the patient
   - Analysis status (pending/processing/completed/failed)
   - Extracted text from the report (OCR)
   - Key medical phrases identified by AI
   - Confidence score of the analysis

## API Endpoints

### Upload Report
```
POST /api/patients/<patient_id>/reports/
Content-Type: multipart/form-data

Body:
- report_image: File (required)
- uploaded_by: String (optional)

Response:
{
  "id": 1,
  "patient": 123,
  "patient_name": "John Doe",
  "report_image": "/media/reports/2026/01/19/report.jpg",
  "uploaded_at": "2026-01-19T10:30:00Z",
  "analysis_status": "completed",
  "extracted_text": "...",
  "key_phrases": ["blood pressure: 120/80", "heart rate: 72 bpm"],
  "confidence_score": 0.95
}
```

### Get Patient Reports
```
GET /api/patients/<patient_id>/reports/

Response:
[
  {
    "id": 1,
    "patient": 123,
    "report_image": "...",
    "analysis_status": "completed",
    ...
  }
]
```

### Get Report Analysis
```
GET /api/reports/<report_id>/analysis/

Response:
{
  "id": 1,
  "patient": 123,
  "patient_name": "John Doe",
  "extracted_text": "Full extracted text...",
  "key_phrases_list": ["phrase 1", "phrase 2"],
  "confidence_score": 0.95
}
```

## Features

### 1. Automatic Text Extraction (OCR)
- Extracts all text from medical reports
- Supports handwritten and printed text
- Works with various image qualities

### 2. Key Phrase Extraction
- Identifies important medical terms
- Highlights:
  - Vital signs (blood pressure, heart rate, etc.)
  - Test results (glucose, cholesterol, etc.)
  - Diagnoses and medications
  - Abnormal findings

### 3. Confidence Scoring
- Provides accuracy metrics for OCR results
- Helps doctors assess reliability of extracted data

### 4. Multi-format Support
- Images: JPG, PNG
- Documents: PDF
- Maximum file size: 10MB

### 5. Real-time Analysis
- Uploads and analyzes reports immediately
- Status updates during processing
- Error handling and retry capability

## Database Schema

### Report Model Fields:
- `patient`: ForeignKey to Patient
- `report_image`: ImageField (uploaded file)
- `uploaded_at`: DateTime
- `uploaded_by`: String
- `analysis_status`: pending/processing/completed/failed
- `extracted_text`: TextField (OCR result)
- `key_phrases`: JSONField (list of phrases)
- `confidence_score`: Float (0-1)
- `error_message`: TextField (if failed)
- `doctor_notes`: TextField (optional)

## Troubleshooting

### Issue: "Azure Document Intelligence is not configured"
**Solution**: Ensure you have set the environment variables in your .env file:
```
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-api-key
```

### Issue: "Failed to upload report"
**Solution**: 
- Check file format (must be JPG, PNG, or PDF)
- Verify file size (must be < 10MB)
- Ensure backend is running and accessible

### Issue: "Analysis failed"
**Solution**:
- Check Azure service status
- Verify API credentials are correct
- Check backend logs for detailed error messages
- Ensure you haven't exceeded Azure free tier limits

### Issue: Media files not loading
**Solution**:
- Ensure media directory exists: `backend/media/`
- Check Django MEDIA_URL and MEDIA_ROOT settings
- Verify file permissions

## Testing

### Test with Sample Report:
1. Create a simple medical report using any image editor
2. Add text like:
   ```
   Patient: John Doe
   Date: 2026-01-19
   Blood Pressure: 120/80 mmHg
   Heart Rate: 72 bpm
   Temperature: 37.0°C
   Diagnosis: Normal checkup
   ```
3. Save as JPG or PDF
4. Upload through the application
5. Verify that key phrases are extracted correctly

## Production Considerations

### 1. Security
- Add authentication to report upload endpoints
- Encrypt sensitive medical data
- Implement access control (doctors only)

### 2. Storage
- Consider cloud storage (S3, Azure Blob) for scalability
- Implement file cleanup policies
- Add backup strategies

### 3. Performance
- Use background tasks (Celery) for analysis
- Implement caching for frequently accessed reports
- Add pagination for large report lists

### 4. Compliance
- Ensure HIPAA compliance for medical data
- Add audit logging for report access
- Implement data retention policies

## Future Enhancements

1. **Enhanced Analysis**:
   - Use Azure Text Analytics for more sophisticated key phrase extraction
   - Implement medical entity recognition
   - Add sentiment analysis for patient notes

2. **Batch Processing**:
   - Upload multiple reports at once
   - Bulk analysis capabilities

3. **Report Comparison**:
   - Compare reports over time
   - Track trends in lab values
   - Generate health insights

4. **Export Features**:
   - Export analysis as PDF
   - Generate summary reports
   - Share with patients securely

5. **Advanced OCR**:
   - Support for more languages
   - Better handwriting recognition
   - Table extraction from lab reports

## Support

For issues or questions:
1. Check backend logs: `backend/logs/` (if configured)
2. Review Azure portal for API usage and errors
3. Consult Azure Document Intelligence documentation: https://learn.microsoft.com/azure/ai-services/document-intelligence/

## Cost Estimation

### Azure Document Intelligence:
- Free tier: 500 pages/month (sufficient for small clinics)
- Standard tier: ~$1-2 per 1000 pages
- Estimated for 100 patients/month with 2 reports each: $0 (within free tier)

### Storage:
- Minimal cost for image storage
- Use cloud storage for production scaling
