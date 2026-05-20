import { Router } from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { range } = req.query;
    let data;

    switch (range) {
      case '7 días':
        const { rows: r1 } = await pool.query('SELECT * FROM weekly_stats ORDER BY id');
        data = r1.map(r => ({
          label: r.day, revenue: r.sales, orders: r.orders_count, customers: Math.round(r.sales / 65)
        }));
        break;
      case '12 meses':
        data = [
          { label: 'Jun', revenue: 98000, orders: 980, customers: 1450 },
          { label: 'Jul', revenue: 112000, orders: 1100, customers: 1620 },
          { label: 'Ago', revenue: 105000, orders: 1040, customers: 1530 },
          { label: 'Sep', revenue: 118000, orders: 1180, customers: 1740 },
          { label: 'Oct', revenue: 125000, orders: 1250, customers: 1850 },
          { label: 'Nov', revenue: 142000, orders: 1420, customers: 2100 },
          { label: 'Dic', revenue: 189000, orders: 1890, customers: 2780 },
          { label: 'Ene', revenue: 108000, orders: 1080, customers: 1600 },
          { label: 'Feb', revenue: 115000, orders: 1150, customers: 1700 },
          { label: 'Mar', revenue: 128000, orders: 1280, customers: 1890 },
          { label: 'Abr', revenue: 134000, orders: 1340, customers: 1980 },
          { label: 'May', revenue: 39480, orders: 394, customers: 582 },
        ];
        break;
      default:
        const { rows: r2 } = await pool.query('SELECT * FROM weekly_stats ORDER BY id');
        data = r2.map(r => ({
          label: r.day, revenue: r.sales, orders: r.orders_count, customers: Math.round(r.sales / 65)
        }));
    }

    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = data.reduce((s, d) => s + d.orders, 0);
    const totalCustomers = data.reduce((s, d) => s + d.customers, 0);

    res.json({ data, totalRevenue, totalOrders, totalCustomers });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const { rows: totalRows } = await pool.query('SELECT SUM(orders_count) as total FROM products');
    const total = parseInt(totalRows[0].total) || 1;
    const { rows: cats } = await pool.query('SELECT category, SUM(orders_count) as value FROM products GROUP BY category');

    const colors = { 'Platos Fuertes': '#FF7A00', 'Bebidas': '#3B82F6', 'Entradas': '#22C55E', 'Postres': '#8B5CF6' };
    const result = cats.map(c => ({
      name: c.category,
      value: Math.round((parseInt(c.value) / total) * 100),
      color: colors[c.category] || '#9CA3AF',
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/top-products', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT name, orders_count as orders, (price * orders_count) as revenue FROM products ORDER BY orders_count DESC LIMIT 5'
    );
    const result = rows.map(p => ({
      ...p,
      revenue: parseFloat(p.revenue) || 0,
      growth: Math.floor(Math.random() * 20) + 5,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
