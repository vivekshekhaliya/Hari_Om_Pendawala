import React, { useState } from 'react';
import { X, Plus, Minus, Check, Star, ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import VegBadge from '../common/VegBadge';
import { getImageUrl } from '../../utils/imageUrl';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  if (!product) return null;

  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ id: `def-${product.id}`, weight_label: '500 g', price: product.base_price, stock_quantity: 50, is_available: true }];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = !selectedVariant?.is_available || selectedVariant?.stock_quantity <= 0;
  const maxStock = selectedVariant?.stock_quantity || 99;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-purple-100 z-10 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Column */}
        <div className="md:w-1/2 relative bg-stone-100 min-h-[260px] md:min-h-[380px]">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            onError={(e) => { e.currentTarget.src = '/assets/thabdi-penda.jpg'; }}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {product.is_veg && <VegBadge size="lg" className="shadow-md" />}
            {product.is_featured && (
              <span className="bg-amber-500 text-purple-950 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                <Star className="w-3 h-3 fill-purple-950" />
                Amreli Special
              </span>
            )}
          </div>
        </div>

        {/* Product Details Column */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              {product.category_name || 'Traditional Delicacy'}
            </span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-purple-950 mt-1 leading-snug">
              {product.name}
            </h2>

            <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">
              {product.description || 'Authentic traditional recipe prepared with pure cow ghee and premium ingredients directly sourced from Saurashtra.'}
            </p>

            {/* Quality Seals */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-gray-600 bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
              <span className="flex items-center gap-1.5 font-medium text-purple-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Pure Desi Cow Ghee
              </span>
              <span className="flex items-center gap-1.5 font-medium text-green-800">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Fresh Daily Batch
              </span>
            </div>

            {/* Weight Variant Selector */}
            <div className="mt-5">
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Choose Weight / Pack Size:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`py-2 px-2 text-center rounded-xl border transition ${
                        isSelected
                          ? 'border-purple-800 bg-purple-900 text-white shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 text-gray-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{v.weight_label}</div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-amber-300' : 'text-purple-900'}`}>
                        ₹{Number(v.price).toFixed(0)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-purple-200 rounded-xl bg-stone-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 hover:bg-purple-100 text-gray-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-purple-950">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxStock}
                  onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                  className="px-3 py-1.5 hover:bg-purple-100 text-gray-700 transition disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-gray-400 block font-medium">Total Price</span>
              <span className="text-xl sm:text-2xl font-black text-purple-950 font-sans">
                ₹{(Number(selectedVariant?.price || product.base_price) * quantity).toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`flex-1 py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg transform active:scale-95 ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-[#393186] hover:bg-[#2a2463] text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add {quantity} to Cart</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
