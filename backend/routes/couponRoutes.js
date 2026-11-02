const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// 1. Verify coupon code (Customer Checkout)
router.post('/verify', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const numericSubtotal = parseFloat(subtotal) || 0;
    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1',
      [code.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const coupon = rows[0];

    // Check minimum order amount
    if (numericSubtotal < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order value of ₹${parseFloat(coupon.min_order_amount).toFixed(2)}`
      });
    }

    // Check expiration if set
    const today = new Date();
    if (coupon.valid_until && new Date(coupon.valid_until) < today) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (numericSubtotal * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount && discount > parseFloat(coupon.max_discount)) {
        discount = parseFloat(coupon.max_discount);
      }
    } else {
      // flat discount
      discount = parseFloat(coupon.discount_value);
    }

    // Cannot exceed subtotal
    if (discount > numericSubtotal) {
      discount = numericSubtotal;
    }

    res.json({
      success: true,
      code: coupon.code,
      discount_amount: Math.round(discount * 100) / 100,
      description: coupon.description,
      message: `Coupon '${coupon.code}' applied! You save ₹${discount.toFixed(2)}`
    });
  } catch (err) {
    console.error('Verify coupon error:', err);
    res.status(500).json({ success: false, message: 'Error verifying coupon' });
  }
});

// 2. Admin Coupon Management
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [coupons] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, valid_until, usage_limit, is_active } = req.body;
    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, valid_until, usage_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase().trim(),
        description || '',
        discount_type || 'percentage',
        parseFloat(discount_value),
        min_order_amount ? parseFloat(min_order_amount) : 0.00,
        max_discount ? parseFloat(max_discount) : null,
        valid_until || null,
        usage_limit ? parseInt(usage_limit) : 1000,
        is_active !== false ? 1 : 0
      ]
    );

    res.status(201).json({ success: true, message: 'Coupon created successfully', id: result.insertId });
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ success: false, message: 'Failed to create coupon. Code might already exist.' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, valid_until, usage_limit, is_active } = req.body;

    await pool.query(
      `UPDATE coupons SET
        code = COALESCE(?, code),
        description = COALESCE(?, description),
        discount_type = COALESCE(?, discount_type),
        discount_value = COALESCE(?, discount_value),
        min_order_amount = COALESCE(?, min_order_amount),
        max_discount = ?,
        valid_until = ?,
        usage_limit = COALESCE(?, usage_limit),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        code ? code.toUpperCase().trim() : null,
        description !== undefined ? description : null,
        discount_type || null,
        discount_value !== undefined ? parseFloat(discount_value) : null,
        min_order_amount !== undefined ? parseFloat(min_order_amount) : null,
        max_discount !== undefined && max_discount !== '' ? parseFloat(max_discount) : null,
        valid_until || null,
        usage_limit !== undefined ? parseInt(usage_limit) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    res.json({ success: true, message: 'Coupon updated successfully' });
  } catch (err) {
    console.error('Update coupon error:', err);
    res.status(500).json({ success: false, message: 'Failed to update coupon' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
});

module.exports = router;
