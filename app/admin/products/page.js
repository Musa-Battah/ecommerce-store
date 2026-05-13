'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id, name) => {
    if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchProducts();
        } else {
          alert('Failed to delete product');
        }
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) return <div className="card">Loading products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin - Products</h1>
        <Link href="/admin/products/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Add New Product
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        📷
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: '500' }}>{product.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock_quantity}</td>
                  <td>{product.category_name || '-'}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: product.is_active ? '#4CAF50' : '#ff4444',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link 
                        href={`/admin/products/${product.id}/edit`} 
                        className="btn-small"
                        style={{ padding: '4px 12px', textDecoration: 'none', backgroundColor: '#4CAF50', color: '#fff', borderRadius: '4px' }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id, product.name)}
                        className="btn-small"
                        style={{ backgroundColor: '#ff4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}