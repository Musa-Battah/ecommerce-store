'use client';

import { useState, useEffect } from 'react';

export default function AddToCartButton({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleAddToCart = () => {
    // Get existing cart from localStorage (for guest) or user-specific
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        quantity: quantity,
        image: product.images?.[0]
      });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    
    // Dispatch event for cart count update
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