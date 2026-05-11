'use client';

import { useState } from 'react';

export default function AddToCartButton({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        quantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    
    // Dispatch custom event to update cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        <label>Quantity:</label>
        <input
          type="number"
          min="1"
          max={product.stock_quantity}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(product.stock_quantity, Math.max(1, parseInt(e.target.value) || 1)))}
          style={{ width: '70px', padding: '8px', backgroundColor: '#111111', border: '1px solid #333333', borderRadius: '4px', color: '#ffffff' }}
        />
      </div>
      
      <button 
        onClick={handleAddToCart} 
        className="btn-primary"
        disabled={product.stock_quantity === 0}
        style={{ width: '100%', opacity: product.stock_quantity === 0 ? 0.5 : 1 }}
      >
        {added ? '✓ Added to Cart!' : 'Add to Cart'}
      </button>
    </div>
  );
}