'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const updateCartCount = () => {
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const isActive = (path) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          🛍️ <span>E-Store</span>
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link href="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Products
          </Link>
          <Link href="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Cart ({cartCount})
          </Link>
          
          {user ? (
            <>
              {/* Admin Dropdown - Only visible to admin users */}
              {user.role === 'admin' && (
                <div className="dropdown">
                  <button 
                    className="dropdown-toggle nav-link"
                    onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  >
                    Admin Panel ▼
                  </button>
                  {isAdminDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link href="/admin/products" className="dropdown-item" onClick={() => {
                        setIsMenuOpen(false);
                        setIsAdminDropdownOpen(false);
                      }}>
                        📦 Manage Products
                      </Link>
                      <Link href="/admin/products/new" className="dropdown-item" onClick={() => {
                        setIsMenuOpen(false);
                        setIsAdminDropdownOpen(false);
                      }}>
                        ➕ Add New Product
                      </Link>
                      <Link href="/admin/orders" className="dropdown-item" onClick={() => {
                        setIsMenuOpen(false);
                        setIsAdminDropdownOpen(false);
                      }}>
                        📋 Manage Orders
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              <Link href="/account" className={`nav-link ${isActive('/account') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                My Account
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link href="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
        
        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="desktop-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search-input"
          />
          <button type="submit" className="navbar-search-btn">Search</button>
        </form>
      </div>
      
      {/* Mobile Search */}
      {isMenuOpen && (
        <div className="mobile-search">
          <form onSubmit={handleSearch} className="navbar-search">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
            <button type="submit" className="navbar-search-btn">Search</button>
          </form>
        </div>
      )}
    </nav>
  );
}