'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || '');
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [selectedCategory, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products?';
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug === selectedCategory ? '' : slug);
    setSearchTerm(''); // Clear search when filtering by category
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
  };

  return (
    <div>

    // Add this hero section at the top of your homepage
        <div className="hero-section">
        <div className="hero-content">
            <h1 className="hero-title">Welcome to E-Store</h1>
            <p className="hero-subtitle">Discover amazing products at great prices</p>
            <Link href="/products" className="btn-primary hero-btn">Shop Now</Link>
        </div>
        </div>

      <h1>All Products</h1>
      
      {/* Search Bar */}
      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '10px', backgroundColor: '#111111', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff' }}
          />
          <button type="submit" className="btn-primary">Search</button>
          {(selectedCategory || searchTerm) && (
            <button type="button" onClick={clearFilters} className="btn-secondary">Clear</button>
          )}
        </form>
      </div>
      
      {/* Category Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={selectedCategory === cat.slug ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '14px', padding: '8px 16px' }}
          >
            {cat.name} ({cat.product_count})
          </button>
        ))}
      </div>
      
      {/* Results Count */}
      <p style={{ color: '#888888', marginBottom: '20px' }}>
        Found {products.length} product{products.length !== 1 ? 's' : ''}
      </p>
      
      {/* Products Grid */}
      {loading ? (
        <div className="card">Loading products...</div>
      ) : (
        <ProductCard products={products} />
      )}
    </div>
  );
}