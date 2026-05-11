# 🛍️ E-commerce Store

A complete, full-stack e-commerce platform built with Next.js 16, PostgreSQL, and pure CSS. Features product catalog, shopping cart, checkout process, and admin panel for product management.

## 🚀 Live Demo

[View Live Demo](https://ecommerce-store.vercel.app)

## ✨ Features

### Customer Features
- **Product Catalog** - Browse products with category filtering and search
- **Product Details** - View product images, descriptions, pricing, and stock status
- **Shopping Cart** - Add/remove items, update quantities, persistent storage
- **Checkout Process** - Shipping information, order summary, order confirmation
- **Responsive Design** - Fully mobile-responsive with hamburger menu

### Admin Features
- **Product Management** - Add, edit, and delete products
- **Stock Management** - Track inventory levels with low stock alerts
- **Category Management** - Organize products by categories
- **Order Management** - View and process customer orders

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16 (App Router) |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Neon) |
| **Styling** | Pure CSS (Black & White Theme) |
| **Authentication** | Ready for NextAuth integration |
| **Deployment** | Vercel |

## 📊 Database Schema

```sql
-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),
    images TEXT[],
    is_active BOOLEAN DEFAULT true
);

# Clone the repository
git clone https://github.com/Musa-Battah/ecommerce-store.git
cd ecommerce-store

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

Create .env.local with your database credentials:
PGHOST=your_neon_host
PGPORT=5432
PGDATABASE=neondb
PGUSER=your_user
PGPASSWORD=your_password
PGSSLMODE=require