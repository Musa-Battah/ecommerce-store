'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductImageUpload from '@/components/ProductImageUpload';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_price: '',
    stock_quantity: '0',
    category_id: '',
    is_active: true
  });

  // ... rest of your existing code

  const handleImageUpload = (urls) => {
    setImageUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
          stock_quantity: parseInt(formData.stock_quantity),
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          images: imageUrls // Add uploaded image URLs
        })
      });

      if (res.ok) {
        router.push('/admin/products');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create product');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-form">
      <h1>Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="card">
        {/* ... your existing form fields ... */}
        
        {/* Image Upload Section */}
        <div className="form-section">
          <h2 className="form-section-title">Product Images</h2>
          <ProductImageUpload 
            onImageUploaded={handleImageUpload}
            currentImages={imageUrls}
          />
        </div>
        
        {/* ... rest of form ... */}
      </form>
    </div>
  );
}