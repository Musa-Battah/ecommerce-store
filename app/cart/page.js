'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

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
      console.error('Error:', err);
    }
    loadCart();
  };

  const loadCart = () => {
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';
    const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    setCart(savedCart);
    setLoading(false);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
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
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;

  if (loading) return <div className="card">Loading cart...</div>;

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
                    <td style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img 
                        src={item.image || '/placeholder.jpg'} 
                        alt={item.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <Link href={`/products/${item.slug}`} style={{ color: '#ffffff', textDecoration: 'none' }}>
                        {item.name}
                      </Link>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn-small">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn-small">+</button>
                      </div>
                    </td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                    <td>
                      <button onClick={() => removeItem(item.id)} className="btn-small" style={{ backgroundColor: '#ff4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px' }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <Link href="/products" className="btn-secondary">Continue Shopping</Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="card">
          <h2>Order Summary</h2>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
              <span>Tax (7.5% VAT)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '20px', fontWeight: 'bold' }}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          
          <Link href="/checkout" className="btn-primary" style={{ textAlign: 'center', display: 'block' }}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}