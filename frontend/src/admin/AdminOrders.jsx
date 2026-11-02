import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, Printer, Eye, X, CheckCircle2, Clock, MapPin, Phone, ShieldCheck, Tag, MessageCircle, Truck } from 'lucide-react';
import { ordersApi } from '../services/api';
import { useShop } from '../context/ShopContext';
import VegBadge from '../components/common/VegBadge';

export default function AdminOrders() {
  const { shop } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(15); // in seconds, 0 = off

  // Filter states
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Keep state in sync with URL params if they change
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlSearch = searchParams.get('search');
    if (urlStatus && urlStatus !== statusFilter) setStatusFilter(urlStatus);
    if (urlSearch && urlSearch !== searchTerm) setSearchTerm(urlSearch);
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.payment_method = paymentFilter;
      if (dateFilter) params.date = dateFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await ordersApi.getAll(params);
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, dateFilter]);

  // Polling / Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, statusFilter, paymentFilter, dateFilter, searchTerm]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handlePaymentUpdate = async (orderId, newPaymentStatus) => {
    try {
      await ordersApi.updatePaymentStatus(orderId, newPaymentStatus);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, payment_status: newPaymentStatus }));
      }
    } catch (err) {
      alert('Failed to update payment status');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Auto-Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-purple-950">
            Orders &amp; Kitchen Management
          </h1>
          <p className="text-xs text-gray-500">
            Live order queue, print thermal bills, and update dispatch status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh Selector */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
            <RefreshCw className="w-3.5 h-3.5 text-purple-700" />
            <span>Auto Refresh:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="font-bold text-purple-950 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={5}>Every 5s</option>
              <option value={15}>Every 15s</option>
              <option value={30}>Every 30s</option>
              <option value={0}>Manual Only</option>
            </select>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 bg-purple-900 text-white rounded-xl hover:bg-purple-950 transition shadow-sm"
            title="Refresh Now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-xs ${
              statusFilter === st
                ? 'bg-[#393186] text-white shadow-xs ring-1 ring-[#393186]'
                : 'bg-white hover:bg-purple-50 text-gray-700 border border-gray-200'
            }`}
          >
            {st === 'all' ? 'All Orders' : st}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Name, Phone..."
            className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-xl py-2 pl-9 pr-16 text-xs text-gray-800 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-purple-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-purple-200 text-gray-800 font-semibold rounded-xl py-2 px-3 focus:outline-none focus:border-purple-600"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-stone-50 border border-purple-200 text-gray-800 font-semibold rounded-xl py-2 px-3 focus:outline-none focus:border-purple-600"
          >
            <option value="all">All Payments</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="online">Online Payment</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-stone-50 border border-purple-200 text-gray-800 font-semibold rounded-xl py-1.5 px-3 focus:outline-none focus:border-purple-600"
          />

          {(statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPaymentFilter('all');
                setDateFilter('');
                setSearchTerm('');
              }}
              className="text-red-600 hover:text-red-700 font-bold underline px-2"
            >
              Reset
            </button>
          )}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-stone-50/60 flex items-center justify-between text-xs">
          <span className="font-bold text-purple-950">
            Total Orders: {orders.length}
          </span>
          <span className="text-gray-500">
            Click on any order to view receipt breakdown &amp; customer details
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID &amp; Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">No orders match the selected filters.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-purple-50/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-purple-950 block">
                        {ord.order_number}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ord.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="block text-gray-900">{ord.customer_name}</strong>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-500 text-[11px] font-mono">{ord.customer_phone}</span>
                        <a
                          href={`https://wa.me/91${(ord.customer_phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste ${ord.customer_name || 'Customer'}! 🙏 Regarding your order #${ord.order_number} at Hari Om Pendawala Sweet & Namkeen.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 capitalize">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        ord.delivery_type === 'pickup'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {ord.delivery_type}
                      </span>
                      {ord.pincode && <span className="block text-[10px] text-gray-400">PIN: {ord.pincode}</span>}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {ord.items && ord.items.length > 0 ? (
                        <span className="text-gray-800">
                          {ord.items.map(i => `${i.product_name} (${i.variant_label} × ${i.quantity})`).join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">View details</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold font-sans text-gray-900">
                      ₹{Number(ord.total_amount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="uppercase font-semibold block">{ord.payment_method}</span>
                      <span className={`text-[10px] font-bold ${ord.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {ord.payment_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        ord.order_status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : ord.order_status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : ord.order_status === 'Pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}>
                        {ord.order_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ord.order_status}
                        onChange={(e) => handleStatusUpdate(ord.id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg py-1 px-2 focus:outline-none focus:border-purple-600"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-purple-100 z-10 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 bg-[#393186] text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-amber-300 uppercase font-bold tracking-wider">
                  Order Invoice &amp; Dispatch Details
                </span>
                <h3 className="font-mono font-black text-lg text-white">
                  {selectedOrder.order_number}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-full text-purple-200 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Customer & Address Details */}
              <div className="grid grid-cols-2 gap-4 bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
                <div>
                  <span className="text-gray-500 font-medium block">Customer Information</span>
                  <strong className="text-sm text-purple-950 block mt-0.5">{selectedOrder.customer_name}</strong>
                  <span className="text-gray-700 font-mono block">{selectedOrder.customer_phone}</span>
                  {selectedOrder.customer_email && <span className="text-gray-500">{selectedOrder.customer_email}</span>}
                </div>

                <div>
                  <span className="text-gray-500 font-medium block">Delivery Details ({selectedOrder.delivery_type})</span>
                  <p className="text-gray-800 font-medium mt-0.5">{selectedOrder.address_line}</p>
                  <p className="text-gray-500">PIN: {selectedOrder.pincode}</p>
                  {selectedOrder.delivery_slot && (
                    <span className="inline-block mt-1 text-[11px] text-purple-800 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                      Slot: {selectedOrder.delivery_slot}
                    </span>
                  )}
                </div>
              </div>

              {selectedOrder.order_notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <strong className="block font-bold">Customer Notes:</strong>
                  <span>{selectedOrder.order_notes}</span>
                </div>
              )}

              {/* Status Controller Grid */}
              <div className="grid grid-cols-2 gap-4 border border-gray-200 p-4 rounded-2xl">
                <div>
                  <label className="font-bold text-gray-700 block mb-1.5">Update Order Status:</label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    className="w-full bg-stone-50 border border-purple-300 rounded-xl p-2 font-bold text-xs text-purple-950 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1.5">Payment Status:</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) => handlePaymentUpdate(selectedOrder.id, e.target.value)}
                    className="w-full bg-stone-50 border border-purple-300 rounded-xl p-2 font-bold text-xs text-purple-950 focus:outline-none"
                  >
                    <option value="pending">Payment Pending</option>
                    <option value="paid">Payment Completed (Paid)</option>
                    <option value="failed">Payment Failed</option>
                  </select>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-purple-950">Ordered Products</h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-2">
                        <VegBadge size="sm" />
                        <div>
                          <strong className="text-gray-900">{item.product_name}</strong>
                          <span className="text-gray-500 ml-2">({item.variant_label} × {item.quantity})</span>
                        </div>
                      </div>
                      <span className="font-bold font-sans text-gray-900">
                        ₹{Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-1.5 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold font-sans">₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {Number(selectedOrder.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-700 font-bold">
                    <span>Coupon Discount ({selectedOrder.coupon_code})</span>
                    <span className="font-sans">-₹{Number(selectedOrder.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-bold font-sans">
                    {Number(selectedOrder.delivery_charge) === 0 ? 'FREE' : `₹${Number(selectedOrder.delivery_charge).toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-sm font-black text-purple-950">
                  <span>Final Amount</span>
                  <span className="text-lg text-purple-900 font-sans">
                    ₹{Number(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
