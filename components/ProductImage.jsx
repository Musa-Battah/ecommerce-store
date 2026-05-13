'use client';

import { useState, useEffect } from 'react';

export default function ProductImage({ src, alt, className, sizes = '(max-width: 768px) 100vw, 50vw' }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate Cloudinary transformations for optimization
  const getOptimizedUrl = (url, width) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Add Cloudinary URL parameters for optimization
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=auto:good&f=auto&c=limit`;
  };

  // Responsive srcSet for different device widths
  const getSrcSet = (url) => {
    if (!url || !url.includes('cloudinary.com')) return '';
    
    const widths = [320, 480, 640, 800, 1024, 1280];
    return widths
      .map(w => `${getOptimizedUrl(url, w)} ${w}w`)
      .join(', ');
  };

  useEffect(() => {
    setImageSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    setImageSrc('/placeholder-image.jpg'); // Fallback image
  };

  return (
    <div className="product-image-wrapper">
      {loading && (
        <div className="image-placeholder">
          <div className="image-loader"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`product-image ${className || ''} ${loading ? 'loading' : 'loaded'}`}
        srcSet={getSrcSet(src)}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}