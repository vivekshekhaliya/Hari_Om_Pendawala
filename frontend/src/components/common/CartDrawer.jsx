import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import VegBadge from './VegBadge';
import { getImageUrl } from '../../utils/imageUrl';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    subtotal,
    deliveryCharge,
    grandTotal,
    updateQuantity,
    removeFromCart,
    freeThreshold,
    progressPercent,
    amountNeededForFree
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-[#393186] text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <h2 className="font-serif font-bold text-base tracking-wide">Your Sweet Cart</h2>
              <span className="text-xs bg-amber-400 text-purple-950 font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full text-purple-200 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          <div className="bg-amber-50/80 border-b border-amber-200/60 p-3 text-xs">
            {amountNeededForFree > 0 ? (
              <div>
                <div className="flex items-center justify-between font-medium text-amber-900 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Add <strong>₹{amountNeededForFree.toFixed(0)}</strong> more for <strong>FREE Delivery</strong>!
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>You've unlocked FREE Delivery across Ahmedabad!</span>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-purple-50 mx-auto flex items-center justify-center text-purple-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 text-lg">Your Cart is Empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Explore our authentic Amreli Thabdi Penda, pure desi ghee sweets, and crispy namkeen!
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/menu');
                  }}
                  className="inline-flex items-center gap-2 bg-purple-800 hover:bg-purple-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-md"
                >
                  Browse Sweets &amp; Namkeen
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.variant_id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    onError={(e) => { e.currentTarget.src = '/assets/thabdi-penda.jpg'; }}
                    className="w-16 h-16 rounded-xl object-cover border border-purple-100 shrink-0 bg-stone-50"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <VegBadge size="sm" />
                        <h4 className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                          {item.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.variant_id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {item.weight_label}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-purple-200 rounded-lg bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1 hover:bg-purple-100 text-gray-600 rounded-l transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-purple-950">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="p-1 hover:bg-purple-100 text-gray-600 rounded-r transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        @ ₹{Number(item.price)} each
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="border-t border-purple-100 bg-stone-50 p-4 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-green-700">
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-1.5 flex justify-between text-sm font-bold text-purple-950">
                  <span>Estimated Total</span>
                  <span className="text-base text-purple-900">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/cart');
                  }}
                  className="w-full bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  View Full Cart
                </button>

                <button
                  onClick={() => {
                    closeCart();
                    navigate('/checkout');
                  }}
                  className="w-full bg-[#393186] hover:bg-[#2a2463] text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
