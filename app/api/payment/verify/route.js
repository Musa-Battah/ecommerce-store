import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.redirect(`${BASE_URL}/payment/failed`);
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
      
      // Redirect to success page
      return NextResponse.redirect(`${BASE_URL}/payment/success?reference=${reference}`);
    } else {
      return NextResponse.redirect(`${BASE_URL}/payment/failed?reference=${reference}`);
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(`${BASE_URL}/payment/failed`);
  }
}