'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });

  useEffect(() => {
    fetchUserAndCart();
  }, []);

  const fetchUserAndCart = async () => {
    try {
      // Fetch user
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        setFormData(prev => ({
          ...prev,
          fullName: userData.user.name,
          email: userData.user.email
        }));
      }
      
      // Fetch cart
      const cartKey = userRes.ok && user ? `cart_${user.id}` : 'cart_guest';
      const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      setCart(savedCart);
    } catch (err) {
      console.error('Error:', err);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 5000;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state) {
      setError('Please fill in all required fields');
      setProcessing(false);
      return;
    }
    
    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cart,
          subtotal,
          shipping,
          tax,
          total,
          userId: user?.id
        })
      });
      
      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const order = await orderRes.json();
      
      // Initialize payment with Paystack
      const paymentRes = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: formData.email,
          orderId: order.id,
          metadata: {
            cart_items: cart,
            customer: formData,
            order_number: order.order_number
          }
        })
      });
      
      const payment = await paymentRes.json();
      
      if (payment.success && payment.authorization_url) {
        // Clear cart from localStorage
        const cartKey = user ? `cart_${user.id}` : 'cart_guest';
        localStorage.removeItem(cartKey);
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Redirect to Paystack payment page
        window.location.href = payment.authorization_url;
      } else {
        setError(payment.error || 'Payment initialization failed');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
    'Taraba', 'Yobe', 'Zamfara'
  ];

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '60px' }}>Loading checkout...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: '#888', marginBottom: '20px' }}>Add items to your cart before checking out.</p>
        <a href="/products" className="btn-primary" style={{ textDecoration: 'none' }}>Continue Shopping</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Checkout</h1>
      
      {error && (
        <div className="card" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444', marginBottom: '20px' }}>
          <p style={{ color: '#ef4444' }}>⚠️ {error}</p>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
        {/* Shipping Information Form */}
        <form onSubmit={handlePayment} className="card">
          <h2>Shipping Information</h2>
          
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
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
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08012345678"
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
              placeholder="Street address"
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
                placeholder="Lagos"
                required
              />
            </div>
            
            <div className="form-group">
              <label>State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                {nigerianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" required style={{ width: 'auto' }} />
              I agree to the <a href="#" style={{ color: '#4CAF50' }}>Terms and Conditions</a>
            </label>
          </div>
          
          <button type="submit" className="btn-primary" disabled={processing} style={{ width: '100%' }}>
            {processing ? 'Processing...' : `Pay ${formatPrice(total)} with Paystack`}
          </button>
        </form>
        
        {/* Order Summary */}
        <div className="card">
          <h2>Order Summary</h2>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '12px', color: '#888' }}>Quantity: {item.quantity}</div>
                </div>
                <div>{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          
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
              <span style={{ color: '#4CAF50' }}>{formatPrice(total)}</span>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#888', textAlign: 'center' }}>
              <p>🔒 Secure payment powered by Paystack</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>We accept all Nigerian cards and bank transfers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}