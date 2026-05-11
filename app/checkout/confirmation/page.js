'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderNumber) {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = orders.find(o => o.orderNumber === orderNumber);
      setOrder(foundOrder);
    }
  }, [orderNumber]);

  if (!order) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Order Not Found</h2>
        <Link href="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Return to Home
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div>
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h1 style={{ color: '#4CAF50' }}>🎉 Order Confirmed!</h1>
        <p style={{ fontSize: '18px', marginTop: '10px' }}>Thank you for your purchase!</p>
        <p style={{ color: '#888888', marginTop: '10px' }}>Order Number: <strong>{order.orderNumber}</strong></p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Order Details */}
        <div className="card">
          <h2>Order Details</h2>
          <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span style={{ color: '#f59e0b' }}>{order.status}</span></p>
          
          <h3 style={{ marginTop: '20px' }}>Items</h3>
          {order.items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222222' }}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          
          <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #222222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total:</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
        
        {/* Shipping Information */}
        <div className="card">
          <h2>Shipping Information</h2>
          <p><strong>{order.customer.fullName}</strong></p>
          <p>{order.customer.address}</p>
          <p>{order.customer.city}, {order.customer.state} {order.customer.postalCode}</p>
          <p><strong>Email:</strong> {order.customer.email}</p>
          <p><strong>Phone:</strong> {order.customer.phone}</p>
          <p><strong>Payment Method:</strong> {order.customer.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}