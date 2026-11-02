import React, { useState } from 'react';
import { Plus, Check, Star, AlertCircle, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import VegBadge from '../common/VegBadge';
import { getImageUrl } from '../../utils/imageUrl';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ id: `def-${product.id}`, weight_label: '500 g', price: product.base_price, stock_quantity: 50, is_available: true }];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = !selectedVariant?.is_available || selectedVariant?.stock_quantity <= 0;
  const isLowStock = selectedVariant?.stock_quantity > 0 && selectedVariant?.stock_quantity <= 10;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, selectedVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className="group bg-white rounded-2xl border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* 1. Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onQuickView && onQuickView(product)}>
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          onError={(e) => { e.currentTarget.src = '/assets/thabdi-penda.jpg'; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle Overlay for hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Veg Badge & Category Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {product.is_veg && <VegBadge size="md" className="shadow-sm" />}
          {product.is_featured && (
            <span className="bg-amber-500 text-purple-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-purple-950" />
              Special
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView && onQuickView(product);
          }}
          className="absolute bottom-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-purple-900 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* 2. Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
            {product.category_name || 'Traditional Mithai'}
          </span>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView && onQuickView(product)}
            className="font-serif font-bold text-sm sm:text-base text-purple-950 hover:text-purple-700 transition cursor-pointer line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Authentic traditional recipe prepared with pure cow ghee and supreme ingredients.'}
          </p>
        </div>

        {/* 3. Weight Variants Selector */}
        <div className="mt-3 pt-3 border-t border-purple-50">
          <label className="text-[11px] text-gray-500 block mb-1 font-medium">
            Select Weight:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg border transition ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                      : 'bg-stone-50 text-gray-700 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {v.weight_label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Price & Add To Cart Button */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-purple-950 font-sans">
                ₹{selectedVariant ? Number(selectedVariant.price).toFixed(0) : Number(product.base_price).toFixed(0)}
              </span>
              <span className="text-[11px] text-gray-500">
                / {selectedVariant?.weight_label || 'pack'}
              </span>
            </div>

            {isLowStock && (
              <span className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5">
                <AlertCircle className="w-2.5 h-2.5" />
                Only {selectedVariant.stock_quantity} left!
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm transform active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isAdded
                ? 'bg-green-600 text-white shadow-green-200'
                : 'bg-purple-800 hover:bg-purple-900 text-white shadow-purple-200 hover:shadow-md'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
