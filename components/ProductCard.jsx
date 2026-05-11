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
    // Fallback images based on category
    const fallbacks = {
      'Electronics': 'https://picsum.photos/id/0/400/400',
      'Clothing': 'https://picsum.photos/id/2/400/400',
      'Home & Living': 'https://picsum.photos/id/4/400/400',
      'Books': 'https://picsum.photos/id/20/400/400'
    };
    return fallbacks[product.category_name] || 'https://picsum.photos/id/10/400/400';
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