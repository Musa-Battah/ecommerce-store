'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    setLoading(false);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    if (confirm('Clear your entire cart?')) {
      setCart([]);
      localStorage.setItem('cart', '[]');
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 5000;
  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + shipping + tax;

  if (loading) {
    return <div className="card">Loading cart...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: '#888888', marginBottom: '20px' }}>
          Looks like you haven't added any items yet.
        </p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Shopping Cart</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        {/* Cart Items */}
        <div className="card">
          <div className="table-container">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/products/${item.slug}`} style={{ color: '#ffffff', textDecoration: 'none' }}>
                        {item.name}
                      </Link>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="btn-small"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="btn-small"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                    <td>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="btn-small"
                        style={{ backgroundColor: '#ff4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={clearCart} className="btn-secondary">
              Clear Cart
            </button>
            <Link href="/products" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="card">
          <h2>Order Summary</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222222' }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222222' }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222222' }}>
              <span>Tax (7.5% VAT)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '20px', fontWeight: 'bold' }}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          
          <Link href="/checkout" className="btn-primary" style={{ textAlign: 'center', display: 'block', width: '100%' }}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}