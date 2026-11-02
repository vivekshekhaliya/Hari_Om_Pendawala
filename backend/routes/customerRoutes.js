const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// 1. Admin List Customers with order stats
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT 
        c.id, c.name, c.phone, c.email, c.created_at,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id
      ORDER BY total_spent DESC, c.created_at DESC
    `);
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// 2. Customer Saved Addresses
router.get('/addresses', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
});

// 3. Add Customer Address
router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const { label, recipient_name, phone, address_line, landmark, city, pincode, is_default } = req.body;
    if (!recipient_name || !phone || !address_line || !pincode) {
      return res.status(400).json({ success: false, message: 'Please fill all required address fields' });
    }

    if (is_default) {
      await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.user.id]);
    }

    const [result] = await pool.query(
      `INSERT INTO customer_addresses (customer_id, label, recipient_name, phone, address_line, landmark, city, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, label || 'Home', recipient_name, phone, address_line, landmark || '', city || 'Ahmedabad', pincode, is_default ? 1 : 0]
    );

    res.status(201).json({ success: true, message: 'Address saved successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save address' });
  }
});

// 4. Delete Address
router.delete('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?', [id, req.user.id]);
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
});

module.exports = router;
