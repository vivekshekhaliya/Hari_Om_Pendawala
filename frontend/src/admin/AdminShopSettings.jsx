import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2, AlertCircle, Save, Lock, Upload } from 'lucide-react';
import { shopApi, authApi } from '../services/api';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

export default function AdminShopSettings() {
  const { shop, refreshShopSettings } = useShop();
  const { user } = useAuth();

  const [shopForm, setShopForm] = useState({
    shop_name: '',
    tagline: '',
    phone: '',
    alternate_phone: '',
    email: '',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380057',
    google_maps_url: '',
    opening_hours: '',
    gst_number: '',
    gst_percentage: 5.0,
    announcement_text: '',
    is_store_open: true,
    logo_url: '/assets/logo.jpeg'
  });

  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('/assets/logo.jpeg');
  const [savingShop, setSavingShop] = useState(false);
  const [shopSuccess, setShopSuccess] = useState('');

  // Password & Admin Profile
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (shop) {
      setShopForm({
        shop_name: shop.shop_name || '',
        tagline: shop.tagline || '',
        phone: shop.phone || '',
        alternate_phone: shop.alternate_phone || '',
        email: shop.email || '',
        address: shop.address || '',
        city: shop.city || 'Ahmedabad',
        state: shop.state || 'Gujarat',
        pincode: shop.pincode || '380057',
        google_maps_url: shop.google_maps_url || '',
        opening_hours: shop.opening_hours || '',
        gst_number: shop.gst_number || '',
        gst_percentage: Number(shop.gst_percentage || 5),
        announcement_text: shop.announcement_text || '',
        is_store_open: Boolean(shop.is_store_open),
        logo_url: shop.logo_url || '/assets/logo.jpeg'
      });
      setLogoPreview(getImageUrl(shop.logo_url) || '/assets/logo.jpeg');
    }
  }, [shop]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveShopSettings = async (e) => {
    e.preventDefault();
    setSavingShop(true);
    setShopSuccess('');

    try {
      const payload = new FormData();
      Object.keys(shopForm).forEach(key => {
        payload.append(key, shopForm[key]);
      });

      if (selectedLogoFile) {
        payload.append('logo', selectedLogoFile);
      } else {
        payload.append('existingLogo', shopForm.logo_url);
      }

      const res = await shopApi.updateSettings(payload);
      if (res.data?.success) {
        setShopSuccess('Shop branding & contact settings updated successfully!');
        refreshShopSettings();
        setTimeout(() => setShopSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shop settings');
    } finally {
      setSavingShop(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await authApi.updateAdminProfile(profileForm);
      if (res.data?.success) {
        setProfileSuccess('Admin credentials updated successfully!');
        setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        setTimeout(() => setProfileSuccess(''), 3000);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update credentials');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Title */}
      <div>
        <h1 className="font-serif font-bold text-2xl text-purple-950">
          Shop Settings &amp; Store Branding
        </h1>
        <p className="text-xs text-gray-500">
          Manage shop name, logo, address, operating hours, GST, and administrator security.
        </p>
      </div>

      {shopSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{shopSuccess}</span>
        </div>
      )}

      {/* 1. Main Shop Information Form */}
      <form onSubmit={handleSaveShopSettings} className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="font-serif font-bold text-base text-purple-950 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-800" />
            <span>Store Identity &amp; Branding</span>
          </h2>

          <button
            type="submit"
            disabled={savingShop}
            className="inline-flex items-center gap-1.5 bg-[#393186] hover:bg-[#2a2463] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition transform active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{savingShop ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>

        {/* Logo & Name Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-stone-50 rounded-2xl border border-purple-100">
          <img
            src={getImageUrl(logoPreview)}
            alt="Logo Preview"
            onError={(e) => { e.currentTarget.src = '/assets/logo.jpeg'; }}
            className="h-20 w-auto object-contain border border-amber-400 bg-white p-1 rounded-xl shadow-md shrink-0"
          />

          <div className="space-y-1.5 flex-1">
            <span className="font-bold text-xs text-purple-950 block">Official Shop Logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-900 hover:file:bg-purple-200"
            />
            <p className="text-[10px] text-gray-500">Logo is rendered on website navbar, invoice receipts, and login screens.</p>
          </div>
        </div>

        {/* Name & Tagline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Display Shop Name *</label>
            <input
              type="text"
              required
              value={shopForm.shop_name}
              onChange={(e) => setShopForm(prev => ({ ...prev, shop_name: e.target.value }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-bold text-purple-950"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Tagline / Subtext</label>
            <input
              type="text"
              value={shopForm.tagline}
              onChange={(e) => setShopForm(prev => ({ ...prev, tagline: e.target.value }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-gray-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-gray-700 block mb-1">Top Announcement Banner Text</label>
            <input
              type="text"
              value={shopForm.announcement_text}
              onChange={(e) => setShopForm(prev => ({ ...prev, announcement_text: e.target.value }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 text-gray-800"
            />
          </div>
        </div>

        {/* Address, Location & Hours */}
        <div className="pt-4 border-t border-purple-100 space-y-4 text-xs">
          <h3 className="font-serif font-bold text-sm text-purple-950">Store Address &amp; Operating Hours</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-gray-700 block mb-1">Full Shop Address</label>
              <textarea
                rows={2}
                value={shopForm.address}
                onChange={(e) => setShopForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">City &amp; State</label>
              <input
                type="text"
                value={`${shopForm.city}, ${shopForm.state}`}
                onChange={(e) => setShopForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Pincode</label>
              <input
                type="text"
                value={shopForm.pincode}
                onChange={(e) => setShopForm(prev => ({ ...prev, pincode: e.target.value }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Primary Phone / WhatsApp</label>
              <input
                type="text"
                value={shopForm.phone}
                onChange={(e) => setShopForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Alternate Contact Number</label>
              <input
                type="text"
                value={shopForm.alternate_phone}
                onChange={(e) => setShopForm(prev => ({ ...prev, alternate_phone: e.target.value }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Shop Email Address</label>
              <input
                type="email"
                value={shopForm.email}
                onChange={(e) => setShopForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Store Opening Hours</label>
              <input
                type="text"
                value={shopForm.opening_hours}
                onChange={(e) => setShopForm(prev => ({ ...prev, opening_hours: e.target.value }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-700 block mb-1">Google Maps Directions URL</label>
              <input
                type="url"
                value={shopForm.google_maps_url}
                onChange={(e) => setShopForm(prev => ({ ...prev, google_maps_url: e.target.value }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Tax and GST Configuration */}
        <div className="pt-4 border-t border-purple-100 space-y-4 text-xs">
          <h3 className="font-serif font-bold text-sm text-purple-950">GST &amp; Tax Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">GST Registration Number</label>
              <input
                type="text"
                value={shopForm.gst_number}
                onChange={(e) => setShopForm(prev => ({ ...prev, gst_number: e.target.value }))}
                placeholder="24AAACH9876M1Z8"
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Applicable GST / Tax (%)</label>
              <input
                type="number"
                step="0.5"
                value={shopForm.gst_percentage}
                onChange={(e) => setShopForm(prev => ({ ...prev, gst_percentage: Number(e.target.value) }))}
                className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2 font-bold"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 2. Admin Security & Password Change */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm space-y-5 text-xs">
        <h2 className="font-serif font-bold text-base text-purple-950 flex items-center gap-2 border-b border-gray-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-purple-800" />
          <span>Admin Profile &amp; Password Security</span>
        </h2>

        {profileSuccess && (
          <div className="p-3 bg-green-50 text-green-800 rounded-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{profileError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Admin Display Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Current Password (to change password)</label>
            <input
              type="password"
              value={profileForm.currentPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Leave blank if keeping unchanged"
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">New Password</label>
            <input
              type="password"
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Leave blank if keeping unchanged"
              className="w-full bg-stone-50 border border-purple-200 rounded-xl px-3 py-2"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="bg-[#393186] hover:bg-[#2a2463] text-white font-bold px-5 py-2.5 rounded-xl transition shadow"
          >
            {savingProfile ? 'Updating...' : 'Update Admin Credentials'}
          </button>
        </div>
      </form>

    </div>
  );
}
