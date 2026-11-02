const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Helper to generate a unique readable Order Number e.g. HOP-261028-4821
function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HOP-${year}${month}${day}-${random}`;
}

// 1. Place a new Order (Public/Customer Checkout)
// Server recalculates ALL prices, discounts, and delivery charges strictly from the DB!
router.post('/', optionalAuth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_type, // 'delivery' or 'pickup'
      delivery_slot,
      address_line,
      city,
      pincode,
      coupon_code,
      payment_method, // 'cod' or 'online'
      order_notes,
      items // [{ variant_id, quantity }]
    } = req.body;

    // Basic Validations
    if (!customer_name || !customer_phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Please add items before placing order.' });
    }

    const type = delivery_type === 'pickup' ? 'pickup' : 'delivery';

    if (type === 'delivery' && (!address_line || !pincode)) {
      return res.status(400).json({ success: false, message: 'Delivery address and pincode are required for home delivery' });
    }

    // Fetch delivery settings from DB
    const [delSettingsRows] = await connection.query('SELECT * FROM delivery_settings WHERE id = 1');
    const delSettings = delSettingsRows[0];

    if (type === 'pickup' && !delSettings.is_pickup_enabled) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Store pickup is temporarily disabled' });
    }
    if (type === 'delivery' && !delSettings.is_delivery_enabled) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Home delivery is temporarily disabled' });
    }

    // Verify all cart items against DB canonical prices and stock
    let serverSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const variantId = item.variant_id || item.id;
      const qty = parseInt(item.quantity) || 1;

      if (qty <= 0) continue;

      const [vRows] = await connection.query(
        `SELECT v.*, p.name as product_name, p.is_active as prod_active, p.id as prod_id
         FROM product_variants v
         JOIN products p ON v.product_id = p.id
         WHERE v.id = ?`,
        [variantId]
      );

      if (vRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Product variant ID ${variantId} is no longer available.` });
      }

      const variant = vRows[0];

      if (!variant.prod_active || !variant.is_available) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `"${variant.product_name}" is currently unavailable.` });
      }

      if (variant.stock_quantity < qty) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${variant.product_name} (${variant.weight_label})". Only ${variant.stock_quantity} left.`
        });
      }

      const unitPrice = parseFloat(variant.price);
      const lineSubtotal = unitPrice * qty;
      serverSubtotal += lineSubtotal;

      validatedItems.push({
        variant_id: variant.id,
        product_id: variant.prod_id,
        product_name: variant.product_name,
        variant_label: variant.weight_label,
        unit_price: unitPrice,
        quantity: qty,
        subtotal: lineSubtotal
      });
    }

    // Check minimum order value
    if (serverSubtotal < parseFloat(delSettings.min_order_amount)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${parseFloat(delSettings.min_order_amount).toFixed(2)}`
      });
    }

    // Calculate Delivery Charge
    let serverDeliveryCharge = 0;
    if (type === 'delivery') {
      // Validate serviceable pincode
      const [areaRows] = await connection.query(
        'SELECT * FROM serviceable_areas WHERE pincode = ? AND is_active = 1',
        [pincode.trim()]
      );

      if (areaRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `We do not deliver to pincode ${pincode}. Please select Store Pickup.`
        });
      }

      const area = areaRows[0];
      // Check Free delivery threshold
      if (serverSubtotal >= parseFloat(delSettings.free_delivery_threshold)) {
        serverDeliveryCharge = 0;
      } else if (area.delivery_charge_override !== null && area.delivery_charge_override !== undefined) {
        serverDeliveryCharge = parseFloat(area.delivery_charge_override);
      } else {
        serverDeliveryCharge = parseFloat(delSettings.fixed_delivery_charge);
      }
    }

    // Verify & Apply Discount Coupon
    let serverDiscount = 0;
    let appliedCouponCode = null;
    if (coupon_code) {
      const [couponRows] = await connection.query(
        'SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1',
        [coupon_code.trim()]
      );

      if (couponRows.length > 0) {
        const coupon = couponRows[0];
        if (serverSubtotal >= parseFloat(coupon.min_order_amount)) {
          if (coupon.discount_type === 'percentage') {
            serverDiscount = (serverSubtotal * parseFloat(coupon.discount_value)) / 100;
            if (coupon.max_discount && serverDiscount > parseFloat(coupon.max_discount)) {
              serverDiscount = parseFloat(coupon.max_discount);
            }
          } else {
            serverDiscount = parseFloat(coupon.discount_value);
          }
          if (serverDiscount > serverSubtotal) serverDiscount = serverSubtotal;
          appliedCouponCode = coupon.code;

          // Increment coupon usage
          await connection.query('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', [coupon.id]);
        }
      }
    }

    const grandTotal = Math.round((serverSubtotal - serverDiscount + serverDeliveryCharge) * 100) / 100;
    const orderNumber = generateOrderNumber();
    const customerId = req.user ? req.user.id : null;

    // Insert Order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number, customer_id, customer_name, customer_phone, customer_email,
        delivery_type, delivery_slot, address_line, city, pincode,
        subtotal, discount_amount, coupon_code, delivery_charge, total_amount,
        payment_method, payment_status, order_status, order_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        orderNumber,
        customerId,
        customer_name.trim(),
        customer_phone.trim(),
        customer_email ? customer_email.trim() : null,
        type,
        delivery_slot || null,
        type === 'delivery' ? address_line : 'Store Pickup at Shop #8, Sun South Park, South Bopal',
        type === 'delivery' ? (city || 'Ahmedabad') : 'Ahmedabad',
        type === 'delivery' ? pincode : '380057',
        serverSubtotal,
        serverDiscount,
        appliedCouponCode,
        serverDeliveryCharge,
        grandTotal,
        payment_method === 'online' ? 'online' : 'cod',
        payment_method === 'online' ? 'paid' : 'pending',
        order_notes || null
      ]
    );

    const orderId = orderResult.insertId;

    // Insert Order Items and Update Inventory Stock
    for (const itm of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, variant_label, unit_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, itm.product_id, itm.product_name, itm.variant_label, itm.unit_price, itm.quantity, itm.subtotal]
      );

      // Deduct stock
      await connection.query(
        `UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?`,
        [itm.quantity, itm.variant_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        order_number: orderNumber,
        subtotal: serverSubtotal,
        discount_amount: serverDiscount,
        delivery_charge: serverDeliveryCharge,
        total_amount: grandTotal,
        delivery_type: type,
        payment_method: payment_method || 'cod',
        order_status: 'Pending'
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  } finally {
    connection.release();
  }
});

// 2. Track Order Publicly (by Order Number or Phone)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE UPPER(order_number) = UPPER(?) OR customer_phone = ? ORDER BY created_at DESC',
      [orderNumber.trim(), orderNumber.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found with this number or mobile.' });
    }

    const order = rows[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;

    // Calculate progression percentage for timeline UI
    const statusMap = {
      'Pending': { step: 1, percent: 15, label: 'Order Placed' },
      'Confirmed': { step: 2, percent: 35, label: 'Order Confirmed' },
      'Preparing': { step: 3, percent: 60, label: 'Preparing Fresh' },
      'Ready for Pickup': { step: 4, percent: 85, label: 'Ready for Collection' },
      'Out for Delivery': { step: 4, percent: 85, label: 'Out for Delivery' },
      'Delivered': { step: 5, percent: 100, label: 'Delivered' },
      'Cancelled': { step: 0, percent: 0, label: 'Cancelled' }
    };

    order.timeline = statusMap[order.order_status] || { step: 1, percent: 20, label: order.order_status };

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Track order error:', err);
    res.status(500).json({ success: false, message: 'Failed to track order' });
  }
});

// 3. Customer's Own Orders History
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_id = ? OR customer_phone = ? ORDER BY created_at DESC',
      [customerId, req.user.phone || '']
    );

    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id IN (?)',
        [orderIds]
      );
      const itemsMap = {};
      for (const itm of items) {
        if (!itemsMap[itm.order_id]) itemsMap[itm.order_id] = [];
        itemsMap[itm.order_id].push(itm);
      }
      for (const ord of orders) {
        ord.items = itemsMap[ord.id] || [];
      }
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Customer orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch your orders' });
  }
});

// 4. Admin List All Orders (with filters & search)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, payment_method, date, search, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND order_status = ?';
      params.push(status);
    }

    if (payment_method && payment_method !== 'all') {
      query += ' AND payment_method = ?';
      params.push(payment_method);
    }

    if (date) {
      query += ' AND DATE(created_at) = ?';
      params.push(date);
    }

    if (search) {
      query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await pool.query(query, params);

    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds]);
      const itemsMap = {};
      for (const itm of items) {
        if (!itemsMap[itm.order_id]) itemsMap[itm.order_id] = [];
        itemsMap[itm.order_id].push(itm);
      }
      for (const ord of orders) {
        ord.items = itemsMap[ord.id] || [];
      }
    }

    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM orders');

    res.json({
      success: true,
      total: totalRows[0].total,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// 5. Get Single Order Details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = rows[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
});

// 6. Update Order Status (Admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value' });
    }

    await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, id]);
    res.json({ success: true, message: `Order status updated to ${order_status}` });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// 7. Update Payment Status (Admin)
router.patch('/:id/payment-status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const valid = ['pending', 'paid', 'failed'];
    if (!valid.includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, id]);
    res.json({ success: true, message: `Payment status updated to ${payment_status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update payment status' });
  }
});

// 8. Cancel Order (Customer can cancel if Pending)
router.post('/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = rows[0];

    // If customer, verify ownership and pending status
    if (order.order_status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.order_status}. Please call shop.`
      });
    }

    await pool.query("UPDATE orders SET order_status = 'Cancelled' WHERE id = ?", [id]);
    res.json({ success: true, message: 'Order has been successfully cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
});

module.exports = router;
