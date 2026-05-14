import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { amount, email, orderId, metadata } = await request.json();
    
    const reference = `ORDER-${orderId}-${Date.now()}`;
    
    // Save payment reference to order
    await query(
      'UPDATE orders SET payment_reference = $1 WHERE id = $2',
      [reference, orderId]
    );
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to kobo and ensure integer
        email: email,
        reference: reference,
        metadata: {
          order_id: orderId,
          user_id: decoded.userId,
          ...metadata
        },
        callback_url: `${process.env.NEXTAUTH_URL}/api/payment/verify`,
      }),
    });
    
    const data = await response.json();
    
    if (data.status) {
      return NextResponse.json({
        success: true,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference
      });
    } else {
      console.error('Paystack error:', data);
      return NextResponse.json({ error: data.message }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}