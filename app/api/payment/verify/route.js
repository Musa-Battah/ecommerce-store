import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.json({ error: 'No reference provided' }, { status: 400 });
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
      
      // Return success page HTML or redirect
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Payment Successful</title>
            <script>
              window.location.href = '/payment/success?reference=${reference}';
            </script>
          </head>
          <body>
            Redirecting...
          </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    } else {
      // Return failure page HTML
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Payment Failed</title>
            <script>
              window.location.href = '/payment/failed?reference=${reference}';
            </script>
          </head>
          <body>
            Redirecting...
          </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}