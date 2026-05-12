'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrdersPage() {
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
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const userOrders = allOrders.filter(o => o.userId === data.user.id);
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
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>You haven't placed any orders yet.</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.orderNumber}>
                    <td>{order.orderNumber}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>{order.items.length} item(s)</td>
                    <td>{formatPrice(order.total)}</td>
                    <td><span className={`status-${order.status}`}>{order.status}</span></td>
                    <td><Link href={`/account/orders/${order.orderNumber}`}>View Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}