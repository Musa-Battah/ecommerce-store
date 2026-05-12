import { query } from '@/lib/db';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

async function getFeaturedProducts() {
  const result = await query(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT 6
  `);
  return result.rows;
}

async function getCategories() {
  const result = await query(`
    SELECT * FROM categories ORDER BY name
  `);
  return result.rows;
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();
  
  return (
    <div>
      {/* Hero Section */}
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Welcome to E-Store</h1>
        <p style={{ fontSize: '18px', color: '#cccccc', marginBottom: '30px' }}>
          Discover amazing products at great prices
        </p>
        <Link href="/products" className="btn-primary">
          Shop Now
        </Link>
      </div>
      
      {/* Categories */}
      {/* <h2>Shop by Category</h2>
      <div className="product-grid">
        {categories.map(category => (
          <Link key={category.id} href={`/products?category=${category.slug}`} style={{ textDecoration: 'none' }}>
            <div className="product-card" style={{ textAlign: 'center' }}>
              <h3>{category.name}</h3>
              <p style={{ color: '#888888', marginTop: '10px' }}>{category.product_count || 0} products</p>
            </div>
          </Link>
        ))}
      </div> */}
      
      {/* Featured Products */}
      <h2 style={{ marginTop: '40px' }}>Featured Products</h2>
      <ProductCard products={featuredProducts} />
    </div>
  );
};