import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopApi, deliveryApi } from '../services/api';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [shop, setShop] = useState({
    shop_name: 'Hari Om Pendawala Sweet & Namkeen – Amreliwala',
    tagline: 'Authentic Taste of Saurashtra & Pure Desi Ghee Amreli Sweets',
    logo_url: '/assets/logo.jpeg',
    phone: '+91 97122 47979',
    alternate_phone: '',
    email: 'hariompendawala.bopal@gmail.com',
    address: 'Shop Number 8, Floor 2, Sun South Park, near SOBO Center Road, South Bopal, Bopal, Ahmedabad, Gujarat 380057',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380057',
    google_maps_url: 'https://www.google.com/maps/place/Hari+om+pendawala+sweet+%26+namkeen+-+Amreliwala/@23.0161268,72.4711575,17z',
    rating: 4.8,
    reviews_count: 58,
    opening_hours: 'Monday - Sunday: 8:00 AM – 10:30 PM',
    gst_percentage: 5.0,
    announcement_text: 'Festive Special: Pure Ghee Thabdi Penda & Special Gathiya available daily! Free delivery on orders above ₹500!',
    is_store_open: 1
  });

  const [deliverySettings, setDeliverySettings] = useState({
    is_delivery_enabled: 1,
    is_pickup_enabled: 1,
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
    ],
    serviceable_pincodes: []
  });

  const [loading, setLoading] = useState(true);

  const fetchShopData = async () => {
    try {
      const [shopRes, delRes] = await Promise.all([
        shopApi.getSettings(),
        deliveryApi.getSettings()
      ]);

      if (shopRes.data?.success && shopRes.data.data) {
        setShop(shopRes.data.data);
      }
      if (delRes.data?.success && delRes.data.data) {
        setDeliverySettings(delRes.data.data);
      }
    } catch (err) {
      console.warn('Using default shop settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  return (
    <ShopContext.Provider value={{ shop, deliverySettings, loading, refreshShopSettings: fetchShopData }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
