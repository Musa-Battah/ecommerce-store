import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET all products
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  try {
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      sql += ` AND c.slug = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }
    
    sql += ` ORDER BY p.created_at DESC`;
    
    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new product (admin only - no auth yet)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, description, price, compare_price, stock_quantity, category_id, images } = body;
    
    if (!name || !slug || !price) {
      return NextResponse.json({ error: 'Name, slug, and price are required' }, { status: 400 });
    }
    
    // Check if slug exists
    const existing = await query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Product slug already exists' }, { status: 409 });
    }
    
    const result = await query(`
      INSERT INTO products (name, slug, description, price, compare_price, stock_quantity, category_id, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, slug, description, price, compare_price || null, stock_quantity || 0, category_id || null, images || null]);
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}