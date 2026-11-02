import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, Plus, Trash2, Clock, ChevronRight, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersApi, customersApi } from '../services/api';
import VegBadge from '../components/common/VegBadge';

export default function CustomerAccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'addresses'
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Address form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({
    label: 'Home',
    recipient_name: user?.name || '',
    phone: user?.phone || '',
    address_line: '',
    landmark: '',
    city: 'Ahmedabad',
    pincode: '380057',
    is_default: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        const [ordRes, addrRes] = await Promise.all([
          ordersApi.getMyOrders(),
          customersApi.getAddresses()
        ]);
        if (ordRes.data?.success) setOrders(ordRes.data.data);
        if (addrRes.data?.success) setAddresses(addrRes.data.data);
      } catch (err) {
        console.error('Customer data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await customersApi.addAddress(addrForm);
      if (res.data?.success) {
        setShowAddAddr(false);
        const refRes = await customersApi.getAddresses();
        if (refRes.data?.success) setAddresses(refRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await customersApi.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center font-serif font-black text-2xl border-2 border-amber-400">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-purple-950">
                {user?.name || 'Customer Account'}
              </h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {user?.phone} {user?.email && `• ${user.email}`}
              </p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                Verified Sweet Club Member
              </span>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-2 transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'text-purple-900 border-b-2 border-purple-900'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 px-2 transition flex items-center gap-2 ${
              activeTab === 'addresses'
                ? 'text-purple-900 border-b-2 border-purple-900'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading order history...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-50 mx-auto flex items-center justify-center text-purple-600">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-800">No Orders Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Treat yourself to authentic Saurashtra sweets like Amreli Thabdi Penda and crunchy gathiya!
                </p>
                <Link
                  to="/menu"
                  className="inline-block bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold px-6 py-2.5 rounded-full transition shadow-md"
                >
                  Explore Menu
                </Link>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-purple-950 block">
                        {ord.order_number}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.order_status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : ord.order_status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-purple-100 text-purple-900'
                      }`}>
                        {ord.order_status}
                      </span>
                      <span className="font-bold text-sm font-sans text-purple-950">
                        ₹{Number(ord.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-50 text-xs">
                    {ord.items?.map((item, i) => (
                      <div key={i} className="py-2 flex justify-between text-gray-700">
                        <span>{item.product_name} ({item.variant_label} × {item.quantity})</span>
                        <span className="font-semibold font-sans">₹{Number(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Type: <strong className="capitalize text-gray-700">{ord.delivery_type}</strong> • Payment: <strong className="uppercase text-gray-700">{ord.payment_method}</strong>
                    </span>
                    <Link
                      to={`/track-order?number=${ord.order_number}`}
                      className="text-purple-900 hover:text-purple-700 font-bold flex items-center gap-1"
                    >
                      <span>Track Progress</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-sm text-purple-950">Delivery Addresses</h3>
              <button
                onClick={() => setShowAddAddr(!showAddAddr)}
                className="inline-flex items-center gap-1.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Add Address Form */}
            {showAddAddr && (
              <form onSubmit={handleAddAddress} className="bg-white rounded-3xl border border-purple-200 p-6 shadow-md space-y-4 animate-fadeIn">
                <h4 className="font-bold text-xs text-purple-950 uppercase tracking-wider">New Delivery Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Label</label>
                    <input
                      type="text"
                      required
                      value={addrForm.label}
                      onChange={(e) => setAddrForm(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Home / Office / Parents"
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={addrForm.recipient_name}
                      onChange={(e) => setAddrForm(prev => ({ ...prev, recipient_name: e.target.value }))}
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addrForm.pincode}
                      onChange={(e) => setAddrForm(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 block mb-1">Address Line</label>
                    <textarea
                      required
                      rows={2}
                      value={addrForm.address_line}
                      onChange={(e) => setAddrForm(prev => ({ ...prev, address_line: e.target.value }))}
                      placeholder="Flat, building, society name, street..."
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddr(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-900 rounded-xl hover:bg-purple-950 transition"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-3xl border border-purple-100 p-5 shadow-sm space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-950 px-2 py-0.5 bg-purple-50 rounded">
                      {addr.label}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{addr.recipient_name} ({addr.phone})</p>
                  <p className="text-xs text-gray-600">{addr.address_line}</p>
                  <p className="text-[11px] text-gray-500">{addr.city} - {addr.pincode}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
