"""
Custom Cloudinary storage for reports that handles both images and PDFs.
"""
from cloudinary_storage.storage import MediaCloudinaryStorage
import cloudinary.uploader


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
        # Build upload options with resource_type='auto'
        options = {
            'folder': self._get_folder(name),
            'resource_type': 'auto',  # Auto-detect: image or raw (for PDFs)
            'overwrite': False,
        }
        
        # Add any additional options from settings
        if hasattr(self, 'CLOUDINARY_STORAGE'):
            options.update(self.CLOUDINARY_STORAGE.get('OPTIONS', {}))
        
        return cloudinary.uploader.upload(content, **options)
    
    def _get_folder(self, name):
        """Extract folder path from the upload name."""
        import os
        folder = os.path.dirname(name)
        return folder if folder else None
