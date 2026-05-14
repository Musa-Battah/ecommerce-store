import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.redirect(new URL('/payment/failed', process.env.NEXTAUTH_URL));
    }
    
    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
      },
    });
    
    const data = await response.json();
    
    if (data.status && data.data.status === 'success') {
      // Update order status
      await query(
        `UPDATE orders 
         SET status = 'paid', 
             payment_status = 'completed',
             payment_date = NOW()
         WHERE payment_reference = $1`,
        [reference]
      );
      
      return NextResponse.redirect(new URL(`/payment/success?reference=${reference}`, process.env.NEXTAUTH_URL));
    } else {
      return NextResponse.redirect(new URL(`/payment/failed?reference=${reference}`, process.env.NEXTAUTH_URL));
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(new URL('/payment/failed', process.env.NEXTAUTH_URL));
  }
}