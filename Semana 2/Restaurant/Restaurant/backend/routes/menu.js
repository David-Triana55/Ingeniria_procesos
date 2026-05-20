import { Router } from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let idx = 1;

    if (category && category !== 'Todos') {
      query += ` AND category = $${idx++}`;
      params.push(category);
    }
    if (search) {
      query += ` AND name ILIKE $${idx++}`;
      params.push(`%${search}%`);
    }
    query += ' ORDER BY id';

    const { rows } = await pool.query(query, params);
    res.json(rows.map(p => ({
      ...p,
      available: !!p.available,
      orders: p.orders_count,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const newVal = rows[0].available ? 0 : 1;
    await pool.query('UPDATE products SET available = $1 WHERE id = $2', [newVal, id]);
    res.json({ success: true, available: !!newVal });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, description, emoji, prep } = req.body;
    if (!name || !category || price === undefined || price === null || price === '') {
      return res.status(400).json({ error: 'Nombre, categoría y precio requeridos' });
    }

    const { rows } = await pool.query(
      'INSERT INTO products (name, category, price, description, emoji, prep) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, category, Number(price), description || '', emoji || '🍽️', prep || '10 min']
    );

    res.status(201).json({ id: rows[0].id, ...req.body, available: true, orders: 0, rating: 4.5 });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, emoji, prep } = req.body;
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    await pool.query(
      'UPDATE products SET name = $1, category = $2, price = $3, description = $4, emoji = $5, prep = $6 WHERE id = $7',
      [name || rows[0].name, category || rows[0].category, price || rows[0].price,
       description !== undefined ? description : rows[0].description,
       emoji || rows[0].emoji, prep || rows[0].prep, id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(rows.map(c => c.category));
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
