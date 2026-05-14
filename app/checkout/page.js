'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
      
      const cartKey = user ? `cart_${user.id}` : 'cart_guest';
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 5000;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handlePayment = async () => {
  setProcessing(true);
  
  try {
    // Save order to database
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
    
    const order = await orderRes.json();
    
    // Initialize payment
    const paymentRes = await fetch('/api/payment/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total,
        email: formData.email,
        orderId: order.id,
        metadata: {
          cart_items: cart,
          customer: formData
        }
      })
    });
    
    const payment = await paymentRes.json();
    
    if (payment.success) {
      // Redirect to Paystack payment page
      window.location.href = payment.authorization_url;
    } else {
      alert('Payment initialization failed: ' + payment.error);
      setProcessing(false);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to process payment');
    setProcessing(false);
  }
};


  if (loading) return <div className="card">Loading...</div>;

  if (cart.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div>
      <h1>Checkout</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
        {/* Shipping Form */}
        <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="card">
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
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" required />
              I agree to the <a href="#">Terms and Conditions</a>
            </label>
          </div>
        </form>
        
        {/* Order Summary */}
        <div className="card">
          <h2>Your Order</h2>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
                <div>
                  {item.name} × {item.quantity}
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
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          
          <button 
            onClick={handlePayment} 
            className="btn-primary" 
            disabled={processing}
            style={{ width: '100%' }}
          >
            {processing ? 'Processing...' : `Pay ${formatPrice(total)} with Paystack`}
          </button>
          
          <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '15px', color: '#888' }}>
            🔒 Secure payment powered by Paystack
          </p>
        </div>
      </div>
    </div>
  );
}