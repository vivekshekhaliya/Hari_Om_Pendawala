import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Package,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Eye,
  Phone,
  MessageCircle,
  Truck,
  Plus,
  Printer,
  X,
  MapPin,
  Calendar,
  Layers,
  Tag,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { reportsApi, ordersApi } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalLoading, setOrderModalLoading] = useState(false);

  const fetchDashboard = async () => {
    setRefreshing(true);
    try {
      const res = await reportsApi.getDashboard();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Auto refresh every 25 seconds
    const interval = setInterval(fetchDashboard, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      fetchDashboard();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleViewOrder = async (orderId) => {
    setOrderModalLoading(true);
    try {
      const res = await ordersApi.getById(orderId);
      if (res.data?.success) {
        setSelectedOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
      // Fallback: look in recent_orders
      const found = data?.recent_orders?.find(o => o.id === orderId);
      if (found) setSelectedOrder(found);
    } finally {
      setOrderModalLoading(false);
    }
  };

  const getWhatsAppLink = (phone, customerName, orderNumber) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(
      `Namaste ${customerName || 'Customer'}! 🙏\nRegarding your order #${orderNumber || ''} at Hari Om Pendawala Sweet & Namkeen (South Bopal, Ahmedabad). How can we assist you with your fresh mithai & farsan?`
    );
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-12 h-12 border-4 border-[#393186] border-t-amber-400 rounded-full animate-spin mb-4" />
        <h3 className="font-serif font-bold text-lg text-purple-950">Loading Store Intelligence...</h3>
        <p className="text-xs text-gray-500 mt-1">Fetching live orders, inventory alerts, and revenue metrics</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const totalOrdersCount = kpis.total_orders || 0;
  const todayOrdersCount = kpis.today_orders || 0;
  const avgOrderValue = todayOrdersCount > 0 ? (kpis.today_sales / todayOrdersCount).toFixed(0) : 0;

  // Pipeline stages calculation
  const pipeline = [
    { label: 'Pending', count: kpis.pending_orders || 0, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Preparing', count: kpis.preparing_orders || 0, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { label: 'Ready', count: kpis.ready_orders || 0, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { label: 'Out for Delivery', count: kpis.out_for_delivery || 0, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { label: 'Delivered', count: kpis.completed_orders || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Executive Operational Greeting & Quick Action Shortcuts */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-[#393186]">
                Live Store Operations
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 font-medium">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-purple-950">
              Hari Om! Welcome to Store Management
            </h1>
            <p className="text-xs text-gray-600 max-w-2xl">
              Track real-time orders, manage Saurashtra mithai preparations, check live delivery statuses, and monitor low-stock inventory.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchDashboard}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-purple-900 border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
              title="Refresh live metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-700' : 'text-purple-600'}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <Link
              to="/admin/orders?status=Pending"
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Pending Orders ({kpis.pending_orders || 0})</span>
            </Link>

            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 bg-[#393186] hover:bg-[#2d266e] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Delicacy</span>
            </Link>
          </div>
        </div>

        {/* Quick Shortcuts Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Quick Links:
          </span>
          <Link
            to="/admin/orders"
            className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-purple-100 text-purple-950 font-medium transition"
          >
            📦 All Orders
          </Link>
          <Link
            to="/admin/products"
            className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-purple-100 text-purple-950 font-medium transition"
          >
            🍬 Product Stock
          </Link>
          <Link
            to="/admin/categories"
            className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-purple-100 text-purple-950 font-medium transition"
          >
            📁 Categories
          </Link>
          <Link
            to="/admin/delivery-settings"
            className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-purple-100 text-purple-950 font-medium transition"
          >
            🚚 Delivery Fees &amp; Slots
          </Link>
          <Link
            to="/admin/coupons"
            className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-purple-100 text-purple-950 font-medium transition"
          >
            🎟️ Discount Coupons
          </Link>
          <Link
            to="/admin/shop-settings"
            className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-purple-100 text-purple-950 font-medium transition"
          >
            ⚙️ Shop Settings
          </Link>
        </div>
      </div>

      {/* 2. Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Sales */}
        <div className="bg-gradient-to-br from-purple-50/70 via-white to-amber-50/30 rounded-3xl p-5 border border-purple-200/70 shadow-sm hover:shadow-md transition-all duration-200 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Today's Sales</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              ₹
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-purple-950 font-sans tracking-tight">
              ₹{Number(kpis.today_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-100/60 text-xs">
              <span className="text-gray-600 font-medium">
                {kpis.today_orders || 0} order{kpis.today_orders === 1 ? '' : 's'} today
              </span>
              {avgOrderValue > 0 && (
                <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                  Avg ₹{avgOrderValue}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-green-50/30 rounded-3xl p-5 border border-emerald-200/70 shadow-sm hover:shadow-md transition-all duration-200 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-purple-950 font-sans tracking-tight">
              ₹{Number(kpis.total_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-100/60 text-xs">
              <span className="text-gray-600 font-medium">
                {totalOrdersCount} total orders placed
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active Store
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Action Needed (Kitchen & Pending) */}
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 rounded-3xl p-5 border border-amber-300 shadow-sm hover:shadow-md transition-all duration-200 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Action Needed</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-amber-800" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-sans tracking-tight">
                {kpis.pending_orders || 0} Pending
              </span>
              {(kpis.pending_orders || 0) > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200/60 text-xs">
              <span className="text-amber-800 font-medium">
                +{kpis.preparing_orders || 0} preparing in kitchen
              </span>
              <Link
                to="/admin/orders?status=Pending"
                className="text-[11px] font-bold text-purple-900 hover:text-purple-700 underline flex items-center gap-0.5"
              >
                Review →
              </Link>
            </div>
          </div>
        </div>

        {/* Card 4: Fulfillment & Delivered */}
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/30 rounded-3xl p-5 border border-blue-200/70 shadow-sm hover:shadow-md transition-all duration-200 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Fulfillment</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-green-700 font-sans tracking-tight">
              {kpis.completed_orders || 0} Delivered
            </span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100/60 text-xs">
              <span className="text-gray-500 font-medium">
                {kpis.cancelled_orders || 0} cancelled
              </span>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                100% Fulfilled
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Live Order Pipeline Progress Bar */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-serif font-bold text-sm text-purple-950 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#393186]" />
              <span>Live Order Workflow Pipeline</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Live status breakdown of all placed orders in the store queue
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-purple-900 hover:text-purple-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Order Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pipeline Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {pipeline.map((stage) => (
            <Link
              key={stage.label}
              to={`/admin/orders?status=${encodeURIComponent(stage.label)}`}
              className={`p-3 rounded-2xl border text-center transition hover:shadow-xs hover:scale-[1.02] ${stage.color}`}
            >
              <span className="block text-xl font-black font-sans">{stage.count}</span>
              <span className="text-[11px] font-bold block truncate">{stage.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Middle Row: Best Sellers & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best Sellers Card */}
        <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-serif font-bold text-base text-purple-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Top Best-Selling Delicacies</span>
              </h3>
              <p className="text-[11px] text-gray-500">Most popular sweets &amp; namkeen by quantity ordered</p>
            </div>
            <Link to="/admin/reports" className="text-xs text-purple-800 font-bold hover:underline flex items-center gap-1">
              <span>Analytics</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data.best_sellers?.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No sales data recorded yet.</p>
            ) : (
              data.best_sellers?.map((b, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[idx] || `#${idx + 1}`;
                return (
                  <div key={idx} className="py-3.5 flex items-center justify-between text-xs hover:bg-stone-50/60 px-2 rounded-xl transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-purple-50 text-purple-900 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-100">
                        {medal}
                      </span>
                      <div className="min-w-0">
                        <strong className="text-gray-900 block truncate">{b.product_name}</strong>
                        <span className="text-gray-500 text-[11px]">{b.total_sold} packs ordered</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-purple-950 font-sans block text-sm">
                        ₹{Number(b.total_revenue).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-green-700 font-semibold">Total Revenue</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-serif font-bold text-base text-purple-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Low-Stock Inventory Alerts</span>
              </h3>
              <p className="text-[11px] text-gray-500">Variants with stock quantity below threshold</p>
            </div>
            <Link to="/admin/products" className="text-xs text-purple-800 font-bold hover:underline flex items-center gap-1">
              <span>Manage Stock</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data.low_stock?.length === 0 ? (
              <div className="py-10 text-center text-xs text-emerald-800 font-medium flex flex-col items-center justify-center gap-2 bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <strong className="block text-sm font-serif font-bold text-emerald-950">Healthy Inventory!</strong>
                  <span className="text-emerald-700 text-[11px]">All product variants have sufficient stock levels</span>
                </div>
              </div>
            ) : (
              data.low_stock?.map((item) => (
                <div key={item.variant_id} className="py-3 flex items-center justify-between text-xs hover:bg-stone-50/60 px-2 rounded-xl transition">
                  <div className="min-w-0">
                    <strong className="text-gray-900 block truncate">{item.product_name}</strong>
                    <span className="text-gray-500 text-[11px]">Pack: {item.weight_label} • ₹{Number(item.price)}</span>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      {item.stock_quantity} remaining
                    </span>
                    <Link
                      to="/admin/products"
                      className="text-[11px] font-bold text-[#393186] bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 5. Recent Incoming Orders Live Queue Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-purple-950">
                Recent Incoming Orders
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                Live Feed
              </span>
            </div>
            <span className="text-xs text-gray-500">Click any order to view full bill details or contact the customer</span>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-900 hover:text-purple-700 bg-white px-3.5 py-2 rounded-xl border border-purple-200 transition shadow-2xs self-start sm:self-auto"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer &amp; Contact</th>
                <th className="py-3.5 px-4">Delivery Mode</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Quick Update</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.recent_orders?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-medium">No orders placed yet.</p>
                  </td>
                </tr>
              ) : (
                data.recent_orders?.map((ord) => {
                  const whatsappUrl = getWhatsAppLink(ord.customer_phone, ord.customer_name, ord.order_number);
                  const isPickup = ord.delivery_type === 'pickup';

                  return (
                    <tr key={ord.id} className="hover:bg-purple-50/30 transition group">
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-950">
                        <button
                          onClick={() => handleViewOrder(ord.id)}
                          className="hover:text-amber-700 underline text-left block"
                          title="Click to view full order details"
                        >
                          {ord.order_number}
                        </button>
                        <span className="text-[10px] text-gray-400 font-normal block font-sans">
                          {new Date(ord.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer & WhatsApp */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-xs shrink-0">
                            {ord.customer_name?.charAt(0) || 'C'}
                          </div>
                          <div className="min-w-0">
                            <strong className="block text-gray-900 truncate">{ord.customer_name}</strong>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-gray-500 text-[11px] font-mono">{ord.customer_phone}</span>
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Delivery Mode */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isPickup
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                          }`}
                        >
                          {isPickup ? '🛍️ Store Pickup' : '🛵 Home Delivery'}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-black font-sans text-purple-950 text-sm">
                        ₹{Number(ord.total_amount).toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 block w-max">
                          {ord.payment_method}
                        </span>
                        {ord.payment_status && (
                          <span className={`text-[10px] font-bold block mt-0.5 ${
                            ord.payment_status === 'paid' ? 'text-green-700' : 'text-amber-700'
                          }`}>
                            {ord.payment_status === 'paid' ? '● Paid' : '○ Pending'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ord.order_status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : ord.order_status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : ord.order_status === 'Pending'
                            ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                            : 'bg-purple-100 text-purple-900'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ord.order_status === 'Pending' ? 'bg-amber-600 animate-ping' : 'bg-current'
                          }`}></span>
                          <span>{ord.order_status}</span>
                        </span>
                      </td>

                      {/* Quick Update */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={ord.order_status}
                          onChange={(e) => handleQuickStatusChange(ord.id, e.target.value)}
                          className="bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded-xl py-1 px-2.5 focus:outline-none focus:border-[#393186] shadow-2xs cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing in Kitchen</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewOrder(ord.id)}
                          className="inline-flex items-center gap-1 p-1.5 text-purple-900 hover:text-white hover:bg-[#393186] rounded-lg transition"
                          title="View Order Details & Bill"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Quick Order Details & Bill Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#393186] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-purple-950 leading-tight">
                    Order #{selectedOrder.order_number}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Card */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-gray-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">{selectedOrder.customer_name}</span>
                <a
                  href={getWhatsAppLink(selectedOrder.customer_phone, selectedOrder.customer_name, selectedOrder.order_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-mono">{selectedOrder.customer_phone}</span>
                {selectedOrder.customer_email && (
                  <span className="text-gray-500">• {selectedOrder.customer_email}</span>
                )}
              </div>

              <div className="flex items-start gap-2 text-gray-700 pt-1 border-t border-gray-200">
                <MapPin className="w-3.5 h-3.5 text-[#393186] mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  {selectedOrder.address_line || 'Store Pickup: Shop #8, Sun South Park, South Bopal'}
                  {selectedOrder.pincode ? ` - ${selectedOrder.pincode}` : ''}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Order Items &amp; Delicacies
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden text-xs">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-stone-50/50">
                      <div>
                        <strong className="text-gray-900 block font-semibold">{item.product_name}</strong>
                        <span className="text-gray-500 text-[11px]">
                          Variant: {item.variant_label} • Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}
                        </span>
                      </div>
                      <span className="font-bold text-purple-950 font-sans text-sm">
                        ₹{Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Total amount: ₹{Number(selectedOrder.total_amount).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Price Breakdown */}
            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 text-xs space-y-1.5 font-medium">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{Number(selectedOrder.subtotal || selectedOrder.total_amount).toFixed(2)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({selectedOrder.coupon_code || 'Coupon'}):</span>
                  <span>-₹{Number(selectedOrder.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span>{Number(selectedOrder.delivery_charge) > 0 ? `₹${Number(selectedOrder.delivery_charge).toFixed(2)}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-purple-950 font-black text-sm pt-2 border-t border-purple-200">
                <span>Grand Total:</span>
                <span>₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-gray-800 px-3.5 py-2 rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickStatusChange(selectedOrder.id, 'Preparing')}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold px-3 py-2 rounded-xl transition"
                >
                  Set to Kitchen Preparing
                </button>
                <button
                  onClick={() => handleQuickStatusChange(selectedOrder.id, 'Delivered')}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

