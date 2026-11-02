import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Store, Tag, Sparkles, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import VegBadge from '../components/common/VegBadge';
import { getImageUrl } from '../utils/imageUrl';

export default function CartPage() {
  const {
    cartItems,
    subtotal,
    deliveryCharge,
    discountAmount,
    grandTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliveryType,
    setDeliveryType,
    deliverySlot,
    setDeliverySlot,
    deliveryPincode,
    setDeliveryPincode,
    deliveryCalculation,
    appliedCoupon,
    couponError,
    couponSuccess,
    applyCoupon,
    removeCoupon,
    amountNeededForFree,
    progressPercent
  } = useCart();

  const { deliverySettings, shop } = useShop();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setApplyingCoupon(false);
  };

  const slots = deliverySettings?.delivery_slots || [
    "09:00 AM - 12:00 PM",
    "12:00 PM - 03:00 PM",
    "03:00 PM - 06:00 PM",
    "06:00 PM - 09:30 PM"
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#fafaf9] px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-purple-100 shadow-xl space-y-5">
          <div className="w-20 h-20 rounded-full bg-purple-50 mx-auto flex items-center justify-center text-purple-600">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-purple-950">Your Cart is Empty</h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Looks like you haven't added any sweets or farsan yet. Taste our authentic Amreli Thabdi Penda and crunchy gathiya!
            </p>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-[#393186] hover:bg-[#2a2463] text-white text-xs font-bold px-7 py-3 rounded-full shadow-lg transition"
          >
            <span>Explore Sweets Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-purple-950">
              Shopping Cart &amp; Delivery
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Review your selected sweets, choose delivery or store pickup, and apply offers.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:text-red-700 font-semibold underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        </div>

        {/* Free Delivery Meter */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs shadow-sm">
          {amountNeededForFree > 0 ? (
            <div>
              <div className="flex items-center justify-between font-medium text-amber-900 mb-1.5">
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Add ₹{amountNeededForFree.toFixed(0)} more of your favourite sweets to get FREE Home Delivery!
                </span>
                <span className="font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-amber-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-green-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>🎉 Congratulations! Your order qualifies for 100% FREE Home Delivery in Ahmedabad!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Cart Items List & Delivery Options */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Items List */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-purple-50 bg-stone-50/60 font-serif font-bold text-sm text-purple-950">
                Order Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </div>

              <div className="divide-y divide-gray-100 p-4 sm:p-6">
                {cartItems.map((item) => (
                  <div key={item.variant_id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        onError={(e) => { e.currentTarget.src = '/assets/thabdi-penda.jpg'; }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-purple-100 shrink-0 bg-stone-50"
                      />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <VegBadge size="sm" />
                          <h3 className="font-serif font-bold text-sm sm:text-base text-purple-950 truncate">
                            {item.name}
                          </h3>
                        </div>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                          Pack: {item.weight_label}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          ₹{Number(item.price).toFixed(2)} per pack
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Line Total */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
                      <div className="flex items-center border border-purple-200 rounded-xl bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1.5 sm:p-2 hover:bg-purple-100 text-gray-600 rounded-l transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs sm:text-sm font-bold text-purple-950">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 hover:bg-purple-100 text-gray-600 rounded-r transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="text-sm sm:text-base font-extrabold text-purple-950 font-sans">
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variant_id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Delivery Type & Slot Selection */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 space-y-5">
              <h3 className="font-serif font-bold text-base text-purple-950">
                Order Delivery Method
              </h3>

              {/* Delivery vs Pickup Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                    deliveryType === 'delivery'
                      ? 'border-purple-800 bg-purple-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${deliveryType === 'delivery' ? 'bg-purple-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-purple-950">Home Delivery</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Delivered directly to your door in South Bopal &amp; Ahmedabad.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                    deliveryType === 'pickup'
                      ? 'border-purple-800 bg-purple-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${deliveryType === 'pickup' ? 'bg-purple-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-purple-950">Store Pickup (FREE)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Collect freshly packed order from Shop #8, Sun South Park.
                    </p>
                  </div>
                </button>
              </div>

              {/* Pincode & Slot for Home Delivery */}
              {deliveryType === 'delivery' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Delivery Pincode:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 380057"
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                    <div className="mt-1 text-[11px]">
                      {deliveryCalculation.serviceable ? (
                        <span className="text-green-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {deliveryCalculation.message}
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {deliveryCalculation.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Preferred Delivery Slot:
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                    >
                      <option value="">Select preferred time slot</option>
                      {slots.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-purple-700" />
                    Pickup Address:
                  </p>
                  <p className="text-gray-700 pl-5">
                    {shop.address || 'Shop Number 8, Sun South Park, Near SOBO Center Road, South Bopal, Ahmedabad'}
                  </p>
                  <p className="text-gray-500 pl-5">
                    Opening Hours: {shop.opening_hours || '8:00 AM – 10:30 PM'}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Coupon Box */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 space-y-3">
              <h3 className="font-serif font-bold text-sm text-purple-950 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" />
                Have a Coupon Code?
              </h3>

              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-green-900 text-xs">
                      {appliedCoupon.code}
                    </span>
                    <p className="text-[11px] text-green-700 font-medium">
                      ₹{Number(appliedCoupon.discount_amount).toFixed(2)} discount applied!
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. HARIOM50)"
                    className="flex-1 bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    {applyingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
              )}
              {couponSuccess && !appliedCoupon && (
                <p className="text-[11px] text-green-700 font-medium">{couponSuccess}</p>
              )}
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-xl p-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-purple-950 border-b border-purple-50 pb-3">
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-gray-900 font-sans">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Coupon Discount</span>
                    <span className="font-bold font-sans">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-gray-900 font-sans">
                    {deliveryCharge === 0 ? (
                      <span className="text-green-700 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryCharge.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-serif font-bold text-sm text-purple-950 block">
                      Amount Payable
                    </span>
                    <span className="text-[10px] text-gray-500">
                      (Inclusive of all taxes)
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-purple-900 font-sans">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#393186] hover:bg-[#2a2463] text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/menu"
                  className="text-xs text-purple-800 hover:text-purple-950 font-semibold underline"
                >
                  Continue Shopping for More Sweets
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
