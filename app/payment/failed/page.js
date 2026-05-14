'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FailedContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
      <h1>Payment Failed</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        Your payment could not be processed. Please try again.
      </p>
      {reference && (
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          Reference: {reference}
        </p>
      )}
      <Link href="/cart" className="btn-primary">
        Return to Cart
      </Link>
    </div>
  );
}

export default function PaymentFailed() {
  return (
    <Suspense fallback={<div className="card">Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}