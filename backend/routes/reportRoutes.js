const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// 1. Dashboard KPI summary
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Total orders and sales
    const [totalStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_sales
      FROM orders
      WHERE order_status != 'Cancelled'
    `);

    // Today's orders and sales
    const [todayStats] = await pool.query(`
      SELECT 
        COUNT(*) as today_orders,
        COALESCE(SUM(total_amount), 0) as today_sales
      FROM orders
      WHERE DATE(created_at) = ? AND order_status != 'Cancelled'
    `, [today]);

    // Status counts
    const [statusStats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN order_status = 'Preparing' THEN 1 ELSE 0 END) as preparing_orders,
        SUM(CASE WHEN order_status = 'Ready for Pickup' THEN 1 ELSE 0 END) as ready_orders,
        SUM(CASE WHEN order_status = 'Out for Delivery' THEN 1 ELSE 0 END) as out_for_delivery,
        SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders
      FROM orders
    `);

    // Low stock products / variants (threshold: <= 15 items)
    const [lowStock] = await pool.query(`
      SELECT 
        v.id as variant_id,
        v.weight_label,
        v.price,
        v.stock_quantity,
        p.id as product_id,
        p.name as product_name,
        p.image as product_image
      FROM product_variants v
      JOIN products p ON v.product_id = p.id
      WHERE v.stock_quantity <= 15
      ORDER BY v.stock_quantity ASC
      LIMIT 10
    `);

    // Top 5 Best-Selling Products
    const [bestSellers] = await pool.query(`
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status != 'Cancelled'
      GROUP BY oi.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Recent Orders for Live Queue
    const [recentOrders] = await pool.query(`
      SELECT id, order_number, customer_name, customer_phone, delivery_type, total_amount, payment_method, payment_status, order_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      kpis: {
        total_orders: totalStats[0].total_orders || 0,
        total_sales: parseFloat(totalStats[0].total_sales || 0),
        today_orders: todayStats[0].today_orders || 0,
        today_sales: parseFloat(todayStats[0].today_sales || 0),
        pending_orders: statusStats[0].pending_orders || 0,
        preparing_orders: statusStats[0].preparing_orders || 0,
        ready_orders: statusStats[0].ready_orders || 0,
        out_for_delivery: statusStats[0].out_for_delivery || 0,
        completed_orders: statusStats[0].completed_orders || 0,
        cancelled_orders: statusStats[0].cancelled_orders || 0
      },
      low_stock: lowStock,
      best_sellers: bestSellers,
      recent_orders: recentOrders
    });
  } catch (err) {
    console.error('Dashboard report error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics' });
  }
});

// 2. Sales Report with Date Filtering
router.get('/sales', requireAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        DATE(created_at) as order_date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(delivery_charge), 0) as total_delivery_charges,
        COALESCE(SUM(discount_amount), 0) as total_discounts
      FROM orders
      WHERE order_status != 'Cancelled'
    `;
    const params = [];

    if (start_date) {
      query += ' AND DATE(created_at) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND DATE(created_at) <= ?';
      params.push(end_date);
    }

    query += ' GROUP BY DATE(created_at) ORDER BY order_date DESC LIMIT 30';

    const [dailySales] = await pool.query(query, params);

    res.json({ success: true, data: dailySales });
  } catch (err) {
    console.error('Sales report error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sales report' });
  }
});

module.exports = router;
