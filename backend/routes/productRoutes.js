const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 1. Get all products with variants & category info
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, all, veg } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (all !== 'true') {
      query += ' AND p.is_active = 1 AND c.is_active = 1';
    }

    if (category) {
      query += ' AND (c.slug = ? OR c.id = ?)';
      params.push(category, category);
    }

    if (featured === 'true') {
      query += ' AND p.is_featured = 1';
    }

    if (veg !== undefined && veg !== '') {
      query += ' AND p.is_veg = ?';
      params.push(veg === 'true' || veg === '1' ? 1 : 0);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.is_featured DESC, p.created_at DESC';

    const [products] = await pool.query(query, params);

    // Fetch variants for all products in one query
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      const [variants] = await pool.query(
        'SELECT * FROM product_variants WHERE product_id IN (?) ORDER BY weight_grams ASC',
        [productIds]
      );

      const variantMap = {};
      for (const v of variants) {
        if (!variantMap[v.product_id]) {
          variantMap[v.product_id] = [];
        }
        variantMap[v.product_id].push(v);
      }

      for (const p of products) {
        p.variants = variantMap[p.id] || [];
        // Calculate minimum price from variants
        if (p.variants.length > 0) {
          const prices = p.variants.map(v => Number(v.price));
          p.min_price = Math.min(...prices);
          p.in_stock = p.variants.some(v => v.stock_quantity > 0 && v.is_available);
        } else {
          p.min_price = Number(p.base_price);
          p.in_stock = true;
        }
      }
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// 2. Get single product by id or slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'}
    `;

    const [rows] = await pool.query(query, [idOrSlug]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = rows[0];
    const [variants] = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY weight_grams ASC',
      [product.id]
    );

    product.variants = variants;
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Get product details error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
});

// 3. Create product (Admin)
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      category_id,
      name,
      slug,
      description,
      is_featured,
      is_veg,
      is_active,
      base_price,
      variants // JSON string or array
    } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || '/assets/thabdi-penda.jpg';

    const [prodResult] = await connection.query(
      `INSERT INTO products (category_id, name, slug, description, image, is_featured, is_veg, is_active, base_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        productSlug,
        description || '',
        imageUrl,
        is_featured === 'true' || is_featured === true || is_featured === 1 ? 1 : 0,
        is_veg === 'false' || is_veg === false || is_veg === 0 ? 0 : 1,
        is_active === 'false' || is_active === false || is_active === 0 ? 0 : 1,
        base_price || 0.00
      ]
    );

    const productId = prodResult.insertId;

    // Handle variants
    let parsedVariants = [];
    if (typeof variants === 'string') {
      try {
        parsedVariants = JSON.parse(variants);
      } catch (e) {
        parsedVariants = [];
      }
    } else if (Array.isArray(variants)) {
      parsedVariants = variants;
    }

    if (parsedVariants.length === 0) {
      // Default variants: 250g, 500g, 1kg
      const price = parseFloat(base_price) || 150;
      parsedVariants = [
        { label: '250 g', grams: 250, price: Math.round(price * 0.55), stock: 50 },
        { label: '500 g', grams: 500, price: price, stock: 50 },
        { label: '1 kg', grams: 1000, price: Math.round(price * 1.9), stock: 30 }
      ];
    }

    for (const v of parsedVariants) {
      await connection.query(
        `INSERT INTO product_variants (product_id, weight_label, weight_grams, price, stock_quantity, is_available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          productId,
          v.label || v.weight_label,
          v.grams || v.weight_grams || 500,
          v.price,
          v.stock !== undefined ? v.stock : (v.stock_quantity !== undefined ? v.stock_quantity : 50),
          v.is_available !== false ? 1 : 0
        ]
      );
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  } finally {
    connection.release();
  }
});

// 4. Update product (Admin)
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    const [existing] = await connection.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      category_id,
      name,
      slug,
      description,
      is_featured,
      is_veg,
      is_active,
      base_price,
      variants,
      existingImage
    } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingImage || existing[0].image;

    await connection.query(
      `UPDATE products SET 
        category_id = ?, 
        name = ?, 
        slug = ?, 
        description = ?, 
        image = ?, 
        is_featured = ?, 
        is_veg = ?, 
        is_active = ?, 
        base_price = ?
       WHERE id = ?`,
      [
        category_id || existing[0].category_id,
        name || existing[0].name,
        slug || existing[0].slug,
        description !== undefined ? description : existing[0].description,
        imageUrl,
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing[0].is_featured,
        is_veg !== undefined ? (is_veg ? 1 : 0) : existing[0].is_veg,
        is_active !== undefined ? (is_active ? 1 : 0) : existing[0].is_active,
        base_price !== undefined ? base_price : existing[0].base_price,
        id
      ]
    );

    // If variants were sent, update them
    if (variants) {
      let parsedVariants = [];
      if (typeof variants === 'string') {
        try {
          parsedVariants = JSON.parse(variants);
        } catch (e) {
          parsedVariants = [];
        }
      } else if (Array.isArray(variants)) {
        parsedVariants = variants;
      }

      if (parsedVariants.length > 0) {
        // Delete old variants and insert updated
        await connection.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
        for (const v of parsedVariants) {
          await connection.query(
            `INSERT INTO product_variants (product_id, weight_label, weight_grams, price, stock_quantity, is_available)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              id,
              v.label || v.weight_label,
              v.grams || v.weight_grams || 500,
              v.price,
              v.stock !== undefined ? v.stock : (v.stock_quantity !== undefined ? v.stock_quantity : 50),
              v.is_available !== false ? 1 : 0
            ]
          );
        }
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  } finally {
    connection.release();
  }
});

// 5. Quick Toggle Active Status (Admin)
router.patch('/:id/toggle-status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET is_active = NOT is_active WHERE id = ?', [id]);
    const [updated] = await pool.query('SELECT is_active FROM products WHERE id = ?', [id]);
    res.json({ success: true, is_active: updated[0].is_active });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle status' });
  }
});

// 6. Quick Toggle Featured Status (Admin)
router.patch('/:id/toggle-featured', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET is_featured = NOT is_featured WHERE id = ?', [id]);
    const [updated] = await pool.query('SELECT is_featured FROM products WHERE id = ?', [id]);
    res.json({ success: true, is_featured: updated[0].is_featured });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle featured' });
  }
});

// 7. Delete product (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify product exists
    const [existing] = await pool.query('SELECT id, name FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Unlink order items and delete variants before removing the product
    await pool.query('UPDATE order_items SET product_id = NULL WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ success: true, message: `Product "${existing[0].name}" deleted successfully` });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete product: ' + err.message });
  }
});

module.exports = router;
