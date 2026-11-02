-- Hari Om Pendawala Sweet & Namkeen – Amreliwala
-- Database Schema for MySQL 8.x / 9.x

CREATE DATABASE IF NOT EXISTS hari_om_pendawala CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hari_om_pendawala;

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Customers
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150) NULL,
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(255) NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(255) NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_veg BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 5. Product Variants (e.g. 250g, 500g, 1kg)
CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  weight_label VARCHAR(50) NOT NULL,
  weight_grams INT NOT NULL DEFAULT 500,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 50,
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  recipient_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line TEXT NOT NULL,
  landmark VARCHAR(150) NULL,
  city VARCHAR(100) DEFAULT 'Ahmedabad',
  pincode VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 7. Delivery Settings (Global Admin Controls)
CREATE TABLE IF NOT EXISTS delivery_settings (
  id INT PRIMARY KEY DEFAULT 1,
  is_delivery_enabled BOOLEAN DEFAULT TRUE,
  is_pickup_enabled BOOLEAN DEFAULT TRUE,
  fixed_delivery_charge DECIMAL(10,2) DEFAULT 40.00,
  per_km_charge DECIMAL(10,2) DEFAULT 8.00,
  free_delivery_threshold DECIMAL(10,2) DEFAULT 500.00,
  min_order_amount DECIMAL(10,2) DEFAULT 100.00,
  max_delivery_distance_km DECIMAL(6,2) DEFAULT 25.00,
  delivery_slots_json TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Serviceable Areas & Pincodes
CREATE TABLE IF NOT EXISTS serviceable_areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pincode VARCHAR(10) NOT NULL UNIQUE,
  area_name VARCHAR(100) NOT NULL,
  delivery_charge_override DECIMAL(10,2) NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- 9. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  discount_type ENUM('percentage', 'flat') DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0.00,
  max_discount DECIMAL(10,2) NULL,
  valid_from DATE NULL,
  valid_until DATE NULL,
  usage_limit INT DEFAULT 1000,
  times_used INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Shop Settings (Branding, Coordinates, Contact, GST)
CREATE TABLE IF NOT EXISTS shop_settings (
  id INT PRIMARY KEY DEFAULT 1,
  shop_name VARCHAR(150) NOT NULL DEFAULT 'Hari Om Pendawala Sweet & Namkeen – Amreliwala',
  tagline VARCHAR(255) DEFAULT 'Authentic Taste of Saurashtra & Pure Amreli Sweets',
  logo_url VARCHAR(255) DEFAULT '/assets/logo.jpg',
  phone VARCHAR(25) DEFAULT '+91 97122 47979',
  alternate_phone VARCHAR(25) DEFAULT NULL,
  email VARCHAR(100) DEFAULT 'info@hariompendawala.com',
  address TEXT NOT NULL,
  city VARCHAR(50) DEFAULT 'Ahmedabad',
  state VARCHAR(50) DEFAULT 'Gujarat',
  pincode VARCHAR(10) DEFAULT '380057',
  google_maps_url TEXT,
  opening_hours VARCHAR(100) DEFAULT 'Mon - Sun: 8:00 AM - 10:30 PM',
  gst_number VARCHAR(30) DEFAULT '24AAACH0123M1Z5',
  gst_percentage DECIMAL(5,2) DEFAULT 5.00,
  announcement_text VARCHAR(255) DEFAULT '🎉 Fresh Amreli Thabdi Penda & Special Gathiya available daily! Free delivery on orders above ₹500!',
  is_store_open BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  customer_id INT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(150) NULL,
  delivery_type ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery',
  delivery_slot VARCHAR(100) NULL,
  address_line TEXT NULL,
  city VARCHAR(100) NULL,
  pincode VARCHAR(10) NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  coupon_code VARCHAR(50) NULL,
  delivery_charge DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cod', 'online') NOT NULL DEFAULT 'cod',
  payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  order_status ENUM('Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  order_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 12. Order Items (Snapshot of price & variant)
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(150) NOT NULL,
  variant_label VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
