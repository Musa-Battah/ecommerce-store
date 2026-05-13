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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name: name,
      slug: generateSlug(name)
    });
  };

  const handleImageUpload = (urls) => {
    setImageUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.name || !formData.slug || !formData.price) {
      setError('Name, slug, and price are required');
      setSubmitting(false);
      return;
    }

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
          images: imageUrls
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
      <p style={{ color: '#888888', marginBottom: '30px' }}>Create a new product for your store</p>

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Information */}
        <div className="form-section">
          <h2 className="form-section-title">Basic Information</h2>
          
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., iPhone 15 Pro"
              required
            />
          </div>

          <div className="form-group">
            <label>Slug (URL) *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g., iphone-15-pro"
              required
            />
            <small style={{ color: '#888888' }}>Auto-generated from name. This will be the product URL.</small>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed product description..."
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="form-section">
          <h2 className="form-section-title">Product Images</h2>
          <ProductImageUpload 
            onImageUploaded={handleImageUpload}
            currentImages={imageUrls}
          />
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h2 className="form-section-title">Pricing</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Price (₦) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Compare Price (Original Price)</label>
              <input
                type="number"
                name="compare_price"
                value={formData.compare_price}
                onChange={handleChange}
                step="0.01"
                placeholder="Leave empty if no discount"
              />
              <small style={{ color: '#888888' }}>Shows as strikethrough original price</small>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="form-section">
          <h2 className="form-section-title">Inventory</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="form-section">
          <h2 className="form-section-title">Product Status</h2>
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ width: 'auto' }}
              />
              <span>Product Active (visible to customers)</span>
            </label>
          </div>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(255, 68, 68, 0.1)', 
            color: '#ff4444', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating Product...' : 'Create Product'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}