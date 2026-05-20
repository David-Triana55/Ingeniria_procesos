import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows: users } = await pool.query('SELECT id, name, email, role, phone, avatar FROM users WHERE id = $1', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = users[0];
    const { rows: restaurants } = await pool.query('SELECT * FROM restaurants WHERE user_id = $1', [req.user.id]);
    const { rows: notifsRows } = await pool.query('SELECT * FROM notification_settings WHERE user_id = $1', [req.user.id]);

    res.json({
      user: {
        ...user,
        initials: user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      },
      restaurant: restaurants[0] || {},
      notifications: notifsRows[0] ? {
        newOrder: !!notifsRows[0].new_order,
        orderReady: !!notifsRows[0].order_ready,
        dailyReport: !!notifsRows[0].daily_report,
        weeklyReport: !!notifsRows[0].weekly_report,
        lowStock: !!notifsRows[0].low_stock,
        cancellations: !!notifsRows[0].cancellations,
        sms: !!notifsRows[0].sms,
        email: !!notifsRows[0].email,
      } : {},
    });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/personal', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    await pool.query('UPDATE users SET name = $1, email = $2, phone = $3, role = $4 WHERE id = $5',
      [name, email, phone, role, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/restaurant', authMiddleware, async (req, res) => {
  try {
    const { name, address, capacity, hours, cuisine } = req.body;
    await pool.query(
      'UPDATE restaurants SET name = $1, address = $2, capacity = $3, hours = $4, cuisine = $5 WHERE user_id = $6',
      [name, address, capacity, hours, cuisine, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);

    if (!bcrypt.compareSync(currentPassword, rows[0].password)) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/notifications', authMiddleware, async (req, res) => {
  try {
    const { newOrder, orderReady, dailyReport, weeklyReport, lowStock, cancellations, sms, email } = req.body;
    await pool.query(`
      UPDATE notification_settings SET
        new_order = $1, order_ready = $2, daily_report = $3, weekly_report = $4,
        low_stock = $5, cancellations = $6, sms = $7, email = $8
      WHERE user_id = $9
    `, [
      newOrder ? 1 : 0, orderReady ? 1 : 0, dailyReport ? 1 : 0, weeklyReport ? 1 : 0,
      lowStock ? 1 : 0, cancellations ? 1 : 0, sms ? 1 : 0, email ? 1 : 0,
      req.user.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
