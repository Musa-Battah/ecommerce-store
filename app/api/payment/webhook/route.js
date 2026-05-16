import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const event = body;
    
    console.log('Webhook received from Pipedream router:', event.event);
    
    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      
      console.log(`Processing payment for reference: ${reference}`);
      
      // Update order status
      await query(
        `UPDATE orders 
         SET status = 'paid', 
             payment_status = 'completed',
             payment_date = NOW()
         WHERE payment_reference = $1`,
        [reference]
      );
      
      // Clear user's cart if user_id exists in metadata
      if (metadata?.user_id) {
        await query(
          'DELETE FROM carts WHERE user_id = $1',
          [metadata.user_id]
        );
      }
      
      console.log(`Payment successful for reference: ${reference}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}