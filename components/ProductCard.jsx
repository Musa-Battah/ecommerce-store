'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ products }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    // Cloudinary placeholder if no image
    return 'https://placehold.co/400x400/1a1a1a/ffffff?text=No+Image';
  };
  
  if (products.length === 0) {
    return <div className="card">No products found.</div>;
  }
  
  return (
    <div className="product-grid">
      {products.map(product => (
        <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <div className="product-card">
            <div className="product-image-container">
              <img 
                src={getImageUrl(product)} 
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
              {product.compare_price && product.compare_price > product.price && (
                <span className="product-badge">Sale</span>
              )}
            </div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-category">{product.category_name || 'Uncategorized'}</p>
            <div className="product-price-row">
              <span className="product-price">{formatPrice(product.price)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="product-compare-price">{formatPrice(product.compare_price)}</span>
              )}
            </div>
            {product.stock_quantity > 0 ? (
              product.stock_quantity < 5 ? (
                <p className="product-stock low-stock">Only {product.stock_quantity} left!</p>
              ) : (
                <p className="product-stock in-stock">In Stock</p>
              )
            ) : (
              <p className="product-stock out-of-stock">Out of Stock</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}