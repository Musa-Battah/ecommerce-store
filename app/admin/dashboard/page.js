'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { format, subDays } from 'date-fns';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`);
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      } else {
        setError('Failed to load analytics');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="card error-message">{error}</div>;
  if (!data) return null;

  // Prepare chart data
  const salesChartData = data.dailySales.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    revenue: item.revenue,
    orders: item.order_count
  })).reverse();

  // Colors for pie chart
  const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Date Range Selector */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Time Period:</label>
          <select 
            value={days} 
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="modal-input"
            style={{ width: 'auto' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">{formatCurrency(data.revenue.total)}</div>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{data.revenue.orders}</div>
        </div>
        <div className="stat-card">
          <h3>Average Order Value</h3>
          <div className="stat-value">{formatCurrency(data.revenue.avgOrderValue)}</div>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="stat-value">{data.users.total}</div>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <div className="card">
        <h2>Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" tickFormatter={(value) => `₦${value/1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#000000" 
              strokeWidth={2}
              dot={{ fill: '#000000' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Orders Chart */}
      <div className="card">
        <h2>Orders Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#000000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Top Products */}
        <div className="card">
          <h2>Top Products</h2>
          {data.topProducts.length === 0 ? (
            <p>No sales data yet</p>
          ) : (
            <div className="table-container">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((product, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '500' }}>{product.product_name}</td>
                      <td>{product.total_sold}</td>
                      <td>{formatCurrency(product.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* User Stats */}
        <div className="card">
          <h2>Customer Insights</h2>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
              {data.users.total}
            </div>
            <p>Total Registered Customers</p>
            <hr style={{ margin: '20px 0', borderColor: '#333' }} />
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                  +{data.users.new7d}
                </div>
                <p>Last 7 days</p>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                  +{data.users.new30d}
                </div>
                <p>Last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
                Find the low stock alerts table 
{data.lowStockProducts.length > 0 && (
  <div className="card" style={{ borderColor: '#ff4444' }}>
    <h2 style={{ color: '#ff4444' }}>⚠️ Low Stock Alerts</h2>
    <div className="table-container">
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock Left</th>
          </tr>
        </thead>
        <tbody>
          {data.lowStockProducts.map((product, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: '500' }}>{product.name}</td>
              <td style={{ color: '#ff4444', fontWeight: 'bold' }}>
                {product.stock_quantity} left
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}      
      {/* Recent Orders */}
      <div className="card">
        <h2>Recent Orders</h2>
        {data.recentOrders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <div className="table-container">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{format(new Date(order.created_at), 'MMM dd, yyyy')}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}