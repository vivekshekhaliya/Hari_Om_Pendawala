import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Phone, Menu, X, User, ChevronDown, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { totalItemsCount, subtotal, openCart } = useCart();
  const { shop } = useShop();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isLinkActive = (linkPath) => {
    if (linkPath === '/') {
      return location.pathname === '/';
    }
    if (linkPath.includes('?')) {
      return location.pathname + location.search === linkPath;
    }
    return location.pathname === linkPath;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Sweets & Namkeen', path: '/menu' },
    { name: 'Gift Hampers', path: '/menu?category=gift-boxes', badge: 'Special' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Store', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200/70 transition-all">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Shop Branding */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 shrink group">
            <img
              src={shop.logo_url || '/assets/logo.jpeg'}
              alt="Hari Om Pendawala Logo"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain rounded-md border border-stone-200 shadow-xs bg-white p-0.5 shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-sm sm:text-xl md:text-2xl text-[#393186] tracking-tight leading-tight truncate group-hover:text-[#2a2463] transition">
                Hari Om Pendawala
              </span>
              <span className="text-[9px] sm:text-xs text-amber-700 font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1 truncate">
                Sweet &amp; Namkeen <span className="text-stone-300">•</span> <span className="text-green-700 font-bold">Amreliwala</span>
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Thabdi Penda, Kaju Katli, Gathiya, Farsan..."
                className="w-full bg-stone-50 border border-stone-200 focus:border-[#393186] rounded-full py-2 pl-10 pr-24 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#393186]/15 transition"
              />
              <Search className="w-4 h-4 text-[#393186] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#393186] hover:bg-[#2c2668] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition shadow-xs"
              >
                Search
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Call Store (Mobile quick call icon) */}
            <a
              href={`tel:${shop.phone || '+919712247979'}`}
              className="p-2 text-[#393186] hover:bg-[#393186]/10 rounded-full transition shrink-0"
              title="Call Store"
              aria-label="Call Store"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            {/* User Account Dropdown (Desktop & Tablet) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-[#393186] py-1.5 px-2.5 rounded-lg hover:bg-stone-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#393186]/10 flex items-center justify-center text-[#393186]">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate">
                  {user ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200/80 py-2 z-50 animate-fadeIn"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-[#393186] truncate">{user.name}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 bg-[#393186]/10 text-[#393186] rounded">
                          {user.role === 'admin' ? 'Store Administrator' : 'Customer'}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#393186] hover:bg-[#393186]/5 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#393186]" />
                          Admin Panel
                        </Link>
                      )}

                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#393186]/5 hover:text-[#393186]"
                      >
                        My Profile &amp; Addresses
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#393186]/5 hover:text-[#393186]"
                      >
                        My Orders
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-[#393186] hover:bg-[#393186]/5"
                      >
                        Customer Login / Register
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#393186]/5 hover:text-[#393186]"
                      >
                        Track Order Status
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        to="/admin/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Portal Login
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center gap-1.5 bg-[#393186] hover:bg-[#2c2668] text-white p-2 sm:px-3.5 sm:py-2 rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 shrink-0"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse-subtle">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline-block font-semibold text-xs sm:text-sm">
                {subtotal > 0 ? `₹${subtotal}` : 'Cart'}
              </span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-[#393186] hover:bg-stone-100 rounded-lg transition shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#393186]" /> : <Menu className="w-5 h-5 text-[#393186]" />}
            </button>
          </div>
        </div>

        {/* Search Bar (Mobile) */}
        <div className="lg:hidden mt-2 pt-2 border-t border-stone-100">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Thabdi Penda, Kaju Katli, Namkeen..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-[#393186] rounded-full py-1.5 pl-8 pr-20 text-xs text-gray-800 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#393186] absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#393186] text-white text-[11px] px-3 py-1 rounded-full font-medium shadow-xs"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 3. Category & Navigation Links Bar (Desktop) - Luxury Boutique Aesthetic */}
      <nav className="hidden md:block bg-white border-t border-b border-stone-200/80 shadow-[0_2px_8px_-3px_rgba(57,49,134,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <ul className="flex items-center space-x-1 sm:space-x-2 lg:space-x-8 text-sm overflow-x-auto scrollbar-none py-0.5">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.path);
                return (
                  <li key={link.name} className="shrink-0">
                    <Link
                      to={link.path}
                      className={`relative inline-flex items-center gap-1.5 py-3 px-3 text-[13.5px] font-medium tracking-wide transition-colors duration-150 ${
                        isActive
                          ? 'text-[#393186] font-bold'
                          : 'text-stone-600 hover:text-[#393186]'
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 leading-none">
                          {link.badge}
                        </span>
                      )}
                      {/* Active indicator bar - only on current active page */}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#393186] rounded-t-full shadow-xs" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Premium boutique reassurance badge on right */}
            <div className="hidden xl:flex items-center gap-2 py-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200/70 rounded-full text-[12px] text-stone-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-[#393186]">100% Pure Desi Ghee</span> Delicacies
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 shadow-2xl px-4 pt-3 pb-6 space-y-2 animate-fadeIn max-h-[85vh] overflow-y-auto">
          {/* User Account / Auth Card */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 mb-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#393186] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-stone-500 font-medium">{user.phone || user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[11px] font-semibold text-[#393186] hover:underline"
                  >
                    Profile
                  </Link>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-[11px] font-semibold text-red-600 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#393186]/10 text-[#393186] flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 leading-tight">Welcome, Guest</p>
                    <p className="text-[10px] text-stone-500">Sign in to track orders</p>
                  </div>
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[#393186] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#393186]/10 text-[#393186] font-bold border-l-4 border-[#393186]'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-[#393186]'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Call Store & Admin Panel */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <a
              href={`tel:${shop.phone || '+919712247979'}`}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-green-800 bg-green-50 border border-green-200/80 rounded-xl transition"
            >
              <Phone className="w-3.5 h-3.5 text-green-700" />
              <span>Call Store: {shop.phone || '+91 97122 47979'}</span>
            </a>

            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#393186] bg-[#393186]/5 hover:bg-[#393186]/10 rounded-xl transition"
            >
              <ShieldCheck className="w-4 h-4 text-[#393186]" />
              Shop Owner / Admin Panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
