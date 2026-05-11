'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };
    
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
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
          <Link href="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="/admin/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>Admin</Link>
          <Link href="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>Products</Link>
          <Link href="/cart" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Cart ({cartCount})
          </Link>
          
          {/* Mobile Search */}
          <div className="mobile-search">
            <form onSubmit={handleSearch} className="navbar-search">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="navbar-search-input"
              />
              <button type="submit" className="navbar-search-btn">
                Search
              </button>
            </form>
          </div>
        </div>
        
        {/* Desktop Search */}
        <div className="desktop-search">
          <form onSubmit={handleSearch} className="navbar-search">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
            <button type="submit" className="navbar-search-btn">
              Search
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}