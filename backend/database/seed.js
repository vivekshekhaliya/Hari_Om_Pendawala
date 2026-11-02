const bcrypt = require('bcryptjs');
const { pool, testConnection, initializeDatabase } = require('../config/db');

async function seedData() {
  console.log('🌱 Starting database seeding for Hari Om Pendawala...');
  await testConnection();
  await initializeDatabase();

  const connection = await pool.getConnection();
  try {
    // 1. Seed Admin User
    const [adminExists] = await connection.query('SELECT id FROM admin_users WHERE email = ?', ['admin@hariompendawala.com']);
    if (adminExists.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await connection.query(
        'INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Hari Om Admin', 'admin@hariompendawala.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created: admin@hariompendawala.com / admin123');
    }

    // 2. Seed Delivery Settings
    const [delSettings] = await connection.query('SELECT id FROM delivery_settings WHERE id = 1');
    const defaultSlots = JSON.stringify([
      "09:00 AM - 12:00 PM",
      "12:00 PM - 03:00 PM",
      "03:00 PM - 06:00 PM",
      "06:00 PM - 09:30 PM"
    ]);
    if (delSettings.length === 0) {
      await connection.query(
        `INSERT INTO delivery_settings (id, is_delivery_enabled, is_pickup_enabled, fixed_delivery_charge, per_km_charge, free_delivery_threshold, min_order_amount, max_delivery_distance_km, delivery_slots_json)
         VALUES (1, 1, 1, 40.00, 8.00, 500.00, 100.00, 25.00, ?)`,
        [defaultSlots]
      );
      console.log('✅ Default delivery settings configured.');
    }

    // 3. Seed Serviceable Pincodes
    const pincodes = [
      { pincode: '380057', area_name: 'South Bopal & Sun South Park (Near Shop)', override: 20.00 },
      { pincode: '380058', area_name: 'Bopal & Ambli Road', override: 30.00 },
      { pincode: '380054', area_name: 'Thaltej, Bodakdev & SG Highway', override: 40.00 },
      { pincode: '380059', area_name: 'Gota & New SG Road', override: 50.00 },
      { pincode: '380015', area_name: 'Satellite & Shivranjani', override: 45.00 },
      { pincode: '380051', area_name: 'Prahlad Nagar & Anandnagar', override: 40.00 },
      { pincode: '380052', area_name: 'Memnagar & Drive In Road', override: 50.00 },
      { pincode: '382110', area_name: 'Sanand Area', override: 70.00 }
    ];

    for (const p of pincodes) {
      await connection.query(
        `INSERT INTO serviceable_areas (pincode, area_name, delivery_charge_override, is_active)
         VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE area_name = VALUES(area_name), delivery_charge_override = VALUES(delivery_charge_override)`,
        [p.pincode, p.area_name, p.override]
      );
    }
    console.log('✅ Serviceable pincodes seeded.');

    // 4. Seed Shop Settings
    const [shopExists] = await connection.query('SELECT id FROM shop_settings WHERE id = 1');
    if (shopExists.length === 0) {
      await connection.query(
        `INSERT INTO shop_settings (id, shop_name, tagline, logo_url, phone, alternate_phone, email, address, city, state, pincode, google_maps_url, opening_hours, gst_number, gst_percentage, announcement_text, is_store_open)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          'Hari Om Pendawala Sweet & Namkeen – Amreliwala',
          'Authentic Taste of Saurashtra & Pure Desi Ghee Amreli Sweets',
          '/assets/logo.jpg',
          '+91 97122 47979',
          null,
          'hariompendawala.bopal@gmail.com',
          'Shop Number 8, Floor 2, Sun South Park, near SOBO Center Road, South Bopal, Bopal, Ahmedabad, Gujarat 380057',
          'Ahmedabad',
          'Gujarat',
          '380057',
          'https://www.google.com/maps/place/Hari+om+pendawala+sweet+%26+namkeen+-+Amreliwala/@23.0161268,72.4711575,17z',
          'Monday - Sunday: 8:00 AM – 10:30 PM',
          '24AAACH9876M1Z8',
          5.00,
          'Festive Special: Pure Ghee Thabdi Penda & Kaju Katli ready fresh daily! Enjoy FREE delivery on orders above ₹500 across Ahmedabad!'
        ]
      );
      console.log('✅ Shop settings seeded.');
    }

    // 5. Seed Coupons
    const coupons = [
      { code: 'HARIOM50', description: 'Flat ₹50 OFF on orders above ₹400', discount_type: 'flat', discount_value: 50.00, min_order_amount: 400.00, max_discount: 50.00 },
      { code: 'FESTIVE15', description: '15% OFF up to ₹150 on festive sweet orders', discount_type: 'percentage', discount_value: 15.00, min_order_amount: 600.00, max_discount: 150.00 },
      { code: 'FIRSTORDER', description: '10% OFF on your very first order', discount_type: 'percentage', discount_value: 10.00, min_order_amount: 300.00, max_discount: 100.00 }
    ];

    for (const c of coupons) {
      await connection.query(
        `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE description = VALUES(description), discount_value = VALUES(discount_value)`,
        [c.code, c.description, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount]
      );
    }
    console.log('✅ Discount coupons seeded.');

    // 6. Seed Categories
    const categories = [
      { name: 'Gujarati Sweets', slug: 'gujarati-sweets', description: 'Iconic traditional Gujarati sweets prepared in pure desi ghee from Amreli heritage recipes.', image: '/assets/thabdi-penda.jpg', display_order: 1 },
      { name: 'Bengali Sweets', slug: 'bengali-sweets', description: 'Fresh, melt-in-the-mouth cottage cheese sweets soaked in light aromatic cardamom syrup.', image: '/assets/kaju-katli.jpg', display_order: 2 },
      { name: 'Namkeen & Farsan', slug: 'namkeen-farsan', description: 'Crunchy, spiced, authentic Kathiyawadi & Bhavnagari farsan snacks made with pure groundnut oil.', image: '/assets/bhavnagari-gathiya.jpg', display_order: 3 },
      { name: 'Dry Fruit Sweets', slug: 'dry-fruit-sweets', description: 'Rich, premium Cashew, Almond, and Pistachio mithai crafted for royalty.', image: '/assets/kaju-katli.jpg', display_order: 4 },
      { name: 'Gift Boxes & Combos', slug: 'gift-boxes', description: 'Exquisite festive gift hampers and assorted sweet-namkeen gift packs for festivals and celebrations.', image: '/assets/gift-box.jpg', display_order: 5 },
      { name: 'Bakery & Snacks', slug: 'bakery-snacks', description: 'Crisp khakhra, butter toast, cookies, and traditional tea-time refreshments.', image: '/assets/bhavnagari-gathiya.jpg', display_order: 6 },
      { name: 'Seasonal & Fasting (Farali)', slug: 'seasonal-farali', description: 'Special Upvas & Vrat friendly sweets made strictly according to religious traditions.', image: '/assets/thabdi-penda.jpg', display_order: 7 }
    ];

    const categoryMap = {};
    for (const cat of categories) {
      const [res] = await connection.query(
        `INSERT INTO categories (name, slug, description, image, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), image = VALUES(image), display_order = VALUES(display_order)`,
        [cat.name, cat.slug, cat.description, cat.image, cat.display_order]
      );
      
      const [catRow] = await connection.query('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
      if (catRow.length > 0) {
        categoryMap[cat.slug] = catRow[0].id;
      }
    }
    console.log('✅ Categories seeded.');

    // 7. Seed Products and Variants
    const products = [
      {
        catSlug: 'gujarati-sweets',
        name: 'Famous Amreli Thabdi Penda',
        slug: 'famous-amreli-thabdi-penda',
        description: 'The crowning glory of Hari Om Pendawala. Authentic Amreli-style slow-roasted caramelized milk fudge, enriched with aromatic cardamom and crunchy pistachios. Made using pure Saurashtra full-cream milk.',
        image: '/assets/thabdi-penda.jpg',
        is_featured: true,
        base_price: 160.00,
        variants: [
          { label: '250 g', grams: 250, price: 160.00, stock: 65 },
          { label: '500 g', grams: 500, price: 310.00, stock: 80 },
          { label: '1 kg', grams: 1000, price: 600.00, stock: 45 }
        ]
      },
      {
        catSlug: 'dry-fruit-sweets',
        name: 'Royal Kesar Kaju Katli',
        slug: 'royal-kesar-kaju-katli',
        description: 'Finest handpicked cashew nuts stone-ground into a silky smooth batter with premium Kashmiri saffron and finished with pure edible silver vark. Melt-in-mouth luxury.',
        image: '/assets/kaju-katli.jpg',
        is_featured: true,
        base_price: 275.00,
        variants: [
          { label: '250 g', grams: 250, price: 275.00, stock: 50 },
          { label: '500 g', grams: 500, price: 540.00, stock: 70 },
          { label: '1 kg', grams: 1000, price: 1050.00, stock: 35 }
        ]
      },
      {
        catSlug: 'gujarati-sweets',
        name: 'Shuddh Ghee Mohanthal',
        slug: 'shuddh-ghee-mohanthal',
        description: 'Traditional Gujarati celebratory sweet made from coarse gram flour slow-roasted in pure aromatic desi cow ghee, sweetened with saffron syrup and topped with slivered almonds.',
        image: '/assets/hero-banner.jpg',
        is_featured: true,
        base_price: 180.00,
        variants: [
          { label: '250 g', grams: 250, price: 180.00, stock: 40 },
          { label: '500 g', grams: 500, price: 350.00, stock: 55 },
          { label: '1 kg', grams: 1000, price: 680.00, stock: 30 }
        ]
      },
      {
        catSlug: 'namkeen-farsan',
        name: 'Crispy Bhavnagari Gathiya',
        slug: 'crispy-bhavnagari-gathiya',
        description: 'Authentic Saurashtra Bhavnagari Gathiya made with pure besan and black peppercorns. Incredibly soft yet crunchy texture, best enjoyed with raw papaya sambharo and fried green chilies.',
        image: '/assets/bhavnagari-gathiya.jpg',
        is_featured: true,
        base_price: 90.00,
        variants: [
          { label: '250 g', grams: 250, price: 90.00, stock: 100 },
          { label: '500 g', grams: 500, price: 175.00, stock: 120 },
          { label: '1 kg', grams: 1000, price: 340.00, stock: 60 }
        ]
      },
      {
        catSlug: 'namkeen-farsan',
        name: 'Spicy Lasaniya Sev & Papdi',
        slug: 'spicy-lasaniya-sev-papdi',
        description: 'Crunchy garlic-infused sev with crushed chili flakes and traditional carom seeds. An irresistible evening tea companion and topping for poha & chaat.',
        image: '/assets/bhavnagari-gathiya.jpg',
        is_featured: false,
        base_price: 95.00,
        variants: [
          { label: '250 g', grams: 250, price: 95.00, stock: 80 },
          { label: '500 g', grams: 500, price: 180.00, stock: 90 },
          { label: '1 kg', grams: 1000, price: 350.00, stock: 40 }
        ]
      },
      {
        catSlug: 'gift-boxes',
        name: 'Royal Hari Om Celebration Hamper',
        slug: 'royal-hari-om-celebration-hamper',
        description: 'Exclusive luxury festive gift box featuring 4 premium sections: Amreli Thabdi Penda, Kesar Kaju Katli, Motichoor Laddu, and Anjeer Dryfruit Roll. Packed in a lavish royal purple & gold ribbon box.',
        image: '/assets/gift-box.jpg',
        is_featured: true,
        base_price: 850.00,
        variants: [
          { label: '1 kg Luxury Box', grams: 1000, price: 850.00, stock: 45 },
          { label: '2 kg Grand Box', grams: 2000, price: 1650.00, stock: 20 }
        ]
      },
      {
        catSlug: 'bengali-sweets',
        name: 'Special Kesar Spongy Rasgulla',
        slug: 'special-kesar-spongy-rasgulla',
        description: 'Pristine fresh chhena dumplings hand-rolled and cooked in light aromatic saffron sugar syrup. Soft, juicy, and 100% pure vegetarian.',
        image: '/assets/thabdi-penda.jpg',
        is_featured: false,
        base_price: 160.00,
        variants: [
          { label: '500 g (Approx 8 pcs)', grams: 500, price: 160.00, stock: 35 },
          { label: '1 kg (Approx 16 pcs)', grams: 1000, price: 310.00, stock: 25 }
        ]
      },
      {
        catSlug: 'seasonal-farali',
        name: 'Amreli Special Farali Penda',
        slug: 'amreli-special-farali-penda',
        description: 'Prepared specially for Ekadashi, Navratri, and Mahashivratri fasting. Made strictly using concentrated pure milk and rock sugar (Khadi Sakar), without any cereal flours.',
        image: '/assets/thabdi-penda.jpg',
        is_featured: true,
        base_price: 170.00,
        variants: [
          { label: '250 g', grams: 250, price: 170.00, stock: 50 },
          { label: '500 g', grams: 500, price: 330.00, stock: 60 },
          { label: '1 kg', grams: 1000, price: 640.00, stock: 30 }
        ]
      }
    ];

    for (const prod of products) {
      const categoryId = categoryMap[prod.catSlug] || 1;
      await connection.query(
        `INSERT INTO products (category_id, name, slug, description, image, is_featured, is_veg, is_active, base_price)
         VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), image = VALUES(image), base_price = VALUES(base_price)`,
        [categoryId, prod.name, prod.slug, prod.description, prod.image, prod.is_featured, prod.base_price]
      );

      const [pRow] = await connection.query('SELECT id FROM products WHERE slug = ?', [prod.slug]);
      if (pRow.length > 0) {
        const prodId = pRow[0].id;
        for (const v of prod.variants) {
          const [vExists] = await connection.query(
            'SELECT id FROM product_variants WHERE product_id = ? AND weight_label = ?',
            [prodId, v.label]
          );
          if (vExists.length === 0) {
            await connection.query(
              'INSERT INTO product_variants (product_id, weight_label, weight_grams, price, stock_quantity, is_available) VALUES (?, ?, ?, ?, ?, 1)',
              [prodId, v.label, v.grams, v.price, v.stock]
            );
          } else {
            await connection.query(
              'UPDATE product_variants SET price = ?, stock_quantity = ? WHERE id = ?',
              [v.price, v.stock, vExists[0].id]
            );
          }
        }
      }
    }
    console.log('✅ Products and variants seeded.');

    // 8. Seed sample orders so the admin dashboard has live realistic data immediately!
    const [ordersCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
    if (ordersCount[0].count === 0) {
      const sampleOrders = [
        {
          order_number: 'HOP-2026-1001',
          name: 'Rajeshbhai Patel',
          phone: '9898012345',
          email: 'rajesh.patel@gmail.com',
          type: 'delivery',
          slot: '09:00 AM - 12:00 PM',
          address: 'B-402, Gala Aria, South Bopal',
          city: 'Ahmedabad',
          pincode: '380057',
          subtotal: 620.00,
          discount: 50.00,
          coupon: 'HARIOM50',
          delivery: 0.00,
          total: 570.00,
          payment_method: 'cod',
          payment_status: 'pending',
          order_status: 'Preparing',
          notes: 'Please pack in festive gift box with ribbon.'
        },
        {
          order_number: 'HOP-2026-1002',
          name: 'Priyaben Shah',
          phone: '9876543210',
          email: 'priyashah@outlook.com',
          type: 'pickup',
          slot: '03:00 PM - 06:00 PM',
          address: 'Store Pickup',
          city: 'Ahmedabad',
          pincode: '380057',
          subtotal: 850.00,
          discount: 100.00,
          coupon: 'FIRSTORDER',
          delivery: 0.00,
          total: 750.00,
          payment_method: 'online',
          payment_status: 'paid',
          order_status: 'Ready for Pickup',
          notes: 'Customer will collect by 5:30 PM.'
        },
        {
          order_number: 'HOP-2026-1003',
          name: 'Dharmesh Joshi',
          phone: '9428011223',
          email: 'dharmesh.j@gmail.com',
          type: 'delivery',
          slot: '06:00 PM - 09:30 PM',
          address: 'A-12, Sun South Park, South Bopal',
          city: 'Ahmedabad',
          pincode: '380057',
          subtotal: 350.00,
          discount: 0.00,
          coupon: null,
          delivery: 20.00,
          total: 370.00,
          payment_method: 'cod',
          payment_status: 'pending',
          order_status: 'Pending',
          notes: 'Call before delivery.'
        }
      ];

      for (const ord of sampleOrders) {
        const [ordRes] = await connection.query(
          `INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, delivery_type, delivery_slot, address_line, city, pincode, subtotal, discount_amount, coupon_code, delivery_charge, total_amount, payment_method, payment_status, order_status, order_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ord.order_number, ord.name, ord.phone, ord.email, ord.type, ord.slot,
            ord.address, ord.city, ord.pincode, ord.subtotal, ord.discount, ord.coupon,
            ord.delivery, ord.total, ord.payment_method, ord.payment_status, ord.order_status, ord.notes
          ]
        );
        const orderId = ordRes.insertId;

        // Add order items
        await connection.query(
          `INSERT INTO order_items (order_id, product_name, variant_label, unit_price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, 'Famous Amreli Thabdi Penda', '500 g', 310.00, 1, 310.00]
        );
        await connection.query(
          `INSERT INTO order_items (order_id, product_name, variant_label, unit_price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, 'Crispy Bhavnagari Gathiya', '500 g', 175.00, 1, 175.00]
        );
      }
      console.log('✅ Sample orders seeded for dashboard display.');
    }

    console.log('🎉 Seeding successfully completed!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedData();
