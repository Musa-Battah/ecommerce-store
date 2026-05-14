'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (reference) {
      fetchOrderDetails();
    }
  }, [reference]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${reference}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
      <h1>Payment Successful!</h1>
      <p style={{ color: '#888', marginBottom: '10px' }}>
        Your order has been confirmed.
      </p>
      {reference && (
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>
          Order Reference: <strong>{reference}</strong>
        </p>
      )}
      <Link href="/account/orders" className="btn-primary">
        View My Orders
      </Link>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="card">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}