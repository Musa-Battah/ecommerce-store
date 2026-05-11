'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
    loadCategories();
  }, []);

  const loadCategories = async () => {
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

  // Auto-generate slug from name
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
          category_id: formData.category_id ? parseInt(formData.category_id) : null
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
    <div>
      <h1>Add New Product</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
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
            required
          />
          <small style={{ color: '#888888' }}>Auto-generated from name, but you can edit</small>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Price (₦) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
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
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            {' '} Product Active (visible to customers)
          </label>
        </div>

        {error && <div style={{ color: '#ff4444', marginBottom: '15px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}