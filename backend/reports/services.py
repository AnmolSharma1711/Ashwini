import os
import logging
import json
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeDocumentRequest, AnalyzeResult

# Import OpenAI at module level to avoid timeout during request
try:
    from openai import AzureOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    AzureOpenAI = None

logger = logging.getLogger(__name__)


class AzureDocumentIntelligenceService:
    """
    Service class for interacting with Azure Document Intelligence API.
    
    This service handles:
    1. OCR (Optical Character Recognition) to extract text from images
    2. Key phrase extraction to identify important medical terms
    3. Document analysis with confidence scores
    """
    
    def __init__(self):
        """Initialize the Azure Document Intelligence client"""
        self.endpoint = os.environ.get('AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT')
        self.api_key = os.environ.get('AZURE_DOCUMENT_INTELLIGENCE_KEY')
        
        if not self.endpoint or not self.api_key:
            logger.warning("Azure Document Intelligence credentials not configured")
            self.client = None
        else:
            try:
                credential = AzureKeyCredential(self.api_key)
                self.client = DocumentIntelligenceClient(
                    endpoint=self.endpoint,
                    credential=credential
                )
            except Exception as e:
                logger.error(f"Failed to initialize Azure Document Intelligence client: {str(e)}")
                self.client = None
    
    def is_configured(self):
        """Check if the service is properly configured"""
        return self.client is not None
    
    def analyze_document_from_bytes(self, file_data):
        """
        Analyze a document directly from bytes data.
        
        Args:
            file_data: Raw bytes of the file
            
        Returns:
            dict: Analysis results containing:
                - extracted_text: Full text extracted from the document
                - key_phrases: List of important phrases
                - confidence_score: Overall confidence of the analysis
        """
        if not self.is_configured():
            raise Exception("Azure Document Intelligence service is not configured. Please set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY environment variables.")
        
        try:
            logger.info("=== STARTING DOCUMENT ANALYSIS ===")
            # Use the read model for general document analysis
            poller = self.client.begin_analyze_document(
                "prebuilt-read",  # Using prebuilt read model for OCR
                body=file_data,
                content_type="application/octet-stream"
            )
            
            # Wait for the analysis to complete
            result = poller.result()
            
            # Extract raw OCR text
            raw_ocr_text = ""
            if result.content:
                raw_ocr_text = result.content
            
            logger.info(f"OCR extracted {len(raw_ocr_text)} characters")
            
            # Generate readable summary using OpenAI (or use raw OCR as fallback)
            extracted_text = self._generate_readable_summary(raw_ocr_text)
            
            # Extract key phrases using OpenAI
            key_phrases = self._extract_key_phrases(raw_ocr_text)
            
            # Calculate average confidence score
            confidence_score = self._calculate_confidence(result)
            
            logger.info(f"=== ANALYSIS COMPLETE: {len(key_phrases)} key phrases, confidence {confidence_score} ===")
            
            return {
                'success': True,
                'extracted_text': extracted_text,  # Now contains OpenAI-formatted summary
                'key_phrases': key_phrases,
                'confidence_score': confidence_score,
                'page_count': len(result.pages) if result.pages else 0
            }
            
        except Exception as e:
            logger.error(f"Error analyzing document from bytes: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'extracted_text': None,
                'key_phrases': [],
                'confidence_score': None
            }
    
    def analyze_document(self, file_url):
        """
        Analyze a document from URL using Azure Document Intelligence.
        
        Args:
            file_url: URL of the file (can be Cloudinary URL or local URL)
            
        Returns:
            dict: Analysis results containing:
                - extracted_text: Full text extracted from the document
                - key_phrases: List of important phrases
                - confidence_score: Overall confidence of the analysis
        """
        if not self.is_configured():
            raise Exception("Azure Document Intelligence service is not configured. Please set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY environment variables.")
        
        try:
            # If it's a relative URL (local development), need to handle differently
            # For production with Cloudinary, it will be an absolute HTTPS URL
            import requests
            from io import BytesIO
            
            if file_url.startswith('http://') or file_url.startswith('https://'):
                # Remote URL (Cloudinary) - download and analyze
                response = requests.get(file_url)
                response.raise_for_status()
                file_data = response.content
            else:
                # Local file path - read directly (development mode)
                with open(file_url, "rb") as f:
                    file_data = f.read()
            
            # Use the read model for general document analysis
            # This model extracts text, layout, and structure
            poller = self.client.begin_analyze_document(
                "prebuilt-read",  # Using prebuilt read model for OCR
                body=file_data,
                content_type="application/octet-stream"
            )
            
            # Wait for the analysis to complete
            result = poller.result()
            
            # Extract text content
            raw_ocr_text = ""
            if result.content:
                raw_ocr_text = result.content
            
            # Generate readable summary using OpenAI (or use raw OCR as fallback)
            extracted_text = self._generate_readable_summary(raw_ocr_text)
            
            # Extract key phrases using OpenAI
            key_phrases = self._extract_key_phrases(raw_ocr_text)
            
            # Calculate average confidence score
            confidence_score = self._calculate_confidence(result)
            
            return {
                'success': True,
                'extracted_text': extracted_text,  # Now contains OpenAI-formatted summary
                'key_phrases': key_phrases,
                'confidence_score': confidence_score,
                'page_count': len(result.pages) if result.pages else 0
            }
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'extracted_text': None,
                'key_phrases': [],
                'confidence_score': None
            }
    
    def _extract_key_phrases(self, text):
        """
        Extract key medical phrases from text using Azure OpenAI.
        Falls back to keyword matching if OpenAI is not configured.
        """
        if not text:
            return []
        
        # Try Azure OpenAI first for intelligent extraction
        openai_phrases = self._extract_key_phrases_with_openai(text)
        if openai_phrases:
            return openai_phrases
        
        # Fallback to simple keyword matching
        return self._extract_key_phrases_simple(text)
    
    def _generate_readable_summary(self, raw_ocr_text):
        """
        Generate a clean, readable summary of the medical report using Azure OpenAI.
        Falls back to raw OCR text if OpenAI is not configured.
        """
        if not raw_ocr_text:
            return ""
        
        openai_endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
        openai_key = os.environ.get('AZURE_OPENAI_API_KEY')
        openai_deployment = os.environ.get('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-4o-mini')
        
        logger.info(f"OpenAI Summary - Endpoint configured: {bool(openai_endpoint)}, Key configured: {bool(openai_key)}, Library available: {OPENAI_AVAILABLE}, Deployment: {openai_deployment}")
        
        if not openai_endpoint or not openai_key or not OPENAI_AVAILABLE:
            logger.warning(f"Azure OpenAI not configured - Endpoint: {bool(openai_endpoint)}, Key: {bool(openai_key)}, Available: {OPENAI_AVAILABLE}")
            return raw_ocr_text
        
        try:
            logger.info(f"Calling Azure OpenAI for summary generation with deployment: {openai_deployment}")
            client = AzureOpenAI(
                api_key=openai_key,
                api_version="2024-02-15-preview",
                azure_endpoint=openai_endpoint
            )
            
            prompt = f"""Clean up and organize this medical report text into a clear, readable format.
Structure the information logically with proper headings and formatting.
Correct any OCR errors and make the text easy to understand for healthcare professionals.

Raw OCR Text:
{raw_ocr_text[:3000]}

Return a well-formatted, professional medical report summary."""
            
            response = client.chat.completions.create(
                model=openai_deployment,
                messages=[
                    {"role": "system", "content": "You are a medical document assistant that formats and cleans medical report text for healthcare professionals."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            formatted_text = response.choices[0].message.content.strip()
            logger.info(f"✅ Successfully generated readable summary using Azure OpenAI (length: {len(formatted_text)} chars)")
            return formatted_text
            
        except Exception as e:
            logger.error(f"❌ Error generating readable summary with OpenAI: {str(e)}", exc_info=True)
            return raw_ocr_text  # Fallback to raw OCR text
    
    def _extract_key_phrases(self, text):
        """
        Extract key medical phrases from text using Azure OpenAI.
        Falls back to keyword matching if OpenAI is not configured.
        """
        if not text:
            return []
        
        # Try Azure OpenAI first for intelligent extraction
        openai_phrases = self._extract_key_phrases_with_openai(text)
        if openai_phrases:
            return openai_phrases
        
        # Fallback to simple keyword matching
        return self._extract_key_phrases_simple(text)
    
    def _extract_key_phrases_with_openai(self, text):
        """
        Use Azure OpenAI to extract and format medical key phrases intelligently.
        """
        openai_endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
        openai_key = os.environ.get('AZURE_OPENAI_API_KEY')
        openai_deployment = os.environ.get('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-4o-mini')
        
        logger.info(f"OpenAI KeyPhrases - Endpoint configured: {bool(openai_endpoint)}, Key configured: {bool(openai_key)}, Library available: {OPENAI_AVAILABLE}")
        
        if not openai_endpoint or not openai_key or not OPENAI_AVAILABLE:
            logger.warning(f"Azure OpenAI not configured for key phrases - Endpoint: {bool(openai_endpoint)}, Key: {bool(openai_key)}, Available: {OPENAI_AVAILABLE}")
            return None
        
        try:
            logger.info(f"Calling Azure OpenAI for key phrase extraction with deployment: {openai_deployment}")
            client = AzureOpenAI(
                api_key=openai_key,
                api_version="2024-02-15-preview",
                azure_endpoint=openai_endpoint
            )
            
            prompt = f"""Analyze this medical report text and extract 5-10 key medical findings in clear, understandable format.
Format each finding as a short phrase (3-7 words).
Focus on: diagnoses, test results, measurements, conditions, medications, and recommendations.

Medical Report Text:
{text[:2000]}

Return ONLY a JSON array of strings, like: ["Finding 1", "Finding 2", "Finding 3"]"""
            
            response = client.chat.completions.create(
                model=openai_deployment,
                messages=[
                    {"role": "system", "content": "You are a medical assistant that extracts key findings from medical reports."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Parse JSON response
            key_phrases = json.loads(result_text)
            
            if isinstance(key_phrases, list):
                logger.info(f"✅ Extracted {len(key_phrases)} key phrases using Azure OpenAI")
                return key_phrases[:10]  # Limit to 10
            else:
                logger.warning(f"OpenAI returned non-list response: {type(key_phrases)}")
            
        except Exception as e:
            logger.error(f"❌ Error using Azure OpenAI for key phrase extraction: {str(e)}", exc_info=True)
        
        return None
    
    def _extract_key_phrases_simple(self, text):
        """
        Simple keyword-based extraction as fallback.
        """
        if not text:
            return []
        
        # Common medical keywords to look for
        medical_keywords = [
            'blood pressure', 'heart rate', 'temperature', 'oxygen',
            'glucose', 'cholesterol', 'hemoglobin', 'diagnosis',
            'prescription', 'medication', 'treatment', 'test results',
            'x-ray', 'mri', 'ct scan', 'ultrasound', 'ecg', 'ekg',
            'diabetes', 'hypertension', 'fever', 'infection',
            'normal', 'abnormal', 'elevated', 'low', 'high'
        ]
        
        key_phrases = []
        text_lower = text.lower()
        
        # Split text into sentences
        sentences = text.replace('\n', ' ').split('.')
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Check if sentence contains medical keywords
            for keyword in medical_keywords:
                if keyword in sentence.lower():
                    # Extract the relevant phrase (up to 100 characters)
                    phrase = sentence[:100].strip()
                    if phrase and phrase not in key_phrases:
                        key_phrases.append(phrase)
                    break
        
        # Limit to top 10 most relevant phrases
        return key_phrases[:10]
    
    def _calculate_confidence(self, result):
        """
        Calculate average confidence score from analysis result.
        """
        if not result or not result.pages:
            return None
        
        total_confidence = 0
        count = 0
        
        # Calculate average confidence from words
        for page in result.pages:
            if page.words:
                for word in page.words:
                    if hasattr(word, 'confidence') and word.confidence is not None:
                        total_confidence += word.confidence
                        count += 1
        
        if count > 0:
            return round(total_confidence / count, 2)
        
        return None


# Singleton instance
_service_instance = None

def get_document_intelligence_service():
    """Get or create the Azure Document Intelligence service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = AzureDocumentIntelligenceService()
    return _service_instance
