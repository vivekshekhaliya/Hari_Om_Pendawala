const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 1. Get all categories
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    let query = `
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
    `;

    if (all !== 'true') {
      query += ' WHERE c.is_active = 1';
    }

    query += ' GROUP BY c.id ORDER BY c.display_order ASC, c.name ASC';

    const [categories] = await pool.query(query);
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// 2. Create category (Admin)
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, slug, description, display_order, is_active } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || '/assets/thabdi-penda.jpg';

    const [result] = await pool.query(
      `INSERT INTO categories (name, slug, description, image, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, categorySlug, description || '', imageUrl, display_order || 0, is_active !== 'false' && is_active !== false ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      categoryId: result.insertId
    });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// 3. Update category (Admin)
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, display_order, is_active, existingImage } = req.body;

    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingImage || existing[0].image;

    await pool.query(
      `UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [
        name || existing[0].name,
        slug || existing[0].slug,
        description !== undefined ? description : existing[0].description,
        imageUrl,
        display_order !== undefined ? display_order : existing[0].display_order,
        is_active !== undefined ? (is_active ? 1 : 0) : existing[0].is_active,
        id
      ]
    );

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

// 4. Delete category (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true' || req.query.cascade === 'true';

    // Verify category exists
    const [cat] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (cat.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const [products] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    const productCount = products[0]?.count || 0;

    if (productCount > 0 && !force) {
      return res.status(400).json({
        success: false,
        hasProducts: true,
        count: productCount,
        message: `Cannot delete "${cat[0].name}": it contains ${productCount} product(s). Please delete or reassign them first, or enable force deletion.`
      });
    }

    if (productCount > 0 && force) {
      const [prods] = await pool.query('SELECT id FROM products WHERE category_id = ?', [id]);
      const prodIds = prods.map(p => p.id);
      if (prodIds.length > 0) {
        await pool.query('UPDATE order_items SET product_id = NULL WHERE product_id IN (?)', [prodIds]);
        await pool.query('DELETE FROM product_variants WHERE product_id IN (?)', [prodIds]);
        await pool.query('DELETE FROM products WHERE category_id = ?', [id]);
      }
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: `Category "${cat[0].name}" deleted successfully` });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category: ' + err.message });
  }
});

module.exports = router;
