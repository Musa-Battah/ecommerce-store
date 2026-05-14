import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    
    const body = await request.json();
    const { fullName, email, phone, address, city, state, postalCode, items, subtotal, shipping, tax, total } = body;
    
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Insert order
    const orderResult = await query(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_state, shipping_postal_code,
        subtotal, shipping_cost, tax, total, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      orderNumber, decoded.userId, fullName, email, phone,
      address, city, state, postalCode,
      subtotal, shipping, tax, total, 'pending'
    ]);
    
    const order = orderResult.rows[0];
    
    // Insert order items
    for (const item of items) {
      await query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [order.id, item.id, item.name, item.quantity, item.price, item.price * item.quantity]);
    }
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}