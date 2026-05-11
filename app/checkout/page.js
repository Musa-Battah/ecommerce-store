'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'cash_on_delivery'
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      router.push('/cart');
    }
    setCart(savedCart);
    setLoading(false);
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate order processing
    setTimeout(() => {
      // Generate order number
      const orderNumber = 'ORD-' + Date.now();
      
      // Save order to localStorage (in real app, this would go to database)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({
        orderNumber,
        date: new Date().toISOString(),
        items: cart,
        customer: formData,
        subtotal,
        shipping,
        tax,
        total,
        status: 'pending'
      });
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Clear cart
      localStorage.setItem('cart', '[]');
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Redirect to confirmation
      router.push(`/checkout/confirmation?order=${orderNumber}`);
    }, 1500);
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      <h1>Checkout</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="card">
          <h2>Shipping Information</h2>
          
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>
          
          <h2 style={{ marginTop: '20px' }}>Payment Method</h2>
          
          <div className="form-group">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked={formData.paymentMethod === 'cash_on_delivery'}
                onChange={handleChange}
              />
              {' '} Cash on Delivery
            </label>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={formData.paymentMethod === 'bank_transfer'}
                onChange={handleChange}
              />
              {' '} Bank Transfer
            </label>
          </div>
        </form>
        
        {/* Order Summary */}
        <div className="card">
          <h2>Your Order</h2>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222222' }}>
                <div>
                  {item.name} × {item.quantity}
                </div>
                <div>{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          
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
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          
          <button type="submit" onClick={handleSubmit} className="btn-primary" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}