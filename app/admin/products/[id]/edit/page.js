'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_price: '',
    stock_quantity: '',
    category_id: '',
    is_active: true
  });

  // Unwrap params
  useEffect(() => {
    async function unwrapParams() {
      const unwrapped = await params;
      setProductId(unwrapped.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  const loadData = async () => {
    try {
      const [productRes, categoriesRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch('/api/categories')
      ]);
      
      const productData = await productRes.json();
      const categoriesData = await categoriesRes.json();
      
      setProduct(productData);
      setFormData({
        name: productData.name || '',
        slug: productData.slug || '',
        description: productData.description || '',
        price: productData.price || '',
        compare_price: productData.compare_price || '',
        stock_quantity: productData.stock_quantity || '0',
        category_id: productData.category_id || '',
        is_active: productData.is_active !== false
      });
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
          stock_quantity: parseInt(formData.stock_quantity),
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          id: productId
        })
      });

      if (res.ok) {
        router.push('/admin/products');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update product');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="card">
        <h2>Product Not Found</h2>
        <Link href="/admin/products" className="btn-primary">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="admin-form">
      <h1>Edit Product: {product.name}</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-section">
          <h2 className="form-section-title">Basic Information</h2>
          
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
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

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
                required
              />
            </div>

            <div className="form-group">
              <label>Compare Price</label>
              <input
                type="number"
                name="compare_price"
                value={formData.compare_price}
                onChange={handleChange}
                step="0.01"
              />
            </div>
          </div>
        </div>

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

        <div className="form-section">
          <h2 className="form-section-title">Status</h2>
          
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
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}