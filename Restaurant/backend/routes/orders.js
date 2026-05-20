import { Router } from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

async function resolveItems(rawItems, query) {
  const items = Array.isArray(rawItems) ? rawItems : [];
  const productIds = items
    .map(item => Number(item.productId))
    .filter(id => Number.isInteger(id));

  let productMap = new Map();
  if (productIds.length > 0) {
    const { rows: products } = await query(
      'SELECT id, name, price FROM products WHERE id = ANY($1)',
      [productIds]
    );
    productMap = new Map(products.map(p => [p.id, p]));
  }

  const finalItems = [];
  for (const item of items) {
    if (!item) continue;
    const quantity = Math.max(parseInt(item.quantity) || 1, 1);
    const productId = Number(item.productId);
    const product = Number.isInteger(productId) ? productMap.get(productId) : null;

    if (product) {
      finalItems.push({ productId, name: product.name, quantity, price: product.price });
      continue;
    }

    const price = Number(item.price);
    if (!item.name || !Number.isFinite(price)) {
      const err = new Error('Productos inválidos');
      err.statusCode = 400;
      throw err;
    }
    finalItems.push({ productId: null, name: item.name, quantity, price });
  }

  return finalItems;
}

async function getNextDisplayId(query) {
  try {
    const { rows: maxRows } = await query(
      "SELECT COALESCE(MAX(CAST(NULLIF(REGEXP_REPLACE(display_id, '\\D', '', 'g'), '') AS INTEGER)), 4521) as max FROM orders"
    );
    const nextNum = parseInt(maxRows[0].max) + 1;
    return `#${nextNum}`;
  } catch {
    const { rows: maxRows } = await query("SELECT COALESCE(MAX(CAST(SUBSTRING(display_id FROM 2) AS INTEGER)), 4521) as max FROM orders");
    const nextNum = parseInt(maxRows[0].max) + 1;
    return `#${nextNum}`;
  }
}

