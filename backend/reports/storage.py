"""
Custom Cloudinary storage for reports that handles both images and PDFs.
"""
from cloudinary_storage.storage import MediaCloudinaryStorage


class ReportCloudinaryStorage(MediaCloudinaryStorage):
    """
    Custom storage backend for medical reports.
    
    Uses resource_type='auto' to support both images (jpg, png) and 
    non-image files (pdf). Cloudinary will automatically detect the 
    correct resource type.
    """
    
    def _upload(self, name, content):
        """
        Override upload to use resource_type='auto' for automatic detection.
        This allows PDFs and other document types in addition to images.
        """
        options = self._get_upload_options(name)
        # Force resource_type to 'auto' for automatic detection
        options['resource_type'] = 'auto'
        
        import cloudinary.uploader
        return cloudinary.uploader.upload(content, **options)
