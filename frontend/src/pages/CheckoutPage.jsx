import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Store, CreditCard, Banknote, ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi, customersApi } from '../services/api';
import VegBadge from '../components/common/VegBadge';

export default function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    deliveryCharge,
    discountAmount,
    grandTotal,
    deliveryType,
    setDeliveryType,
    deliverySlot,
    setDeliverySlot,
    deliveryPincode,
    setDeliveryPincode,
    appliedCoupon,
    clearCart
  } = useCart();

  const { shop, deliverySettings } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    landmark: '',
    city: 'Ahmedabad',
    pincode: deliveryPincode || '380057',
    notes: '',
    paymentMethod: 'cod', // 'cod' or 'online'
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If customer is logged in, try loading their saved addresses
  useEffect(() => {
    async function loadAddresses() {
      if (user && user.role === 'customer') {
        try {
          const res = await customersApi.getAddresses();
          if (res.data?.success && res.data.data.length > 0) {
            setSavedAddresses(res.data.data);
            const def = res.data.data.find(a => a.is_default) || res.data.data[0];
            setFormData(prev => ({
              ...prev,
              name: def.recipient_name || prev.name,
              phone: def.phone || prev.phone,
              address: def.address_line,
              landmark: def.landmark || '',
              city: def.city || 'Ahmedabad',
              pincode: def.pincode
            }));
            setDeliveryPincode(def.pincode);
          }
        } catch (e) {
          // ignore
        }
      }
    }
    loadAddresses();
  }, [user]);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'pincode') {
      setDeliveryPincode(value.replace(/\D/g, ''));
    }
  };

  const handleSelectSavedAddress = (addr) => {
    setFormData(prev => ({
      ...prev,
      name: addr.recipient_name,
      phone: addr.phone,
      address: addr.address_line,
      landmark: addr.landmark || '',
      city: addr.city,
      pincode: addr.pincode
    }));
    setDeliveryPincode(addr.pincode);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Please enter your full name and phone number.');
      return;
    }

    if (formData.phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!formData.address.trim()) {
        setErrorMsg('Delivery address is required for home delivery.');
        return;
      }
      if (!formData.pincode || formData.pincode.length < 6) {
        setErrorMsg('Please enter a valid 6-digit Ahmedabad pincode.');
        return;
      }
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer_name: formData.name.trim(),
        customer_phone: formData.phone.trim(),
        customer_email: formData.email.trim() || null,
        delivery_type: deliveryType,
        delivery_slot: deliverySlot || null,
        address_line: deliveryType === 'delivery' 
          ? `${formData.address}${formData.landmark ? `, Near ${formData.landmark}` : ''}`
          : 'Store Pickup',
        city: formData.city || 'Ahmedabad',
        pincode: deliveryType === 'delivery' ? formData.pincode : '380057',
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_method: formData.paymentMethod,
        order_notes: formData.notes.trim() || null,
        items: cartItems.map(i => ({
          variant_id: i.variant_id,
          quantity: i.quantity
        }))
      };

      const res = await ordersApi.create(orderPayload);

      if (res.data?.success) {
        const orderData = res.data.order;
        clearCart();
        navigate(`/order-success/${orderData.order_number}`, { state: { order: orderData } });
      } else {
        setErrorMsg(res.data?.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Order checkout error:', err);
      const msg = err.response?.data?.message || 'Server error while placing your order. Please check inputs.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const slots = deliverySettings?.delivery_slots || [
    "09:00 AM - 12:00 PM",
    "12:00 PM - 03:00 PM",
    "03:00 PM - 06:00 PM",
    "06:00 PM - 09:30 PM"
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Back */}
        <div className="mb-6 flex items-center gap-2">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-700 bg-white px-3 py-1.5 rounded-full border border-purple-100 shadow-sm transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-xs font-semibold text-gray-600">Checkout &amp; Confirmation</span>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 8 Cols: Customer Information & Delivery Address */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Delivery vs Pickup Selector */}
              <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
                <h2 className="font-serif font-bold text-base text-purple-950 mb-3">
                  1. Delivery Option
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                      deliveryType === 'delivery'
                        ? 'border-purple-800 bg-purple-50/70 shadow-sm'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${deliveryType === 'delivery' ? 'bg-purple-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-purple-950">Home Delivery</h4>
                      <p className="text-[11px] text-gray-500">Delivered to your address in Ahmedabad</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                      deliveryType === 'pickup'
                        ? 'border-purple-800 bg-purple-50/70 shadow-sm'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${deliveryType === 'pickup' ? 'bg-purple-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-purple-950">Store Pickup</h4>
                      <p className="text-[11px] text-gray-500">Pick up from Shop #8, Sun South Park</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Saved Addresses (if available) */}
              {savedAddresses.length > 0 && deliveryType === 'delivery' && (
                <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
                  <h3 className="font-serif font-bold text-xs text-purple-950 uppercase tracking-wider mb-3">
                    Use a Saved Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3 rounded-2xl border cursor-pointer transition ${
                          formData.address === addr.address_line
                            ? 'border-purple-800 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        <span className="font-bold text-xs text-purple-950 block">{addr.label}</span>
                        <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{addr.address_line}</p>
                        <span className="text-[10px] text-purple-800 font-semibold mt-1 block">PIN: {addr.pincode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Contact & Address Form */}
              <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm space-y-4">
                <h2 className="font-serif font-bold text-base text-purple-950">
                  2. Customer &amp; {deliveryType === 'delivery' ? 'Delivery Details' : 'Contact Details'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Mobile Number (for Order Updates &amp; OTP) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9898012345"
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Email Address (Optional for Bill Receipt)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. ramesh.patel@gmail.com"
                      className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="space-y-4 pt-3 border-t border-gray-100">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Delivery Address (Flat / House No., Society / Apartment, Road) *
                      </label>
                      <textarea
                        name="address"
                        rows={2}
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g. Flat B-402, Gala Aria, Near SOBO Center, South Bopal"
                        className="w-full bg-stone-50 border border-purple-200 rounded-xl p-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          placeholder="e.g. Opposite Sun South Park"
                          className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          required
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="380057"
                          className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold text-gray-800 focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    {/* Delivery Slot */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Preferred Delivery Slot
                      </label>
                      <select
                        value={deliverySlot}
                        onChange={(e) => setDeliverySlot(e.target.value)}
                        className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                      >
                        <option value="">Standard Fast Delivery (Next available)</option>
                        {slots.map((s, idx) => (
                          <option key={idx} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Special Packaging or Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Please pack in festive boxes, call upon arrival"
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm space-y-4">
                <h2 className="font-serif font-bold text-base text-purple-950">
                  3. Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                    formData.paymentMethod === 'cod'
                      ? 'border-purple-800 bg-purple-50 shadow-sm'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                      className="text-purple-800 focus:ring-purple-600"
                    />
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-purple-950">
                        {deliveryType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Shop on Pickup'}
                      </h4>
                      <p className="text-[11px] text-gray-500">Pay securely in cash or UPI upon delivery</p>
                    </div>
                  </label>

                  <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                    formData.paymentMethod === 'online'
                      ? 'border-purple-800 bg-purple-50 shadow-sm'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'online' }))}
                      className="text-purple-800 focus:ring-purple-600"
                    />
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-purple-950">
                        Online UPI / Cards
                      </h4>
                      <p className="text-[11px] text-gray-500">Google Pay, PhonePe, Paytm, Cards</p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Order Summary & Place Order Button */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xl space-y-5 sticky top-28">
                <h3 className="font-serif font-bold text-base text-purple-950 border-b border-purple-50 pb-3 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-normal text-purple-700 font-sans">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
                  </span>
                </h3>

                {/* Items Mini List */}
                <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 space-y-2 pr-1 text-xs">
                  {cartItems.map((itm) => (
                    <div key={itm.variant_id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-medium text-gray-800 block truncate">{itm.name}</span>
                        <span className="text-[10px] text-gray-500">{itm.weight_label} × {itm.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-900 font-sans shrink-0">
                        ₹{(Number(itm.price) * itm.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-2 text-xs border-t border-purple-100 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900 font-sans">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 font-medium">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span className="font-bold font-sans">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge ({deliveryType === 'delivery' ? 'Home' : 'Pickup'})</span>
                    <span className="font-semibold text-gray-900 font-sans">
                      {deliveryCharge === 0 ? <span className="text-green-700 font-bold">FREE</span> : `₹${deliveryCharge.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline">
                    <span className="font-serif font-bold text-sm text-purple-950">
                      Total Payable
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-purple-900 font-sans">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#393186] hover:bg-[#2a2463] text-white font-bold py-3.5 rounded-2xl text-sm shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>Confirm &amp; Place Order (₹{grandTotal.toFixed(2)})</span>
                    </>
                  )}
                </button>

                <div className="text-center text-[11px] text-gray-500 pt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>100% Secure &amp; Direct Shop Order</span>
                </div>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
