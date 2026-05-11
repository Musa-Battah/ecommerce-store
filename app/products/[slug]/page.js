'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [slug, setSlug] = useState(null);

  // Unwrap params Promise
  useEffect(() => {
    async function unwrapParams() {
      const unwrappedParams = await params;
      setSlug(unwrappedParams.slug);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      setProduct(data);
      setSelectedImage(0);
      
      // Load related products
      if (data.category_id && data.category_slug) {
        const relatedRes = await fetch(`/api/products?category=${data.category_slug}`);
        const relatedData = await relatedRes.json();
        setRelatedProducts(relatedData.filter(p => p.id !== data.id).slice(0, 4));
      }
    } catch (err) {
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = () => {
    if (product?.images && product.images.length > 0) {
      return product.images[selectedImage];
    }
    return 'https://picsum.photos/id/10/600/400';
  };

  if (loading) {
    return <div className="card">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="card">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <Link href="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images || ['https://picsum.photos/id/10/600/400'];

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', color: '#888888' }}>
        <Link href="/" style={{ color: '#888888', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <Link href="/products" style={{ color: '#888888', textDecoration: 'none' }}>Products</Link>
        {' / '}
        <span style={{ color: '#ffffff' }}>{product.name}</span>
      </div>
      
      {/* Product Details */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Product Images */}
          <div>
            <img 
              src={getImageUrl()} 
              alt={product.name}
              className="product-detail-image"
            />
            {images.length > 1 && (
              <div className="product-detail-thumbnails">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className={`product-thumbnail ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <h1 style={{ marginBottom: '10px' }}>{product.name}</h1>
            <p style={{ color: '#888888', marginBottom: '15px' }}>
              Category: <Link href={`/products?category=${product.category_slug}`} style={{ color: '#888888' }}>{product.category_name}</Link>
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatPrice(product.price)}</span>
              {product.compare_price && (
                <span style={{ fontSize: '20px', color: '#888888', textDecoration: 'line-through', marginLeft: '15px' }}>
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>
            
            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>{product.description || 'No description available.'}</p>
            
            <div style={{ marginBottom: '20px' }}>
              {product.stock_quantity > 0 ? (
                product.stock_quantity < 5 ? (
                  <p style={{ color: '#ffaa44' }}>⚠️ Only {product.stock_quantity} left in stock!</p>
                ) : (
                  <p style={{ color: '#4CAF50' }}>✅ In Stock ({product.stock_quantity} available)</p>
                )
              ) : (
                <p style={{ color: '#ff4444' }}>❌ Out of Stock</p>
              )}
            </div>
            
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 style={{ marginTop: '40px' }}>You May Also Like</h2>
          <div className="product-grid">
            {relatedProducts.map(related => (
              <Link key={related.id} href={`/products/${related.slug}`} style={{ textDecoration: 'none' }}>
                <div className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={related.images?.[0] || 'https://picsum.photos/id/10/400/400'} 
                      alt={related.name}
                      className="product-image"
                    />
                  </div>
                  <h3 className="product-name">{related.name}</h3>
                  <div className="product-price-row">
                    <span className="product-price">{formatPrice(related.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}