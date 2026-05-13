'use client';

import { useState } from 'react';

export default function ProductImageUpload({ onImageUploaded, currentImages = [] }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [images, setImages] = useState(currentImages);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Strict client-side validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    
    setUploading(true);
    setError('');
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Simulate progress (Cloudinary doesn't provide native progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (res.ok) {
        const data = await res.json();
        const newImages = [...images, data.url];
        setImages(newImages);
        setUploadProgress(100);
        onImageUploaded(newImages);
        
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        const error = await res.json();
        setError(error.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (indexToRemove) => {
    const imageUrl = images[indexToRemove];
    const newImages = images.filter((_, i) => i !== indexToRemove);
    setImages(newImages);
    onImageUploaded(newImages);
    
    // Optional: Delete from Cloudinary (if you track public IDs)
    // This requires storing publicId with each image
  };

  return (
    <div className="image-upload-section">
      <div className="current-images">
        {images.map((img, idx) => (
          <div key={idx} className="image-preview-item">
            <img src={img} alt={`Product ${idx + 1}`} />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="image-preview-remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="upload-area">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          id="product-image"
          style={{ display: 'none' }}
        />
        <label htmlFor="product-image" className="upload-label">
          {uploading ? (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
              <span>{uploadProgress}%</span>
            </div>
          ) : (
            <div className="upload-icon">
              📸 {images.length > 0 ? 'Add Another Image' : 'Upload Product Image'}
            </div>
          )}
        </label>
        {error && <div className="upload-error">{error}</div>}
      </div>
      
      <div className="upload-tips">
        <small>💡 Tips: Max 2MB per image • JPG, PNG, or WEBP • Auto-optimized</small>
      </div>
    </div>
  );
}