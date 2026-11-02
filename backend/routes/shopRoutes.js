const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 1. Get Shop Public Settings & Branding
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shop_settings WHERE id = 1');
    const settings = rows[0] || {
      shop_name: 'Hari Om Pendawala Sweet & Namkeen – Amreliwala',
      tagline: 'Authentic Taste of Saurashtra & Pure Amreli Sweets',
      logo_url: '/assets/logo.jpeg',
      phone: '+91 97122 47979',
      alternate_phone: '',
      address: 'Shop Number 8, Floor 2, Sun South Park, near SOBO Center Road, South Bopal, Bopal, Ahmedabad, Gujarat 380057',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380057',
      google_maps_url: 'https://www.google.com/maps/place/Hari+om+pendawala+sweet+%26+namkeen+-+Amreliwala/@23.0161268,72.4711575,17z',
      opening_hours: 'Monday - Sunday: 8:00 AM – 10:30 PM',
      gst_number: '24AAACH9876M1Z8',
      gst_percentage: 5.00,
      announcement_text: 'Festive Special: Pure Ghee Thabdi Penda & Special Gathiya available daily! Free delivery on orders above ₹500!',
      is_store_open: 1
    };

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Get shop settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch shop settings' });
  }
});

// 2. Update Shop Settings (Admin)
router.put('/', requireAdmin, upload.single('logo'), async (req, res) => {
  try {
    const {
      shop_name,
      tagline,
      phone,
      alternate_phone,
      email,
      address,
      city,
      state,
      pincode,
      google_maps_url,
      opening_hours,
      gst_number,
      gst_percentage,
      announcement_text,
      is_store_open,
      existingLogo
    } = req.body;

    const logoUrl = req.file ? `/uploads/${req.file.filename}` : existingLogo || '/assets/logo.jpeg';

    await pool.query(
      `UPDATE shop_settings SET
        shop_name = COALESCE(?, shop_name),
        tagline = COALESCE(?, tagline),
        logo_url = ?,
        phone = COALESCE(?, phone),
        alternate_phone = COALESCE(?, alternate_phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        google_maps_url = COALESCE(?, google_maps_url),
        opening_hours = COALESCE(?, opening_hours),
        gst_number = COALESCE(?, gst_number),
        gst_percentage = COALESCE(?, gst_percentage),
        announcement_text = COALESCE(?, announcement_text),
        is_store_open = COALESCE(?, is_store_open)
       WHERE id = 1`,
      [
        shop_name, tagline, logoUrl, phone, alternate_phone, email,
        address, city, state, pincode, google_maps_url, opening_hours,
        gst_number, gst_percentage !== undefined ? parseFloat(gst_percentage) : 5.00,
        announcement_text, is_store_open !== undefined ? (is_store_open ? 1 : 0) : 1
      ]
    );

    res.json({ success: true, message: 'Shop branding and settings updated successfully' });
  } catch (err) {
    console.error('Update shop settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to update shop settings' });
  }
});

module.exports = router;
