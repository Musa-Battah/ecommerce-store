import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET single product
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    const result = await query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
    `, [slug]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update product
export async function PUT(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, slug: newSlug, description, price, compare_price, stock_quantity, category_id, is_active } = body;
    
    const result = await query(`
      UPDATE products 
      SET name = $1, slug = $2, description = $3, price = $4, 
          compare_price = $5, stock_quantity = $6, category_id = $7, is_active = $8
      WHERE slug = $9
      RETURNING *
    `, [name, newSlug, description, price, compare_price, stock_quantity, category_id, is_active, slug]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  try {
    const { slug } = await params;
    
    const result = await query(
      'DELETE FROM products WHERE slug = $1 RETURNING id',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}