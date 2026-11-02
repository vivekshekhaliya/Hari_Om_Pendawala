import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, Check, X, AlertCircle } from 'lucide-react';
import { categoriesApi } from '../services/api';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { getImageUrl } from '../utils/imageUrl';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 1,
    is_active: true,
    imageUrl: '/assets/thabdi-penda.jpg'
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
    loading: false,
    error: '',
    forceChecked: false
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll(true);
      if (res.data?.success) setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      display_order: (categories.length || 0) + 1,
      is_active: true,
      imageUrl: '/assets/thabdi-penda.jpg'
    });
    setSelectedImageFile(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      display_order: cat.display_order || 1,
      is_active: Boolean(cat.is_active),
      imageUrl: cat.image || '/assets/thabdi-penda.jpg'
    });
    setSelectedImageFile(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('slug', formData.slug.trim());
      payload.append('description', formData.description.trim());
      payload.append('display_order', formData.display_order);
      payload.append('is_active', formData.is_active);

      if (selectedImageFile) {
        payload.append('image', selectedImageFile);
      } else {
        payload.append('imageUrl', formData.imageUrl);
        if (editingCategory) payload.append('existingImage', editingCategory.image);
      }

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, payload);
        showToast('success', 'Category updated successfully');
      } else {
        await categoriesApi.create(payload);
        showToast('success', 'Category created successfully');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Save category error:', err);
      setModalError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setModalLoading(false);
    }
  };

  const openDeleteModal = (cat) => {
    setDeleteModal({
      isOpen: true,
      category: cat,
      loading: false,
      error: '',
      forceChecked: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.category) return;
    setDeleteModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await categoriesApi.delete(deleteModal.category.id, {
        force: deleteModal.forceChecked
      });
      if (res.data?.success) {
        showToast('success', res.data.message || 'Category deleted successfully');
        setDeleteModal({ isOpen: false, category: null, loading: false, error: '', forceChecked: false });
        fetchCategories();
      }
    } catch (err) {
      console.error('Delete category error:', err);
      const msg = err.response?.data?.message || 'Failed to delete category';
      setDeleteModal(prev => ({ ...prev, loading: false, error: msg }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-purple-950">
            Category Management
          </h1>
          <p className="text-xs text-gray-500">
            Organize sweet &amp; namkeen categories, sort display order, and update banners.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-[#393186] hover:bg-[#2a2463] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-gray-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-gray-400">No categories created yet.</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/9] w-full bg-stone-100">
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.name}
                    onError={(e) => { e.currentTarget.src = '/assets/thabdi-penda.jpg'; }}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                    Order: #{cat.display_order}
                  </span>
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    cat.is_active ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {cat.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-serif font-bold text-base text-purple-950">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] font-mono text-gray-400 block mb-2">
                    /{cat.slug}
                  </span>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-stone-50 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  {cat.product_count || 0} Products
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 bg-purple-100 text-purple-900 rounded-lg hover:bg-purple-200 transition"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(cat)}
                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-fadeIn">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-purple-100 z-10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif font-bold text-base text-purple-950">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                  }))}
                  placeholder="e.g. Gujarati Sweets"
                  className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-stone-50 border border-purple-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded text-purple-700"
                    />
                    <span>Active Category</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Category Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-purple-200 bg-stone-100 shrink-0 shadow-inner">
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
                    <p className="text-[11px] text-gray-400">Upload category banner photo.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
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
                  className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold transition shadow"
                >
                  {modalLoading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Category Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Category"
        itemName={deleteModal.category?.name}
        itemType="category"
        warningMessage={
          deleteModal.category?.product_count > 0
            ? `This category currently contains ${deleteModal.category.product_count} product(s). If you proceed with force deletion, all associated products and their variants will also be deleted.`
            : 'This category will be permanently deleted.'
        }
        forceCheckbox={deleteModal.category?.product_count > 0}
        forceCheckboxLabel={`I understand and want to permanently delete this category along with all ${deleteModal.category?.product_count || 0} product(s)`}
        forceChecked={deleteModal.forceChecked}
        onForceChange={(checked) => setDeleteModal(prev => ({ ...prev, forceChecked: checked }))}
        loading={deleteModal.loading}
        errorMessage={deleteModal.error}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, category: null, loading: false, error: '', forceChecked: false })}
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