async function ensureProductIdColumn() {
  try {
    await pool.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id)");
  } catch {}
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    let idx = 1;

    if (status && status !== 'todos') {
      query += ` AND status = $${idx++}`;
      params.push(status);
    }
    if (search) {
      query += ` AND (display_id ILIKE $${idx} OR table_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    query += ' ORDER BY id DESC';

    const { rows: orders } = await pool.query(query, params);
    const enriched = await Promise.all(orders.map(async (o) => {
      const { rows: items } = await pool.query('SELECT name, quantity, price FROM order_items WHERE order_id = $1', [o.id]);
      return {
        id: o.display_id,
        table: o.table_name,
        items: items.map(i => `${i.name} x${i.quantity}`),
        total: o.total,
        status: o.status,
        time: o.time,
        waiter: o.waiter,
        guests: o.guests,
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Error GET /orders:', err);
    const status = err?.statusCode || 500;
    res.status(status).json({ error: 'Error del servidor' });
  }
});

router.put('/:displayId/status', authMiddleware, async (req, res) => {
  try {
    const { displayId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const { rowCount } = await pool.query('UPDATE orders SET status = $1 WHERE display_id = $2', [status, displayId]);
    if (rowCount === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ success: true });
  } catch (err) {
    console.error('Error PUT /orders/status:', err);
    const status = err?.statusCode || 500;
    res.status(status).json({ error: 'Error del servidor' });
  }
});

router.put('/:displayId', authMiddleware, async (req, res) => {
  try {
    const { displayId } = req.params;
    const { table, items, waiter, guests } = req.body;
    const tableName = String(table || '').trim();
    const rawItems = Array.isArray(items) ? items : [];

    if (!tableName || rawItems.length === 0) {
      return res.status(400).json({ error: 'Mesa y productos requeridos' });
    }

    const finalItems = await resolveItems(rawItems, pool.query.bind(pool));
    if (finalItems.length === 0) {
      return res.status(400).json({ error: 'Productos inválidos' });
    }
    const total = finalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const guestsCount = Math.max(parseInt(guests) || 1, 1);
    const waiterName = typeof waiter === 'string' ? waiter : '';

    const { rows } = await pool.query('SELECT id FROM orders WHERE display_id = $1', [displayId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    const orderId = rows[0].id;

    await pool.query(
      'UPDATE orders SET table_name = $1, total = $2, waiter = $3, guests = $4 WHERE id = $5',
      [tableName, total, waiterName, guestsCount, orderId]
    );

    const { rows: existingItems } = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
    const existingQtyByProduct = new Map(existingItems
      .filter(i => i.product_id)
      .map(i => [i.product_id, parseInt(i.quantity) || 0]));

    const newQtyByProduct = new Map();
    for (const item of finalItems) {
      if (item.productId) {
        const prev = newQtyByProduct.get(item.productId) || 0;
        newQtyByProduct.set(item.productId, prev + item.quantity);
      }
    }

    for (const [productId, newQty] of newQtyByProduct.entries()) {
      const oldQty = existingQtyByProduct.get(productId) || 0;
      const diff = newQty - oldQty;
      if (diff !== 0) {
        await pool.query('UPDATE products SET orders_count = orders_count + $1 WHERE id = $2', [diff, productId]);
      }
      existingQtyByProduct.delete(productId);
    }

    for (const [productId, oldQty] of existingQtyByProduct.entries()) {
      await pool.query('UPDATE products SET orders_count = orders_count - $1 WHERE id = $2', [oldQty, productId]);
    }

    await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    await ensureProductIdColumn();
    for (const item of finalItems) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, name, quantity, price) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.productId || null, item.name, item.quantity, item.price]
      );
    }

    res.json({
      id: displayId,
      table: tableName,
      items: finalItems.map(i => `${i.name} x${i.quantity}`),
      total,
      status: 'pendiente',
      waiter: waiterName,
      guests: guestsCount,
    });
  } catch (err) {
    console.error('Error PUT /orders/:displayId:', err);
    const status = err?.statusCode || 500;
    res.status(status).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { table, items, waiter, guests } = req.body;
    const tableName = String(table || '').trim();
    const rawItems = Array.isArray(items) ? items : [];
    if (!tableName || rawItems.length === 0) {
      return res.status(400).json({ error: 'Mesa y productos requeridos' });
    }

    const finalItems = await resolveItems(rawItems, pool.query.bind(pool));
    if (finalItems.length === 0) {
      return res.status(400).json({ error: 'Productos inválidos' });
    }
    const displayId = await getNextDisplayId(pool.query.bind(pool));
    const total = finalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const guestsCount = Math.max(parseInt(guests) || 1, 1);
    const waiterName = typeof waiter === 'string' ? waiter : '';

    const { rows } = await pool.query(
      'INSERT INTO orders (display_id, table_name, total, status, waiter, guests, time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [displayId, tableName, total, 'pendiente', waiterName, guestsCount, timeStr]
    );

    await ensureProductIdColumn();
    for (const item of finalItems) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, name, quantity, price) VALUES ($1, $2, $3, $4, $5)',
        [rows[0].id, item.productId || null, item.name, item.quantity, item.price]
      );
      if (item.productId) {
        await pool.query(
          'UPDATE products SET orders_count = orders_count + $1 WHERE id = $2',
          [item.quantity, item.productId]
        );
      }
    }

    res.status(201).json({
      id: displayId,
      table: tableName,
      items: finalItems.map(i => `${i.name} x${i.quantity}`),
      total,
      status: 'pendiente',
      time: timeStr,
      waiter: waiterName,
      guests: guestsCount,
    });
  } catch (err) {
    console.error('Error POST /orders:', err);
    const status = err?.statusCode || 500;
    res.status(status).json({ error: 'Error del servidor' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { rows: statusCounts } = await pool.query('SELECT status, COUNT(*) as count FROM orders GROUP BY status');
    const { rows: totalRows } = await pool.query('SELECT COUNT(*) as count FROM orders');
    res.json({ total: parseInt(totalRows[0].count), statusCounts });
  } catch (err) {
    const status = err?.statusCode || 500;
    res.status(status).json({ error: err?.message || 'Error del servidor' });
  }
});

export default router;
