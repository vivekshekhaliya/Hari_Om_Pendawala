import React, { useState, useEffect } from 'react';
import { Truck, Store, MapPin, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Save, Sparkles, Check } from 'lucide-react';
import { deliveryApi } from '../services/api';
import { useShop } from '../context/ShopContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function AdminDeliverySettings() {
  const { refreshShopSettings } = useShop();
  const [settings, setSettings] = useState({
    is_delivery_enabled: true,
    is_pickup_enabled: true,
    fixed_delivery_charge: 40.0,
    per_km_charge: 8.0,
    free_delivery_threshold: 500.0,
    min_order_amount: 100.0,
    max_delivery_distance_km: 25.0,
    delivery_slots: [
      "09:00 AM - 12:00 PM",
      "12:00 PM - 03:00 PM",
      "03:00 PM - 06:00 PM",
      "06:00 PM - 09:30 PM"
    ]
  });

  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [slotInput, setSlotInput] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    pincode: null,
    loading: false,
    error: ''
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Pincode modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [pinForm, setPinForm] = useState({
    pincode: '',
    area_name: '',
    delivery_charge_override: ''
  });

  const fetchDeliveryData = async () => {
    try {
      const [setRes, pinRes] = await Promise.all([
        deliveryApi.getSettings(),
        deliveryApi.getPincodes()
      ]);

      if (setRes.data?.success && setRes.data.data) {
        setSettings({
          is_delivery_enabled: Boolean(setRes.data.data.is_delivery_enabled),
          is_pickup_enabled: Boolean(setRes.data.data.is_pickup_enabled),
          fixed_delivery_charge: Number(setRes.data.data.fixed_delivery_charge),
          per_km_charge: Number(setRes.data.data.per_km_charge),
          free_delivery_threshold: Number(setRes.data.data.free_delivery_threshold),
          min_order_amount: Number(setRes.data.data.min_order_amount),
          max_delivery_distance_km: Number(setRes.data.data.max_delivery_distance_km),
          delivery_slots: setRes.data.data.delivery_slots || []
        });
      }

      if (pinRes.data?.success) {
        setPincodes(pinRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load delivery settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccess('');

    try {
      const res = await deliveryApi.updateSettings(settings);
      if (res.data?.success) {
        setSaveSuccess('Delivery rules successfully updated and active!');
        refreshShopSettings();
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      alert('Failed to update delivery settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddSlot = () => {
    if (!slotInput.trim()) return;
    setSettings(prev => ({
      ...prev,
      delivery_slots: [...prev.delivery_slots, slotInput.trim()]
    }));
    setSlotInput('');
  };

  const handleRemoveSlot = (idx) => {
    setSettings(prev => ({
      ...prev,
      delivery_slots: prev.delivery_slots.filter((_, i) => i !== idx)
    }));
  };

  const openAddPinModal = () => {
    setEditingPin(null);
    setPinForm({ pincode: '', area_name: '', delivery_charge_override: '' });
    setIsPinModalOpen(true);
  };

  const openEditPinModal = (pin) => {
    setEditingPin(pin);
    setPinForm({
      pincode: pin.pincode,
      area_name: pin.area_name,
      delivery_charge_override: pin.delivery_charge_override !== null ? pin.delivery_charge_override : ''
    });
    setIsPinModalOpen(true);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPin) {
        await deliveryApi.updatePincode(editingPin.id, pinForm);
        showToast('success', 'Pincode updated successfully');
      } else {
        await deliveryApi.addPincode(pinForm);
        showToast('success', 'Pincode added successfully');
      }
      setIsPinModalOpen(false);
      fetchDeliveryData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save pincode');
    }
  };

  const openDeleteModal = (pin) => {
    setDeleteModal({
      isOpen: true,
      pincode: pin,
      loading: false,
      error: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.pincode) return;
    setDeleteModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await deliveryApi.deletePincode(deleteModal.pincode.id);
      if (res.data?.success) {
        setPincodes(prev => prev.filter(p => p.id !== deleteModal.pincode.id));
        showToast('success', res.data.message || 'Pincode deleted successfully');
        setDeleteModal({ isOpen: false, pincode: null, loading: false, error: '' });
      }
    } catch (err) {
      console.error('Delete pincode error:', err);
      const msg = err.response?.data?.message || 'Failed to delete pincode';
      setDeleteModal(prev => ({ ...prev, loading: false, error: msg }));
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="font-serif font-bold text-2xl text-purple-950">
          Delivery Configuration &amp; Service Areas
        </h1>
        <p className="text-xs text-gray-500">
          Configure delivery charges, free delivery thresholds, delivery slots, and serviceable Ahmedabad pincodes.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 1. Global Delivery Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="font-serif font-bold text-base text-purple-950 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-800" />
            <span>General Delivery Rules</span>
          </h2>

          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center gap-1.5 bg-[#393186] hover:bg-[#2a2463] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition transform active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {/* Enable / Disable Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-gray-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-purple-800" />
              <div>
                <strong className="text-xs text-gray-900 block">Home Delivery Service</strong>
                <span className="text-[11px] text-gray-500">Allow customers to choose doorstep delivery</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.is_delivery_enabled}
              onChange={(e) => setSettings(prev => ({ ...prev, is_delivery_enabled: e.target.checked }))}
              className="w-5 h-5 rounded text-purple-900 focus:ring-purple-600"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-gray-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-purple-800" />
              <div>
                <strong className="text-xs text-gray-900 block">Store Pickup Service</strong>
                <span className="text-[11px] text-gray-500">Allow customers to pick up orders at South Bopal counter</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.is_pickup_enabled}
              onChange={(e) => setSettings(prev => ({ ...prev, is_pickup_enabled: e.target.checked }))}
              className="w-5 h-5 rounded text-purple-900 focus:ring-purple-600"
            />
          </label>
        </div>

        {/* Pricing Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Fixed Delivery Charge (₹)
            </label>
            <input
              type="number"
              step="1"
              required
              value={settings.fixed_delivery_charge}
              onChange={(e) => setSettings(prev => ({ ...prev, fixed_delivery_charge: Number(e.target.value) }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 font-bold text-purple-950 text-xs focus:outline-none focus:border-purple-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">Applied when no area override exists</span>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Per-Kilometre Charge (₹)
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={settings.per_km_charge}
              onChange={(e) => setSettings(prev => ({ ...prev, per_km_charge: Number(e.target.value) }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 font-bold text-purple-950 text-xs focus:outline-none focus:border-purple-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">For distance-based delivery calculation</span>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Free Delivery Threshold (₹)
            </label>
            <input
              type="number"
              step="10"
              required
              value={settings.free_delivery_threshold}
              onChange={(e) => setSettings(prev => ({ ...prev, free_delivery_threshold: Number(e.target.value) }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 font-bold text-green-700 text-xs focus:outline-none focus:border-purple-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">Orders above this amount get FREE delivery</span>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Minimum Order Amount (₹)
            </label>
            <input
              type="number"
              step="10"
              required
              value={settings.min_order_amount}
              onChange={(e) => setSettings(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 font-bold text-purple-950 text-xs focus:outline-none focus:border-purple-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">Checkout requires at least this value</span>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Max Delivery Distance (km)
            </label>
            <input
              type="number"
              step="1"
              required
              value={settings.max_delivery_distance_km}
              onChange={(e) => setSettings(prev => ({ ...prev, max_delivery_distance_km: Number(e.target.value) }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3.5 py-2.5 font-bold text-purple-950 text-xs focus:outline-none focus:border-purple-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">Maximum radius from South Bopal</span>
          </div>
        </div>

        {/* Delivery Time Slots Manager */}
        <div className="pt-4 border-t border-purple-100 space-y-3">
          <label className="font-serif font-bold text-sm text-purple-950 block">
            Customer Delivery Time Slots
          </label>

          <div className="flex flex-wrap gap-2">
            {settings.delivery_slots?.map((slot, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-950 border border-purple-200"
              >
                <span>{slot}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(idx)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm pt-1">
            <input
              type="text"
              value={slotInput}
              onChange={(e) => setSlotInput(e.target.value)}
              placeholder="e.g. 07:00 PM - 10:00 PM"
              className="flex-1 bg-stone-50 border border-purple-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSlot}
              className="bg-purple-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
            >
              Add Slot
            </button>
          </div>
        </div>
      </form>

      {/* 2. Serviceable Pincodes and Area-Specific Delivery Fees */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-base text-purple-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-800" />
              <span>Serviceable Pincodes &amp; Custom Area Charges</span>
            </h3>
            <span className="text-xs text-gray-500">
              Orders to these pincodes are accepted. You can set specific flat rates per area.
            </span>
          </div>

          <button
            onClick={openAddPinModal}
            className="inline-flex items-center gap-1.5 bg-purple-900 hover:bg-purple-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Serviceable Pincode</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pincode</th>
                <th className="py-3 px-4">Area / Locality</th>
                <th className="py-3 px-4">Custom Delivery Fee</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {pincodes.map((pin) => (
                <tr key={pin.id} className="hover:bg-purple-50/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-purple-950 text-sm">
                    {pin.pincode}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {pin.area_name}
                  </td>
                  <td className="py-3 px-4">
                    {pin.delivery_charge_override !== null ? (
                      <span className="font-bold text-purple-900 font-sans">
                        ₹{Number(pin.delivery_charge_override).toFixed(2)} (Custom)
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        Default (₹{settings.fixed_delivery_charge})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pin.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {pin.is_active ? 'Serviceable' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEditPinModal(pin)}
                        className="p-1.5 bg-purple-50 text-purple-900 rounded-lg hover:bg-purple-100"
                        title="Edit Pincode"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(pin)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        title="Delete Pincode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Pincode Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-fadeIn">
          <div onClick={() => setIsPinModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 z-10 border border-purple-100">
            <h3 className="font-serif font-bold text-base text-purple-950">
              {editingPin ? 'Edit Serviceable Pincode' : 'Add New Serviceable Pincode'}
            </h3>

            <form onSubmit={handlePinSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">6-Digit Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinForm.pincode}
                  onChange={(e) => setPinForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                  placeholder="e.g. 380057"
                  className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Area / Locality Name *</label>
                <input
                  type="text"
                  required
                  value={pinForm.area_name}
                  onChange={(e) => setPinForm(prev => ({ ...prev, area_name: e.target.value }))}
                  placeholder="e.g. South Bopal / Sun South Park"
                  className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Custom Delivery Charge Override (₹, Optional)
                </label>
                <input
                  type="number"
                  step="1"
                  value={pinForm.delivery_charge_override}
                  onChange={(e) => setPinForm(prev => ({ ...prev, delivery_charge_override: e.target.value }))}
                  placeholder={`Leave blank to use default (₹${settings.fixed_delivery_charge})`}
                  className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-900 text-white font-bold hover:bg-purple-950 shadow"
                >
                  Save Pincode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Pincode Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Serviceable Pincode"
        itemName={deleteModal.pincode ? `${deleteModal.pincode.pincode} - ${deleteModal.pincode.area_name}` : ''}
        itemType="pincode"
        warningMessage="This pincode will be removed from your serviceable area. Customers with this pincode will no longer be eligible for direct delivery."
        loading={deleteModal.loading}
        errorMessage={deleteModal.error}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, pincode: null, loading: false, error: '' })}
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
