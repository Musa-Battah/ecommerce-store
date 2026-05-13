'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
        // Load orders from localStorage (in real app, from API)
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const userOrders = savedOrders.filter(o => o.userId === data.user.id);
        setOrders(userOrders.reverse());
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Error:', err);
      router.push('/login');
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

  if (loading) return <div className="card">Loading...</div>;

  return (
    <div>
      <h1>My Account</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Profile Information</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Quick Links</h3>
          <Link href="/account/orders" className="btn-primary" style={{ width: '100%', marginBottom: '10px', textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            My Orders
          </Link>
          <Link href="/cart" className="btn-secondary" style={{ width: '100%', textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            View Cart
          </Link>
        </div>
      </div>
      
      <div className="card">
        <h2>Recent Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet. <Link href="/products">Start shopping →</Link></p>
        ) : (
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.orderNumber}>
                    <td>{order.orderNumber}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td><span className="status-pending">{order.status}</span></td>
                    <td><Link href={`/account/orders/${order.orderNumber}`}>View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}