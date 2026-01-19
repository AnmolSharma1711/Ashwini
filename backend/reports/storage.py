"""
Custom Cloudinary storage for reports that handles both images and PDFs.
"""
from cloudinary_storage.storage import MediaCloudinaryStorage
import cloudinary.uploader
import cloudinary
import os


class ReportCloudinaryStorage(MediaCloudinaryStorage):
    """
    Custom storage backend for medical reports.
    
    Uses resource_type='raw' for PDFs and 'image' for images.
    Properly generates URLs based on the file type.
    """
    
    def _upload(self, name, content):
        """
        Override upload to detect file type and use appropriate resource_type.
        Images use 'image', PDFs and other documents use 'raw'.
        """
        # Detect file type from extension
        ext = os.path.splitext(name)[1].lower()
        
        # PDFs and other documents need resource_type='raw'
        # Images can use resource_type='image' (default)
        if ext == '.pdf':
            resource_type = 'raw'
        else:
            resource_type = 'image'
        
        # Build upload options
        options = {
            'folder': self._get_folder(name),
            'resource_type': resource_type,
            'overwrite': False,
        }
        
        # Add any additional options from settings
        if hasattr(self, 'CLOUDINARY_STORAGE'):
            options.update(self.CLOUDINARY_STORAGE.get('OPTIONS', {}))
        
        return cloudinary.uploader.upload(content, **options)
    
    def url(self, name):
        """
        Override URL generation to use correct resource_type for PDFs.
        """
        # Detect file type from extension
        ext = os.path.splitext(name)[1].lower()
        
        if ext == '.pdf':
            # For PDFs, generate URL with resource_type='raw'
            # Extract the public_id from the name
            public_id = name.replace('\\', '/').split('.')[0]
            return cloudinary.CloudinaryImage(public_id).build_url(resource_type='raw')
        else:
            # For images, use the default URL generation
            return super().url(name)
    
    def _get_folder(self, name):
        """Extract folder path from the upload name."""
        import os
        folder = os.path.dirname(name)
        return folder if folder else None
