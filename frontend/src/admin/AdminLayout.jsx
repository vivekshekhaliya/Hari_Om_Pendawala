import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Truck,
  Tag,
  Store,
  Users,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Clock,
  ShieldCheck,
  Power,
  Search,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { reportsApi, shopApi } from '../services/api';

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const { shop, refreshShopSettings } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time metrics for badges
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isTogglingStore, setIsTogglingStore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Protected route check
  if (!isAdmin) {
    navigate('/admin/login', { replace: true, state: { from: location } });
    return null;
  }

  // Live IST Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch quick metrics for sidebar badges
  const fetchBadges = async () => {
    try {
      const res = await reportsApi.getDashboard();
      if (res.data?.success) {
        setDashboardMetrics(res.data);
      }
    } catch (err) {
      console.warn('Sidebar metrics fetch failed:', err.message);
    }
  };

  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Handle Quick Store Open / Close Toggle
  const handleToggleStoreStatus = async () => {
    setIsTogglingStore(true);
    const newStatus = shop.is_store_open ? 0 : 1;
    try {
      await shopApi.updateSettings({
        is_store_open: newStatus,
        existingLogo: shop.logo_url
      });
      await refreshShopSettings();
    } catch (err) {
      console.error('Failed to toggle store status:', err);
    } finally {
      setIsTogglingStore(false);
    }
  };

  const pendingOrdersCount = dashboardMetrics?.kpis?.pending_orders || 0;
  const lowStockCount = dashboardMetrics?.low_stock?.length || 0;

  // Grouped Navigation structure
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'STORE OPERATIONS',
      items: [
        {
          name: 'Orders Management',
          path: '/admin/orders',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} New` : null,
          badgeColor: 'bg-amber-400 text-purple-950 font-black'
        },
        {
          name: 'Products & Variants',
          path: '/admin/products',
          icon: Package,
          badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null,
          badgeColor: 'bg-rose-500 text-white'
        },
        { name: 'Categories', path: '/admin/categories', icon: Layers }
      ]
    },
    {
      title: 'LOGISTICS & STORE',
      items: [
        { name: 'Delivery Settings', path: '/admin/delivery-settings', icon: Truck },
        { name: 'Coupons & Offers', path: '/admin/coupons', icon: Tag },
        { name: 'Shop Branding & Settings', path: '/admin/shop-settings', icon: Store }
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Sales Analytics & Reports', path: '/admin/reports', icon: BarChart3 }
      ]
    }
  ];

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="h-screen w-full bg-stone-100 flex overflow-hidden antialiased selection:bg-purple-900 selection:text-white">
      {/* 1. Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* 2. Admin Sidebar - Permanently Fixed on Desktop */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 h-screen shrink-0 bg-[#393186] text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } border-r border-purple-900/60 shadow-2xl`}
      >
        {/* Top Logo Branding (Pinned - Never Scrolls) */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#2f2771]">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <img
              src={shop.logo_url || '/assets/logo.jpeg'}
              alt="Hari Om Pendawala Logo"
              className="h-11 w-auto object-contain bg-white p-0.5 rounded-xl shadow-md border border-amber-300 group-hover:scale-105 transition-transform"
            />
            <div>
              <h1 className="font-serif font-bold text-sm text-white tracking-wide leading-tight group-hover:text-amber-300 transition-colors">
                Hari Om Pendawala
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 md:hidden transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links with Section Headers (Internal Scroll only if screen is short) */}
        <nav className="p-3.5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-black tracking-widest text-purple-300/70 uppercase">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${isActive
                          ? 'bg-white/15 text-white font-bold shadow-sm backdrop-blur-sm border-l-4 border-amber-400 pl-3'
                          : 'text-purple-200 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${isActive
                              ? 'text-amber-400'
                              : 'text-purple-300 group-hover:text-amber-300'
                            }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight shrink-0 shadow-sm ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Profile, Quick Links & Logout (Pinned - Never Scrolls) */}
        <div className="p-3.5 border-t border-white/10 bg-[#2a2463] shrink-0 space-y-2.5">
          {/* User info card */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-purple-950 font-black flex items-center justify-center text-xs shadow">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate leading-tight">
                  {user?.name || 'Store Admin'}
                </span>
                <span className="text-[10px] text-purple-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-400" />
                  Administrator
                </span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Active"></span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[11px] bg-white/10 hover:bg-white/20 text-purple-100 py-2 px-2.5 rounded-xl transition font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              <span>Live Site</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="flex items-center justify-center gap-1.5 text-[11px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white py-2 px-2.5 rounded-xl transition font-bold border border-rose-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Content Container - Exact full height, header pinned at top */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header Bar - Permanently Pinned at Top (Never Scrolls) */}
        <header className="shrink-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
          {/* Left section: mobile toggle + title + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-700 hover:bg-stone-100 rounded-xl md:hidden transition"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-purple-950 leading-tight">
                  {location.pathname === '/admin/dashboard'
                    ? 'Store Dashboard'
                    : location.pathname.includes('/orders')
                      ? 'Orders & Kitchen'
                      : location.pathname.includes('/products')
                        ? 'Sweet Catalog & Inventory'
                        : location.pathname.includes('/categories')
                          ? 'Categories Management'
                          : location.pathname.includes('/delivery')
                            ? 'Delivery Logistics'
                            : location.pathname.includes('/coupons')
                              ? 'Coupons & Discounts'
                              : location.pathname.includes('/shop')
                                ? 'Shop Branding & Settings'
                                : location.pathname.includes('/customers')
                                  ? 'Customers Directory'
                                  : 'Sales Reports & Analytics'}
                </h2>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Hari Om Pendawala • South Bopal, Ahmedabad
              </p>
            </div>
          </div>

          {/* Compact Center search bar (Desktop) */}
          <form
            onSubmit={handleGlobalSearch}
            className="hidden md:flex items-center relative w-40 lg:w-48 mx-1 sm:mx-2"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-stone-50 border border-purple-200 focus:border-[#393186] focus:bg-white rounded-xl py-1 pl-7 pr-12 text-[11px] text-gray-800 placeholder:text-gray-400 focus:outline-none transition shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-[#393186] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#393186] hover:bg-[#2a2463] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg transition"
            >
              Search
            </button>
          </form>

          {/* Right section: Store Toggle, Clock, Notifications, Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time IST Clock */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-mono text-[11px]">{currentTime || '08:00 AM'}</span>
            </div>

            {/* Interactive Live Store Open / Closed Switcher */}
            <button
              onClick={handleToggleStoreStatus}
              disabled={isTogglingStore}
              title="Click to toggle store open / closed"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-2xs ${shop.is_store_open
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${shop.is_store_open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
              />
              <span className="hidden sm:inline">
                {shop.is_store_open ? 'Store Open & Accepting' : 'Store Paused'}
              </span>
              <span className="sm:hidden font-mono">
                {shop.is_store_open ? 'Open' : 'Closed'}
              </span>
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-900 border border-gray-200 transition"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <strong className="text-purple-950 font-bold">Store Notifications</strong>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pendingOrdersCount > 0 ? (
                      <Link
                        to="/admin/orders"
                        onClick={() => setShowNotifications(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 transition"
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <strong className="block text-amber-950 font-bold">
                            {pendingOrdersCount} Pending Order{pendingOrdersCount > 1 ? 's' : ''}
                          </strong>
                          <span className="text-[11px] text-amber-700">
                            Kitchen confirmation needed
                          </span>
                        </div>
                      </Link>
                    ) : null}

                    {lowStockCount > 0 ? (
                      <Link
                        to="/admin/products"
                        onClick={() => setShowNotifications(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 transition"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                        <div>
                          <strong className="block text-rose-950 font-bold">
                            {lowStockCount} Delicac{lowStockCount > 1 ? 'ies' : 'y'} Low in Stock
                          </strong>
                          <span className="text-[11px] text-rose-700">
                            Reorder or update batch quantity
                          </span>
                        </div>
                      </Link>
                    ) : null}

                    {pendingOrdersCount === 0 && lowStockCount === 0 && (
                      <div className="py-4 text-center text-gray-500">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        <span>All clear! No urgent alerts right now.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action: New Product */}
            <Link
              to="/admin/products"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#393186] hover:bg-[#2e276f] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sweet</span>
            </Link>

            {/* View Customer Website Link */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-purple-900 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition"
            >
              <span>Store Site</span>
              <ExternalLink className="w-3 h-3 text-purple-700" />
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

