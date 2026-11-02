import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Star, Check, X, AlertCircle, Upload, Eye } from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import VegBadge from '../components/common/VegBadge';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { getImageUrl } from '../utils/imageUrl';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    base_price: 150,
    is_featured: false,
    is_veg: true,
    is_active: true,
    imageUrl: '/assets/thabdi-penda.jpg',
    variants: [
      { label: '250 g', grams: 250, price: 90, stock: 50, is_available: true },
      { label: '500 g', grams: 500, price: 175, stock: 50, is_available: true },
      { label: '1 kg', grams: 1000, price: 340, stock: 30, is_available: true }
    ]
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null,
    loading: false,
    error: ''
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productsApi.getAll({ all: 'true' }),
        categoriesApi.getAll(true)
      ]);
      if (prodRes.data?.success) setProducts(prodRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      description: '',
      base_price: 150,
      is_featured: false,
      is_veg: true,
      is_active: true,
      imageUrl: '/assets/thabdi-penda.jpg',
      variants: [
        { label: '250 g', grams: 250, price: 90, stock: 50, is_available: true },
        { label: '500 g', grams: 500, price: 175, stock: 50, is_available: true },
        { label: '1 kg', grams: 1000, price: 340, stock: 30, is_available: true }
      ]
    });
    setSelectedImageFile(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id,
      description: p.description || '',
      base_price: p.base_price,
      is_featured: Boolean(p.is_featured),
      is_veg: Boolean(p.is_veg),
      is_active: Boolean(p.is_active),
      imageUrl: p.image || '/assets/thabdi-penda.jpg',
      variants: p.variants && p.variants.length > 0
        ? p.variants.map(v => ({
            label: v.weight_label,
            grams: v.weight_grams,
            price: v.price,
            stock: v.stock_quantity,
            is_available: Boolean(v.is_available)
          }))
        : [
            { label: '250 g', grams: 250, price: 90, stock: 50, is_available: true },
            { label: '500 g', grams: 500, price: 175, stock: 50, is_available: true },
            { label: '1 kg', grams: 1000, price: 340, stock: 30, is_available: true }
          ]
    });
    setSelectedImageFile(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleVariantChange = (idx, field, value) => {
    const updated = [...formData.variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { label: 'Custom Pack', grams: 500, price: 100, stock: 30, is_available: true }
      ]
    }));
  };

  const handleRemoveVariant = (idx) => {
    if (formData.variants.length <= 1) {
      alert('Product must have at least one weight variant.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const dataPayload = new FormData();
      dataPayload.append('name', formData.name.trim());
      dataPayload.append('category_id', formData.category_id || categories[0]?.id);
      dataPayload.append('description', formData.description.trim());
      dataPayload.append('base_price', formData.base_price);
      dataPayload.append('is_featured', formData.is_featured);
      dataPayload.append('is_veg', formData.is_veg);
      dataPayload.append('is_active', formData.is_active);
      dataPayload.append('variants', JSON.stringify(formData.variants));

      if (selectedImageFile) {
        dataPayload.append('image', selectedImageFile);
      } else {
        dataPayload.append('imageUrl', formData.imageUrl);
        if (editingProduct) {
          dataPayload.append('existingImage', editingProduct.image);
        }
      }

      if (editingProduct) {
        await productsApi.update(editingProduct.id, dataPayload);
        showToast('success', 'Product updated successfully');
      } else {
        await productsApi.create(dataPayload);
        showToast('success', 'Product created successfully');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Product save error:', err);
      setModalError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await productsApi.toggleStatus(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: p.is_active ? 0 : 1 } : p));
      showToast('success', 'Product visibility updated');
    } catch (err) {
      showToast('error', 'Failed to update product status');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await productsApi.toggleFeatured(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured: p.is_featured ? 0 : 1 } : p));
      showToast('success', 'Featured status updated');
    } catch (err) {
      showToast('error', 'Failed to update featured flag');
    }
  };

  const openDeleteModal = (product) => {
    setDeleteModal({
      isOpen: true,
      product,
      loading: false,
      error: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.product) return;
    setDeleteModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await productsApi.delete(deleteModal.product.id);
      if (res.data?.success) {
        setProducts(prev => prev.filter(p => p.id !== deleteModal.product.id));
        showToast('success', res.data.message || 'Product deleted successfully');
        setDeleteModal({ isOpen: false, product: null, loading: false, error: '' });
      }
    } catch (err) {
      console.error('Delete product error:', err);
      const msg = err.response?.data?.message || 'Failed to delete product';
      setDeleteModal(prev => ({ ...prev, loading: false, error: msg }));
    }
  };

  const filtered = products.filter(p => {
    const matchCat = selectedCat === 'all' || String(p.category_id) === String(selectedCat);
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-purple-950">
            Products &amp; Variant Pricing
          </h1>
          <p className="text-xs text-gray-500">
            Manage sweet items, stock quantities, weight options (250g, 500g, 1kg), and featured items.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-[#393186] hover:bg-[#2a2463] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="w-full bg-stone-50 border border-purple-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-purple-600"
          />
          <Search className="w-3.5 h-3.5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-500 hidden sm:inline">Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-stone-50 border border-purple-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-purple-600"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Weight Variants &amp; Pricing</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Loading products...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">No products found.</td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-purple-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(prod.image)}
                          alt={prod.name}
                          onError={(e) => { e.currentTarget.src = '/assets/thabdi-penda.jpg'; }}
                          className="w-12 h-12 rounded-xl object-cover border border-purple-100 bg-stone-50 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            {prod.is_veg ? <VegBadge size="sm" /> : null}
                            <strong className="text-gray-900 font-serif text-sm">{prod.name}</strong>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">{prod.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                        {prod.category_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {prod.variants?.map((v) => (
                          <span
                            key={v.id}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              v.stock_quantity <= 0
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-stone-50 text-gray-800 border-gray-200'
                            }`}
                          >
                            <strong>{v.weight_label}:</strong> ₹{Number(v.price)}
                            <span className="text-[10px] text-gray-500">({v.stock_quantity} left)</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(prod.id)}
                        className={`p-1.5 rounded-lg transition ${
                          prod.is_featured
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-gray-300 hover:text-gray-500'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className={`w-4 h-4 ${prod.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(prod.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                          prod.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {prod.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 bg-purple-50 text-purple-900 hover:bg-purple-100 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(prod)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-fadeIn">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-purple-100 z-10 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-[#393186] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">
                {editingProduct ? 'Edit Sweet / Product' : 'Add New Sweet or Namkeen'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-purple-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
              {modalError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Kesar Penda"
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Authentic recipe details, ingredients, etc..."
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>

                {/* Image Upload */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Product Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-purple-200 bg-stone-100 shrink-0 shadow-inner">
                      <img
                        src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : getImageUrl(formData.imageUrl)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = '/assets/thabdi-penda.jpg'; }}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedImageFile(e.target.files[0])}
                        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-900 hover:file:bg-purple-200 cursor-pointer"
                      />
                      <p className="text-[11px] text-gray-400">Upload high quality JPG, PNG, or WebP photo.</p>
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div className="flex items-center gap-4 sm:col-span-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_veg}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_veg: e.target.checked }))}
                      className="rounded text-green-600"
                    />
                    <span>100% Pure Veg</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded text-amber-500"
                    />
                    <span>Featured on Home Page</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded text-purple-600"
                    />
                    <span>Active (Visible in Store)</span>
                  </label>
                </div>
              </div>

              {/* Weight Variants Repeater */}
              <div className="pt-4 border-t border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-purple-950">
                    Weight / Size Variants &amp; Inventory
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-purple-900 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Variant</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-2xl border border-gray-200">
                      <div className="w-24">
                        <label className="text-[10px] text-gray-500 block">Label</label>
                        <input
                          type="text"
                          required
                          value={v.label}
                          onChange={(e) => handleVariantChange(idx, 'label', e.target.value)}
                          placeholder="500 g"
                          className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold"
                        />
                      </div>

                      <div className="w-20">
                        <label className="text-[10px] text-gray-500 block">Grams</label>
                        <input
                          type="number"
                          value={v.grams}
                          onChange={(e) => handleVariantChange(idx, 'grams', Number(e.target.value))}
                          placeholder="500"
                          className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs"
                        />
                      </div>

                      <div className="w-24">
                        <label className="text-[10px] text-gray-500 block">Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={v.price}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          placeholder="175"
                          className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold text-purple-950"
                        />
                      </div>

                      <div className="w-20">
                        <label className="text-[10px] text-gray-500 block">Stock Qty</label>
                        <input
                          type="number"
                          required
                          value={v.stock}
                          onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))}
                          placeholder="50"
                          className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 mt-3"
                        title="Delete Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold transition shadow-md disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Product Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Product"
        itemName={deleteModal.product?.name}
        itemType="product"
        warningMessage="This product and its variant pricing will be permanently removed from your catalog. Past order snapshots will be preserved."
        loading={deleteModal.loading}
        errorMessage={deleteModal.error}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, product: null, loading: false, error: '' })}
      />

      {/* Floating Action Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-slideUp transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-900 text-emerald-100 border border-emerald-700 shadow-emerald-950/40'
            : 'bg-red-900 text-red-100 border border-red-700 shadow-red-950/40'
        }`}>
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
