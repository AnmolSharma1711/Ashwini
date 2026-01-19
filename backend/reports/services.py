import os
import logging
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeDocumentRequest, AnalyzeResult

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
    
    def analyze_document(self, image_file_path):
        """
        Analyze a document image using Azure Document Intelligence.
        
        Args:
            image_file_path: Path to the image file
            
        Returns:
            dict: Analysis results containing:
                - extracted_text: Full text extracted from the document
                - key_phrases: List of important phrases
                - confidence_score: Overall confidence of the analysis
        """
        if not self.is_configured():
            raise Exception("Azure Document Intelligence service is not configured. Please set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY environment variables.")
        
        try:
            # Read the image file
            with open(image_file_path, "rb") as f:
                image_data = f.read()
            
            # Use the read model for general document analysis
            # This model extracts text, layout, and structure
            poller = self.client.begin_analyze_document(
                "prebuilt-read",  # Using prebuilt read model for OCR
                body=image_data,
                content_type="application/octet-stream"
            )
            
            # Wait for the analysis to complete
            result = poller.result()
            
            # Extract text content
            extracted_text = ""
            if result.content:
                extracted_text = result.content
            
            # Extract key phrases using simple heuristics
            # In production, you might want to use Azure Text Analytics for more sophisticated key phrase extraction
            key_phrases = self._extract_key_phrases(extracted_text)
            
            # Calculate average confidence score
            confidence_score = self._calculate_confidence(result)
            
            return {
                'success': True,
                'extracted_text': extracted_text,
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
        Extract key medical phrases from text.
        
        This is a simple implementation. For production, consider using:
        - Azure Text Analytics for more sophisticated key phrase extraction
        - Custom medical terminology dictionaries
        - ML-based medical entity recognition
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
