import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, ChevronRight, Sparkles } from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import ProductDetailModal from '../components/products/ProductDetailModal';
import VegBadge from '../components/common/VegBadge';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [sortBy, setSortBy] = useState('featured');
  const [vegOnly, setVegOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  useEffect(() => {
    setSearchTerm(searchParam);
  }, [searchParam]);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          categoriesApi.getAll(),
          productsApi.getAll()
        ]);
        if (catRes.data?.success) setCategories(catRes.data.data);
        if (prodRes.data?.success) setProducts(prodRes.data.data);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const handleCategorySelect = (slug) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
    setMobileFilterOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchParams.set('search', searchTerm.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  // Filter and sort products locally for instant response
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryParam === 'all' || p.category_slug === categoryParam;
    const matchSearch = !searchParam || 
      p.name.toLowerCase().includes(searchParam.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchParam.toLowerCase()));
    const matchVeg = !vegOnly || p.is_veg === 1 || p.is_veg === true;

    return matchCat && matchSearch && matchVeg;
  });

  // Sorting
  filteredProducts.sort((a, b) => {
    if (sortBy === 'price-asc') return (a.min_price || a.base_price) - (b.min_price || b.base_price);
    if (sortBy === 'price-desc') return (b.min_price || b.base_price) - (a.min_price || a.base_price);
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
  });

  const activeCategoryObj = categories.find(c => c.slug === categoryParam);

  return (
    <div className="min-h-screen bg-[#fafaf9] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="mb-8 bg-[#393186] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Direct from Saurashtra
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white mt-1">
              {activeCategoryObj ? activeCategoryObj.name : 'All Sweets & Namkeen Menu'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-2 leading-relaxed">
              {activeCategoryObj?.description || 'Authentic traditional sweets prepared in pure desi cow ghee, famous Amreli Thabdi Penda, and freshly roasted Saurashtra farsan.'}
            </p>
          </div>
        </div>

        {/* Search, Filter Bar and Sorting */}
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Thabdi Penda, Gathiya, Kaju Katli..."
              className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-xl py-2 pl-10 pr-20 text-xs sm:text-sm text-gray-800 focus:outline-none"
            />
            <Search className="w-4 h-4 text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-purple-800 hover:bg-purple-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Filter
            </button>
          </form>

          {/* Controls: Veg Toggle, Mobile Filter Trigger, Sort */}
          <div className="flex flex-wrap items-center justify-between md:justify-end w-full md:w-auto gap-3">
            {/* 100% Pure Veg Switch */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 bg-stone-50 px-3 py-2 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="rounded text-green-600 focus:ring-green-500 w-3.5 h-3.5"
              />
              <VegBadge size="sm" />
              <span>Veg Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-50 border border-purple-200 text-gray-800 text-xs font-semibold rounded-xl py-2 px-3 focus:outline-none focus:border-purple-600"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-purple-100 text-purple-900 font-bold px-3 py-2 rounded-xl text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>
          </div>

        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Categories Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 sticky top-28">
              <h3 className="font-serif font-bold text-sm text-purple-950 uppercase tracking-wider mb-3 pb-2 border-b border-purple-100">
                Menu Categories
              </h3>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                    categoryParam === 'all'
                      ? 'bg-purple-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-900'
                  }`}
                >
                  <span>All Products</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${categoryParam === 'all' ? 'bg-purple-800 text-amber-300' : 'bg-gray-100 text-gray-500'}`}>
                    {products.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const isSelected = categoryParam === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-900 text-white shadow-md'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-900'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.product_count !== undefined && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-purple-800 text-amber-300' : 'bg-gray-100 text-gray-500'}`}>
                          {cat.product_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Service Assurance Widget */}
              <div className="mt-6 pt-5 border-t border-purple-100 space-y-3 text-[11px] text-gray-600 bg-purple-50/50 p-3 rounded-xl">
                <div className="font-bold text-purple-950">Amreliwala Assurance:</div>
                <div className="flex items-center gap-2 text-green-800">
                  <VegBadge size="sm" />
                  <span>100% Pure Vegetarian</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pure Desi Ghee Preparation</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {/* Active Filters Display */}
            {(categoryParam !== 'all' || searchParam) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-gray-500 font-medium">Filtered by:</span>
                {categoryParam !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Category: {activeCategoryObj?.name || categoryParam}
                    <button onClick={() => handleCategorySelect('all')} className="hover:text-purple-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchParam && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Search: "{searchParam}"
                    <button
                      onClick={() => {
                        searchParams.delete('search');
                        setSearchParams(searchParams);
                        setSearchTerm('');
                      }}
                      className="hover:text-amber-950"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Render */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-stone-100 rounded-2xl h-80 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-purple-50 mx-auto flex items-center justify-center text-purple-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-800">No items match your search</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try clearing your search terms or select another category from the list.
                </p>
                <button
                  onClick={() => {
                    setSearchParams({});
                    setSearchTerm('');
                    setVegOnly(false);
                  }}
                  className="bg-purple-800 text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-purple-900 transition shadow"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onQuickView={(p) => setActiveModalProduct(p)}
                  />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Mobile Category Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div onClick={() => setMobileFilterOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-5 flex flex-col z-10">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <h3 className="font-serif font-bold text-purple-950 text-base">Menu Categories</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-full text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-1.5">
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                  categoryParam === 'all' ? 'bg-purple-900 text-white' : 'text-gray-800 hover:bg-purple-50'
                }`}
              >
                All Products
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategorySelect(c.slug)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                    categoryParam === c.slug ? 'bg-purple-900 text-white' : 'text-gray-800 hover:bg-purple-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      )}
    </div>
  );
}
