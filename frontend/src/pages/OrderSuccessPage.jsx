import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Printer, ArrowRight, Clock, MapPin, Phone, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ordersApi } from '../services/api';
import { useShop } from '../context/ShopContext';
import VegBadge from '../components/common/VegBadge';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { shop } = useShop();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#581c87', '#d97706', '#16a34a', '#fbbf24']
      });
    } catch (e) {
      // ignore
    }

    async function fetchOrderDetails() {
      if (!order && orderNumber) {
        try {
          const res = await ordersApi.track(orderNumber);
          if (res.data?.success) {
            setOrder(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load order receipt:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchOrderDetails();
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fafaf9]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-600">Retrieving order confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Printable Receipt Container */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-xl overflow-hidden print:shadow-none print:border-none">
          
          {/* Header Banner */}
          <div className="bg-[#393186] text-white p-8 text-center relative overflow-hidden print:bg-white print:text-black">
            <img
              src="/assets/logo.jpeg"
              alt="Hari Om Pendawala Logo"
              className="h-16 w-auto object-contain mx-auto mb-3 bg-white p-1 rounded-xl shadow border border-amber-300"
            />
            <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-400 text-green-300 flex items-center justify-center mx-auto mb-2 shadow-lg print:hidden">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>

            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
              Order Confirmed &amp; Sent to Kitchen
            </span>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white print:text-black">
              Thank You for Ordering with Hari Om Pendawala!
            </h1>

            <p className="text-xs text-purple-200 mt-2 max-w-md mx-auto print:text-gray-600">
              Your sweet order has been received by our shop. We are preparing your fresh batch with pure Saurashtra love and desi ghee.
            </p>

            {/* Order Number Badge */}
            <div className="mt-5 inline-block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl print:border-black">
              <span className="text-[11px] text-purple-200 uppercase tracking-wider block font-medium print:text-gray-600">
                Order Tracking ID
              </span>
              <span className="font-mono font-black text-lg sm:text-xl text-amber-300 tracking-wider print:text-black">
                {order?.order_number || orderNumber}
              </span>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs">
              <div>
                <span className="text-gray-500 block">Customer</span>
                <strong className="text-purple-950 text-xs sm:text-sm font-semibold">{order?.customer_name || 'Guest'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Phone</span>
                <strong className="text-purple-950 font-mono">{order?.customer_phone || '-'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Delivery Type</span>
                <strong className="text-purple-950 capitalize">{order?.delivery_type || 'Delivery'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Payment Mode</span>
                <strong className="text-purple-950 uppercase">{order?.payment_method || 'COD'}</strong>
              </div>
            </div>

            {/* Delivery Address / Pickup Location */}
            <div className="border border-gray-100 rounded-2xl p-4 text-xs space-y-1">
              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-700" />
                {order?.delivery_type === 'pickup' ? 'Pickup Location' : 'Delivery Destination'}:
              </span>
              <p className="text-gray-700">
                {order?.address_line}
                {order?.city && `, ${order.city}`}
                {order?.pincode && ` - ${order.pincode}`}
              </p>
              {order?.delivery_slot && (
                <p className="text-purple-800 font-medium">Slot: {order.delivery_slot}</p>
              )}
            </div>

            {/* Order Items Table */}
            {order?.items && order.items.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-purple-950">
                  Ordered Items
                </h3>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-white">
                      <div className="flex items-center gap-2">
                        <VegBadge size="sm" />
                        <div>
                          <strong className="text-gray-900">{item.product_name}</strong>
                          <span className="text-gray-500 ml-2">({item.variant_label} × {item.quantity})</span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 font-sans">
                        ₹{Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="space-y-2 border-t border-purple-100 pt-4 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900 font-sans">₹{Number(order?.subtotal || 0).toFixed(2)}</span>
              </div>

              {Number(order?.discount_amount) > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Coupon Discount ({order?.coupon_code})</span>
                  <span className="font-bold font-sans">-₹{Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-gray-900 font-sans">
                  {Number(order?.delivery_charge) === 0 ? <span className="text-green-700 font-bold">FREE</span> : `₹${Number(order?.delivery_charge).toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline text-sm font-bold text-purple-950">
                <span>Total Amount Paid / Payable</span>
                <span className="text-xl font-black text-purple-900 font-sans">
                  ₹{Number(order?.total_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Shop Contact Assistance Card */}
            <div className="bg-stone-50 border border-purple-100 rounded-2xl p-4 text-xs text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <strong className="text-purple-950 block">Have any questions about this order?</strong>
                <span>Call our South Bopal store directly for instant help.</span>
              </div>
              <a
                href={`tel:${shop.phone || '+919712247979'}`}
                className="inline-flex items-center gap-1.5 bg-purple-900 hover:bg-purple-950 text-white font-bold px-4 py-2 rounded-xl text-xs transition shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>{shop.phone || '+91 97122 47979'}</span>
              </a>
            </div>

            {/* Action Buttons (Hidden on Print) */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-gray-800 font-bold py-3 rounded-2xl text-xs border border-gray-300 transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-gray-600" />
                <span>Print Invoice Receipt</span>
              </button>

              <Link
                to={`/track-order?number=${order?.order_number || orderNumber}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition"
              >
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Track Live Order Status</span>
              </Link>
            </div>

            <div className="text-center print:hidden pt-2">
              <Link to="/menu" className="text-xs text-purple-800 hover:text-purple-950 font-bold underline">
                Back to Sweets Menu
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
