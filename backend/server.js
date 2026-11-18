const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection, initializeDatabase } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const shopRoutes = require('./routes/shopRoutes');
const customerRoutes = require('./routes/customerRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/public/assets')));

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-settings', deliveryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/shop-settings', shopRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);

// Root Route (Welcome / Status)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Hari Om Pendawala Backend REST API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      products: '/api/products',
      shopSettings: '/api/shop-settings',
      adminLogin: '/api/auth/admin/login'
    }
  });
});

// Health Check
app.get('/api/health', async (req, res) => {
  const dbTest = await testConnection();
  res.json({
    status: 'online',
    database: {
      connected: dbTest.success,
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      name: process.env.DB_NAME || 'hari_om_pendawala',
      ...(dbTest.error ? { error: dbTest.error } : {})
    },
    store: 'Hari Om Pendawala Sweet & Namkeen – Amreliwala',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start Server
async function startServer() {
  await testConnection();
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Hari Om Pendawala REST API running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

module.exports = app;
