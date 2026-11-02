import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Check, X, AlertCircle } from 'lucide-react';
import { couponsApi } from '../services/api';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    coupon: null,
    loading: false,
    error: ''
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage', // 'percentage' or 'flat'
    discount_value: 10,
    min_order_amount: 300,
    max_discount: 100,
    valid_until: '',
    usage_limit: 500,
    is_active: true
  });

  const fetchCoupons = async () => {
    try {
      const res = await couponsApi.getAll();
      if (res.data?.success) setCoupons(res.data.data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 300,
      max_discount: 100,
      valid_until: '',
      usage_limit: 500,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type || 'percentage',
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount || 0,
      max_discount: c.max_discount || '',
      valid_until: c.valid_until ? c.valid_until.slice(0, 10) : '',
      usage_limit: c.usage_limit || 1000,
      is_active: Boolean(c.is_active)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await couponsApi.update(editingCoupon.id, formData);
        showToast('success', 'Coupon updated successfully');
      } else {
        await couponsApi.create(formData);
        showToast('success', 'Coupon created successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const openDeleteModal = (coupon) => {
    setDeleteModal({
      isOpen: true,
      coupon,
      loading: false,
      error: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.coupon) return;
    setDeleteModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await couponsApi.delete(deleteModal.coupon.id);
      if (res.data?.success) {
        setCoupons(prev => prev.filter(c => c.id !== deleteModal.coupon.id));
        showToast('success', res.data.message || 'Coupon deleted successfully');
        setDeleteModal({ isOpen: false, coupon: null, loading: false, error: '' });
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
      const msg = err.response?.data?.message || 'Failed to delete coupon';
      setDeleteModal(prev => ({ ...prev, loading: false, error: msg }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-purple-950">
            Promotional Coupons &amp; Discounts
          </h1>
          <p className="text-xs text-gray-500">
            Create discount vouchers for festive seasons, first-time orders, and bulk buyers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-[#393186] hover:bg-[#2a2463] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Min. Order Value</th>
                <th className="py-3 px-4">Usage Stats</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">No coupons created yet.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-purple-50/30 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        {c.code}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900 font-sans">
                      {c.discount_type === 'percentage'
                        ? `${c.discount_value}% OFF`
                        : `₹${Number(c.discount_value).toFixed(2)} OFF`}
                      {c.max_discount && (
                        <span className="text-[10px] text-gray-400 block font-normal">
                          Max ₹{c.max_discount}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-gray-600">
                      {c.description || '-'}
                    </td>

                    <td className="py-3.5 px-4 font-semibold font-sans">
                      ₹{Number(c.min_order_amount || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      {c.times_used} uses
                      {c.usage_limit && <span className="text-gray-400 text-[10px]"> / {c.usage_limit}</span>}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 bg-purple-50 text-purple-900 rounded-lg hover:bg-purple-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(c)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          title="Delete Coupon"
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

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-fadeIn">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 z-10 border border-purple-100">
            <h3 className="font-serif font-bold text-base text-purple-950">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. DIWALI20"
                  className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-mono font-bold text-purple-950"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Flat ₹50 OFF on orders above ₹400"
                  className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Min. Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value }))}
                    placeholder="Optional"
                    className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded text-purple-700"
                  />
                  <span>Active &amp; Redeemable by Customers</span>
                </label>
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
                  className="px-5 py-2 rounded-xl bg-purple-900 text-white font-bold hover:bg-purple-950 shadow"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Coupon Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Coupon"
        itemName={deleteModal.coupon?.code}
        itemType="coupon"
        warningMessage="This coupon code will be permanently deleted and cannot be applied to future orders."
        loading={deleteModal.loading}
        errorMessage={deleteModal.error}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, coupon: null, loading: false, error: '' })}
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
