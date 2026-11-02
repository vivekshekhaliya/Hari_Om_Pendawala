const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET, verifyToken, requireAdmin } = require('../middleware/auth');

// 1. Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const [rows] = await pool.query('SELECT * FROM admin_users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// 2. Customer Register
router.post('/customer/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and mobile number are required' });
    }

    const [existing] = await pool.query('SELECT id FROM customers WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Customer with this phone number already exists' });
    }

    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const [result] = await pool.query(
      'INSERT INTO customers (name, phone, email, password_hash) VALUES (?, ?, ?, ?)',
      [name, phone, email || null, passwordHash]
    );

    const customerId = result.insertId;
    const token = jwt.sign(
      { id: customerId, name, phone, email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: customerId, name, phone, email, role: 'customer' }
    });
  } catch (err) {
    console.error('Customer register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// 3. Customer Login (Supports phone or email)
router.post('/customer/login', async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;
    if (!phoneOrEmail) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE phone = ? OR email = ?',
      [phoneOrEmail, phoneOrEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this phone/email' });
    }

    const customer = rows[0];

    // If customer has a password, verify it; otherwise if guest checkout login, allow direct session
    if (customer.password_hash && password) {
      const isMatch = await bcrypt.compare(password, customer.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
    }

    const token = jwt.sign(
      { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: 'customer'
      }
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// 4. Get Current User (Admin or Customer)
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM admin_users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Admin not found' });
      return res.json({ success: true, user: rows[0] });
    } else {
      const [rows] = await pool.query('SELECT id, name, phone, email, role, created_at FROM customers WHERE id = ?', [req.user.id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Customer not found' });
      return res.json({ success: true, user: rows[0] });
    }
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 5. Update Admin Profile / Password
router.put('/admin/profile', requireAdmin, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [adminId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Admin not found' });

    const admin = rows[0];

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match' });
      }
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      await pool.query(
        'UPDATE admin_users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
        [name || admin.name, email || admin.email, newHash, adminId]
      );
    } else {
      await pool.query(
        'UPDATE admin_users SET name = ?, email = ? WHERE id = ?',
        [name || admin.name, email || admin.email, adminId]
      );
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Admin profile update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
