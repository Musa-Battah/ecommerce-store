'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (reference) {
      fetchOrderDetails();
    }
  }, [reference]);

  const fetchOrderDetails = async () => {
    const res = await fetch(`/api/orders/${reference}`);
    const data = await res.json();
    setOrder(data);
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
      <h1>Payment Successful!</h1>
      <p style={{ color: '#888', marginBottom: '10px' }}>
        Your order has been confirmed.
      </p>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        Order Reference: <strong>{reference}</strong>
      </p>
      <Link href="/account/orders" className="btn-primary">
        View My Orders
      </Link>
    </div>
  );
}