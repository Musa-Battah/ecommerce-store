import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Verify admin access
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    // Total Revenue
    const revenueResult = await query(`
      SELECT COALESCE(SUM(total), 0) as total_revenue,
             COUNT(*) as total_orders,
             COALESCE(AVG(total), 0) as avg_order_value
      FROM orders o
      WHERE o.status != 'cancelled'
        AND o.created_at >= NOW() - INTERVAL '${days} days'
    `);
    
    // Daily Sales for chart
    const dailySales = await query(`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(o.total), 0) as revenue
      FROM orders o
      WHERE o.status != 'cancelled'
        AND o.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    
    // Top Products
    const topProducts = await query(`
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
        AND o.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY oi.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    
    // User statistics
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7d
      FROM users
    `);
    
    // Recent Orders
    const recentOrders = await query(`
      SELECT 
        id, order_number, total, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    // Stock Alerts (low stock products) - FIXED: removed sku column
    const lowStockProducts = await query(`
      SELECT name, stock_quantity
      FROM products
      WHERE stock_quantity <= 5 AND is_active = true
      ORDER BY stock_quantity ASC
      LIMIT 10
    `);
    
    return NextResponse.json({
      revenue: {
        total: parseFloat(revenueResult.rows[0].total_revenue),
        orders: parseInt(revenueResult.rows[0].total_orders),
        avgOrderValue: parseFloat(revenueResult.rows[0].avg_order_value)
      },
      dailySales: dailySales.rows,
      topProducts: topProducts.rows,
      users: {
        total: parseInt(userStats.rows[0].total_users),
        new30d: parseInt(userStats.rows[0].new_users_30d),
        new7d: parseInt(userStats.rows[0].new_users_7d)
      },
      recentOrders: recentOrders.rows,
      lowStockProducts: lowStockProducts.rows
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}