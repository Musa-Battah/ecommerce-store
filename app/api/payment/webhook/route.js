import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-paystack-signature');
    const body = await request.text();
    
    const hash = crypto
      .createHmac('sha512', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const event = JSON.parse(body);
    
    // Handle different events
    switch (event.event) {
      case 'charge.success':
        const { reference, metadata } = event.data;
        
        await query(
          `UPDATE orders 
           SET status = 'paid', 
               payment_status = 'completed',
               payment_date = NOW()
           WHERE payment_reference = $1`,
          [reference]
        );
        
        // Clear user's cart after successful payment
        if (metadata?.user_id) {
          await query(
            'DELETE FROM carts WHERE user_id = $1',
            [metadata.user_id]
          );
        }
        break;
        
      case 'charge.failed':
        // Handle failed payment
        break;
        
      default:
        console.log(`Unhandled event: ${event.event}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}