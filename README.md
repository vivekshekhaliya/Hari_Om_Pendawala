# Hari Om Pendawala Sweet & Namkeen – Amreliwala

An authentic, modern, responsive full-stack online sweet shop and ordering platform with an integrated Administrator Control Dashboard.

---

## Brand Identity & Aesthetic
- **Colors:** Royal Sweet Purple (`#581c87`), Emerald Fresh Green (`#16a34a`), and Golden Penda Amber (`#d97706` / `#f59e0b`) on clean white backgrounds.
- **Specialties:** Famous Amreli Thabdi Penda, Shuddh Ghee Mohanthal, Kesar Kaju Katli, Crispy Bhavnagari Gathiya, and Royal Saurashtra Festival Hampers.
- **Physical Store:** Shop Number 8, Sun South Park, Near SOBO Center Road, South Bopal, Ahmedabad, Gujarat — 380057.
- **Contact:** +91 97122 47979

---

## Technology Stack

- **User Website:** React 18, React Router v6, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Admin Panel:** React 18, Tailwind CSS, Role-based route guards
- **Backend:** Node.js, Express.js REST API, Multer, JWT, BcryptJS
- **Database:** MySQL (Relational tables with foreign keys and snapshots)

---

## Architecture Overview

```
Hari_Om_Pendawala/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool & auto migration
│   ├── database/
│   │   ├── schema.sql            # Complete 12-table relational MySQL schema
│   │   └── seed.js               # Initial seeding for categories, products, admin, pincodes
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication & admin role guard
│   │   └── upload.js             # Multer image upload handler
│   ├── routes/
│   │   ├── authRoutes.js         # Admin & Customer auth (/api/auth)
│   │   ├── productRoutes.js      # Products & variants CRUD (/api/products)
│   │   ├── categoryRoutes.js     # Categories CRUD (/api/categories)
│   │   ├── orderRoutes.js        # Checkout, tracking, admin orders (/api/orders)
│   │   ├── deliveryRoutes.js     # Configurable delivery & pincodes (/api/delivery-settings)
│   │   ├── couponRoutes.js       # Coupon verification & admin CRUD (/api/coupons)
│   │   ├── shopRoutes.js         # Store branding, maps, contact (/api/shop-settings)
│   │   ├── customerRoutes.js     # Customer profiles & addresses (/api/customers)
│   │   └── reportRoutes.js       # Sales & analytics (/api/reports)
│   ├── uploads/                  # Uploaded product and category images
│   ├── .env                      # Active environment configuration
│   ├── .env.example              # Template configuration
│   └── server.js                 # Express server on port 5001
│
├── frontend/
│   ├── public/
│   │   └── assets/               # Brand logo, sweets photography, banners
│   ├── src/
│   │   ├── admin/                # Admin Panel pages & components
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── AdminCategories.jsx
│   │   │   ├── AdminDeliverySettings.jsx
│   │   │   ├── AdminCoupons.jsx
│   │   │   ├── AdminShopSettings.jsx
│   │   │   ├── AdminCustomers.jsx
│   │   │   └── AdminReports.jsx
│   │   ├── components/           # Common & Product components
│   │   │   ├── common/Navbar.jsx
│   │   │   ├── common/Footer.jsx
│   │   │   ├── common/CartDrawer.jsx
│   │   │   ├── common/VegBadge.jsx
│   │   │   └── products/ProductCard.jsx
│   │   │   └── products/ProductDetailModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ShopContext.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── MenuPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   ├── TrackOrderPage.jsx
│   │   │   ├── CustomerAuthPage.jsx
│   │   │   ├── CustomerAccountPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   └── ContactPage.jsx
│   │   ├── services/api.js       # Axios REST API client
│   │   ├── App.jsx               # Routes definition
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── package.json                  # Root runner
```

---

## Key Features

### 1. Customer Storefront
- **Dynamic Product Menu:** Categorized sweets, namkeen, farali vrat specials, and gift hampers.
- **Weight Variants Selection:** Seamless 250 g, 500 g, and 1 kg pack selection with live price and stock updates.
- **100% Vegetarian Mark:** Auspicious Indian green dot emblem on all items.
- **Slide-Over Cart Drawer:** Free delivery threshold progress meter (e.g., "Add ₹190 more for FREE Delivery!").
- **Smart Delivery Calculation:** Connects to backend delivery engine to validate customer pincodes, distances, or store pickup.
- **Discount Coupons:** Instant coupon verification (e.g. `HARIOM50`, `FESTIVE15`).
- **Interactive Checkout:** Supports Home Delivery and Store Pickup, time slot selection, Cash on Delivery, and Online payment.
- **Order Confirmation & Tracking:** Generates unique order number (e.g. `HOP-261028-7086`), printable bill receipt, and live progress timeline.

### 2. Shop Owner / Administrator Panel (`/admin`)
- **Default Credentials:**
  - **Email:** `admin@hariompendawala.com`
  - **Password:** `admin123`
- **Dashboard KPIs:** Real-time Today's Sales, Orders Count, Action-needed alerts, Best-Sellers, and Low-Stock warnings.
- **Live Order Management:** Real-time or auto-refreshing order list (every 5s, 15s, or 30s), order status updater (Pending -> Confirmed -> Preparing -> Out for Delivery -> Delivered), customer receipt modal, and thermal printer-ready invoices.
- **Product & Variant Pricing:** Add/edit products, manage multiple weight variants with separate prices and stock quantities, upload photos, toggle visibility or featured badges.
- **100% Configurable Delivery Settings:**
  - Set fixed delivery charges and per-km distance charges.
  - Set free delivery thresholds and minimum order amounts.
  - Set maximum delivery distances.
  - Manage serviceable pincodes with custom fee overrides per locality.
  - Enable or disable delivery and store pickup independently.
- **Coupons & Discount Manager:** Create flat or percentage discount codes, set minimum order values and expiry dates.
- **Store Branding & Settings:** Update store name, logo, phone, address, Google Maps link, operating hours, announcement bar, GST number & tax percentage.
- **Sales & Financial Reports:** Filter sales by date range, export daily breakdowns, and analyze order volume.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server (running on port 3306)

### 1. Database Setup
```bash
# Create database in MySQL
mysql -u root -e "CREATE DATABASE IF NOT EXISTS hari_om_pendawala CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Seed tables, admin user, products, variants, delivery rules, and coupons
cd backend
node database/seed.js
```

### 2. Run the Backend API
```bash
cd backend
npm install
npm start
# Server listens on http://localhost:5001
```

### 3. Run the Frontend & Admin Web Application
```bash
cd frontend
npm install
npm run dev
# Vite runs on http://localhost:5173 (or next available port)
```

### 4. Admin Access
1. Open `http://localhost:5173/admin/login` (or port shown by Vite).
2. Click **Sign In as Administrator** (prefilled with `admin@hariompendawala.com` / `admin123`).
3. Manage products, update delivery fees, view live incoming orders, and print invoices.
