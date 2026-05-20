import { Router } from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows: totalRows } = await pool.query("SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE");
    const { rows: activeRows } = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status IN ('pendiente', 'en_preparacion')");
    const { rows: revenueRows } = await pool.query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelado'");
    const { rows: avgRows } = await pool.query("SELECT COALESCE(ROUND(AVG(total)::numeric), 0) as avg FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelado'");

    res.json({
      todayOrders: parseInt(totalRows[0].count),
      activeOrders: parseInt(activeRows[0].count),
      todayRevenue: parseFloat(revenueRows[0].total),
      avgTicket: parseInt(avgRows[0].avg),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM weekly_stats ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/recent-orders', authMiddleware, async (req, res) => {
  try {
    const { rows: orders } = await pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 5');
    const enriched = await Promise.all(orders.map(async (o) => {
      const { rows: items } = await pool.query('SELECT name FROM order_items WHERE order_id = $1', [o.id]);
      return {
        id: o.display_id,
        table: o.table_name,
        items: items.map(i => i.name).join(', '),
        total: o.total,
        status: o.status,
        time: o.time,
      };
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/hourly', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        EXTRACT(HOUR FROM created_at)::int AS hour,
        COUNT(*)::int AS count
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY hour
      ORDER BY hour
    `);
    const labels = ['10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm'];
    const hourMap = new Map(rows.map(r => [r.hour, r.count]));
    const data = labels.map((label, i) => ({
      hour: label,
      p: hourMap.get(10 + i) || 0,
    }));
    res.json(data);
  } catch (err) {
    console.error('Error GET /dashboard/hourly:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
