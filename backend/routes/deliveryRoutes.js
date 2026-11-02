const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// 1. Get current delivery settings & serviceable areas
router.get('/', async (req, res) => {
  try {
    const [settingsRows] = await pool.query('SELECT * FROM delivery_settings WHERE id = 1');
    const settings = settingsRows[0] || {
      is_delivery_enabled: 1,
      is_pickup_enabled: 1,
      fixed_delivery_charge: 40.00,
      per_km_charge: 8.00,
      free_delivery_threshold: 500.00,
      min_order_amount: 100.00,
      max_delivery_distance_km: 25.00,
      delivery_slots_json: '["09:00 AM - 12:00 PM", "12:00 PM - 03:00 PM", "03:00 PM - 06:00 PM", "06:00 PM - 09:30 PM"]'
    };

    if (settings.delivery_slots_json) {
      try {
        settings.delivery_slots = JSON.parse(settings.delivery_slots_json);
      } catch (e) {
        settings.delivery_slots = [];
      }
    }

    const [pincodes] = await pool.query('SELECT * FROM serviceable_areas WHERE is_active = 1 ORDER BY pincode ASC');
    settings.serviceable_pincodes = pincodes;

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Get delivery settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery settings' });
  }
});

// 2. Server-side delivery charge calculation
router.post('/calculate', async (req, res) => {
  try {
    const { subtotal, delivery_type, pincode, distance_km } = req.body;
    const numericSubtotal = parseFloat(subtotal) || 0;

    const [settingsRows] = await pool.query('SELECT * FROM delivery_settings WHERE id = 1');
    const settings = settingsRows[0];

    // Pickup
    if (delivery_type === 'pickup') {
      if (!settings.is_pickup_enabled) {
        return res.status(400).json({ success: false, message: 'Store pickup is currently disabled.' });
      }
      return res.json({
        success: true,
        delivery_charge: 0,
        is_free: true,
        serviceable: true,
        message: 'Store pickup selected. Free of charge.'
      });
    }

    // Delivery checks
    if (!settings.is_delivery_enabled) {
      return res.status(400).json({ success: false, message: 'Home delivery is currently disabled.' });
    }

    if (numericSubtotal < parseFloat(settings.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for delivery is ₹${parseFloat(settings.min_order_amount).toFixed(2)}`
      });
    }

    if (!pincode) {
      return res.status(400).json({ success: false, message: 'Delivery pincode is required.' });
    }

    // Check pincode serviceability
    const [areaRows] = await pool.query(
      'SELECT * FROM serviceable_areas WHERE pincode = ? AND is_active = 1',
      [pincode.trim()]
    );

    if (areaRows.length === 0) {
      return res.json({
        success: false,
        serviceable: false,
        delivery_charge: 0,
        message: `Pincode ${pincode} is not currently serviceable. Please choose Store Pickup or contact shop directly.`
      });
    }

    const matchedArea = areaRows[0];

    // Check Free Delivery threshold
    if (numericSubtotal >= parseFloat(settings.free_delivery_threshold)) {
      return res.json({
        success: true,
        serviceable: true,
        delivery_charge: 0,
        is_free: true,
        area_name: matchedArea.area_name,
        free_threshold: parseFloat(settings.free_delivery_threshold),
        message: `🎉 Free Delivery unlocked! (Order above ₹${parseFloat(settings.free_delivery_threshold).toFixed(2)})`
      });
    }

    // If pincode has custom charge override
    let finalCharge = 0;
    if (matchedArea.delivery_charge_override !== null && matchedArea.delivery_charge_override !== undefined) {
      finalCharge = parseFloat(matchedArea.delivery_charge_override);
    } else {
      // Base calculation: fixed + distance
      finalCharge = parseFloat(settings.fixed_delivery_charge);
      const dist = parseFloat(distance_km) || 0;
      if (dist > 0) {
        if (settings.max_delivery_distance_km && dist > parseFloat(settings.max_delivery_distance_km)) {
          return res.json({
            success: false,
            serviceable: false,
            message: `Delivery distance (${dist} km) exceeds maximum limit of ${settings.max_delivery_distance_km} km.`
          });
        }
        finalCharge += dist * parseFloat(settings.per_km_charge);
      }
    }

    const freeThresholdDiff = parseFloat(settings.free_delivery_threshold) - numericSubtotal;

    res.json({
      success: true,
      serviceable: true,
      delivery_charge: Math.round(finalCharge),
      is_free: false,
      area_name: matchedArea.area_name,
      free_threshold_diff: freeThresholdDiff > 0 ? freeThresholdDiff : 0,
      message: freeThresholdDiff > 0 
        ? `Add ₹${freeThresholdDiff.toFixed(2)} more for FREE delivery!`
        : 'Standard delivery charges apply'
    });
  } catch (err) {
    console.error('Calculate delivery error:', err);
    res.status(500).json({ success: false, message: 'Error calculating delivery charge' });
  }
});

// 3. Update delivery settings (Admin)
router.put('/', requireAdmin, async (req, res) => {
  try {
    const {
      is_delivery_enabled,
      is_pickup_enabled,
      fixed_delivery_charge,
      per_km_charge,
      free_delivery_threshold,
      min_order_amount,
      max_delivery_distance_km,
      delivery_slots
    } = req.body;

    const slotsJson = delivery_slots ? JSON.stringify(delivery_slots) : null;

    await pool.query(
      `UPDATE delivery_settings SET
        is_delivery_enabled = ?,
        is_pickup_enabled = ?,
        fixed_delivery_charge = ?,
        per_km_charge = ?,
        free_delivery_threshold = ?,
        min_order_amount = ?,
        max_delivery_distance_km = ?,
        delivery_slots_json = COALESCE(?, delivery_slots_json)
       WHERE id = 1`,
      [
        is_delivery_enabled !== undefined ? (is_delivery_enabled ? 1 : 0) : 1,
        is_pickup_enabled !== undefined ? (is_pickup_enabled ? 1 : 0) : 1,
        fixed_delivery_charge !== undefined ? fixed_delivery_charge : 40.00,
        per_km_charge !== undefined ? per_km_charge : 8.00,
        free_delivery_threshold !== undefined ? free_delivery_threshold : 500.00,
        min_order_amount !== undefined ? min_order_amount : 100.00,
        max_delivery_distance_km !== undefined ? max_delivery_distance_km : 25.00,
        slotsJson
      ]
    );

    res.json({ success: true, message: 'Delivery settings updated successfully' });
  } catch (err) {
    console.error('Update delivery settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to update delivery settings' });
  }
});

// 4. Pincodes CRUD (Admin)
router.get('/pincodes', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM serviceable_areas ORDER BY pincode ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pincodes' });
  }
});

router.post('/pincodes', requireAdmin, async (req, res) => {
  try {
    const { pincode, area_name, delivery_charge_override } = req.body;
    if (!pincode || !area_name) {
      return res.status(400).json({ success: false, message: 'Pincode and area name are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO serviceable_areas (pincode, area_name, delivery_charge_override, is_active)
       VALUES (?, ?, ?, 1)`,
      [pincode.trim(), area_name.trim(), delivery_charge_override ? parseFloat(delivery_charge_override) : null]
    );

    res.status(201).json({ success: true, message: 'Pincode added successfully', id: result.insertId });
  } catch (err) {
    console.error('Add pincode error:', err);
    res.status(500).json({ success: false, message: 'Failed to add pincode. It might already exist.' });
  }
});

router.put('/pincodes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { pincode, area_name, delivery_charge_override, is_active } = req.body;

    await pool.query(
      `UPDATE serviceable_areas SET 
        pincode = COALESCE(?, pincode), 
        area_name = COALESCE(?, area_name), 
        delivery_charge_override = ?, 
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        pincode ? pincode.trim() : null,
        area_name ? area_name.trim() : null,
        delivery_charge_override !== undefined && delivery_charge_override !== '' ? parseFloat(delivery_charge_override) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    res.json({ success: true, message: 'Pincode updated successfully' });
  } catch (err) {
    console.error('Update pincode error:', err);
    res.status(500).json({ success: false, message: 'Failed to update pincode' });
  }
});

router.delete('/pincodes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM serviceable_areas WHERE id = ?', [id]);
    res.json({ success: true, message: 'Pincode deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete pincode' });
  }
});

module.exports = router;
