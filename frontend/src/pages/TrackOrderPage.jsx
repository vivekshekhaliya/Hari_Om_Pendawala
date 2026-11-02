import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, CheckCircle2, Truck, Store, AlertCircle, Phone, XCircle, ArrowRight } from 'lucide-react';
import { ordersApi } from '../services/api';
import { useShop } from '../context/ShopContext';
import VegBadge from '../components/common/VegBadge';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialNumber = searchParams.get('number') || '';
  const { shop } = useShop();

  const [inputVal, setInputVal] = useState(initialNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');

  const handleTrack = async (queryToTrack) => {
    const q = queryToTrack || inputVal;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setCancelSuccess('');
    try {
      const res = await ordersApi.track(q.trim());
      if (res.data?.success) {
        setOrder(res.data.data);
      } else {
        setErrorMsg('No order found with this tracking ID or mobile number.');
        setOrder(null);
      }
    } catch (err) {
      setErrorMsg('No active order found. Please check the order number or phone number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNumber) {
      handleTrack(initialNumber);
    }
  }, [initialNumber]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelLoading(true);
    try {
      const res = await ordersApi.cancel(order.id);
      if (res.data?.success) {
        setCancelSuccess('Order has been cancelled successfully.');
        handleTrack(order.order_number);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelLoading(false);
    }
  };

  const steps = [
    { key: 'Pending', label: 'Order Received', desc: 'Sent to shop kitchen' },
    { key: 'Confirmed', label: 'Order Confirmed', desc: 'Ingredients inspected' },
    { key: 'Preparing', label: 'Preparing Fresh', desc: 'Crafting in pure desi ghee' },
    {
      key: order?.delivery_type === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery',
      label: order?.delivery_type === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery',
      desc: order?.delivery_type === 'pickup' ? 'Waiting at South Bopal counter' : 'On the way to your door'
    },
    { key: 'Delivered', label: 'Delivered', desc: 'Enjoy your sweets!' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Preparing': return 2;
      case 'Ready for Pickup':
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return -1;
    }
  };

  const currentStep = order ? getStepIndex(order.order_status) : -1;
  const isCancelled = order?.order_status === 'Cancelled';

  return (
    <div className="min-h-screen bg-[#fafaf9] py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Track Search Card */}
        <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-md mx-auto mb-6">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-purple-950">
              Track Your Sweet Order
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter your Order Tracking Number (e.g. HOP-261028-4821) or 10-digit mobile number.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter Order Number or Mobile"
                className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
              />
              <Search className="w-4 h-4 text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-900 hover:bg-purple-950 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {errorMsg && (
            <div className="max-w-md mx-auto mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Live Order Status Display */}
        {order && (
          <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-xl space-y-8 animate-fadeIn">
            
            {/* Header Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-purple-100 gap-3">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest block">
                  Order Details
                </span>
                <h2 className="font-mono font-black text-xl text-purple-950">
                  {order.order_number}
                </h2>
                <span className="text-xs text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </span>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                  isCancelled
                    ? 'bg-red-100 text-red-800'
                    : order.order_status === 'Delivered'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-900'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  Status: {order.order_status}
                </span>
              </div>
            </div>

            {/* Stepper Progression */}
            {!isCancelled ? (
              <div className="py-2">
                <div className="relative flex items-center justify-between">
                  {/* Connecting Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 w-full z-0" />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#393186] transition-all duration-500 z-0"
                    style={{ width: `${Math.min(100, Math.max(0, (currentStep / (steps.length - 1)) * 100))}%` }}
                  />

                  {steps.map((st, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div key={st.key} className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition shadow-md ${
                          isDone
                            ? 'bg-purple-900 text-white border-2 border-white'
                            : 'bg-white text-gray-400 border-2 border-gray-300'
                        } ${isCurrent ? 'ring-4 ring-purple-200 animate-pulse-subtle' : ''}`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5 text-amber-300" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] sm:text-xs font-bold mt-2 text-center max-w-[70px] sm:max-w-[90px] ${
                          isDone ? 'text-purple-950' : 'text-gray-400'
                        }`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
                <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <strong className="block font-bold">This order was Cancelled</strong>
                  <span>If you have questions or wish to re-order, please contact our South Bopal store directly.</span>
                </div>
              </div>
            )}

            {/* Cancel Action (Allowed when Pending) */}
            {order.order_status === 'Pending' && !isCancelled && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-amber-950 block">Need to make changes?</strong>
                  <span className="text-amber-800">You can cancel your order while it is still awaiting kitchen preparation.</span>
                </div>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                  className="bg-white hover:bg-red-50 text-red-600 border border-red-300 font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm self-start sm:self-auto"
                >
                  {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            )}

            {cancelSuccess && (
              <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs font-semibold">
                {cancelSuccess}
              </div>
            )}

            {/* Items Summary in Track Order */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-purple-950">
                Items in This Order
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {order.items?.map((itm, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-2">
                      <VegBadge size="sm" />
                      <div>
                        <strong className="text-gray-900">{itm.product_name}</strong>
                        <span className="text-gray-500 ml-2">({itm.variant_label} × {itm.quantity})</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 font-sans">
                      ₹{Number(itm.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <strong className="text-gray-500 block">Delivery Address:</strong>
                <p className="text-gray-800 font-medium mt-0.5">{order.address_line}</p>
                <p className="text-gray-500">PIN: {order.pincode}</p>
              </div>
              <div>
                <strong className="text-gray-500 block">Total Amount:</strong>
                <span className="text-lg font-black text-purple-900 font-sans mt-0.5 block">
                  ₹{Number(order.total_amount).toFixed(2)}
                </span>
                <span className="text-[11px] text-gray-500 capitalize">Payment: {order.payment_method} ({order.payment_status})</span>
              </div>
            </div>

            {/* Assistance CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <span>Have an urgent question?</span>
              <a
                href={`tel:${shop.phone || '+919712247979'}`}
                className="inline-flex items-center gap-1.5 text-purple-900 font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5 text-green-600" />
                <span>Call Store: {shop.phone || '+91 97122 47979'}</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
