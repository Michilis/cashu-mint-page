import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { analyticsConfig } from '../utils/analytics';

const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/cashu-logo.png" 
              alt="Cashu Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-white">Cashumints.space</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-brand-primary' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/discover"
              className={`text-sm font-medium transition-colors ${
                isActive('/discover') 
                  ? 'text-brand-primary' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Discover
            </Link>
            <a
              href="https://cashu.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              More info
            </a>
            <a
              href="https://docs.cashu.space/wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Wallets
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                // X icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/70" style={{backdropFilter: 'blur(2px)'}}>
          <div
            ref={menuRef}
            className="absolute top-0 right-0 w-64 bg-gray-900 shadow-lg h-full p-8 flex flex-col space-y-6 animate-slide-in"
          >
            <Link
              to="/"
              className={`text-lg font-medium transition-colors ${
                isActive('/') 
                  ? 'text-brand-primary' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/discover"
              className={`text-lg font-medium transition-colors ${
                isActive('/discover') 
                  ? 'text-brand-primary' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Discover
            </Link>
            <a
              href="https://cashu.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-gray-300 hover:text-white transition-colors"
            >
              More info
            </a>
            <a
              href="https://docs.cashu.space/wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-gray-300 hover:text-white transition-colors"
            >
              Wallets
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 