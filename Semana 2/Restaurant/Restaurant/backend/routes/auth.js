import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'restaurantos-secret-key-2026';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { rows: restRows } = await pool.query('SELECT * FROM restaurants WHERE user_id = $1', [user.id]);
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      restaurant: restRows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    const { rows } = await pool.query('SELECT id, name, email, role, phone, avatar FROM users WHERE id = $1', [decoded.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { rows: restRows } = await pool.query('SELECT * FROM restaurants WHERE user_id = $1', [decoded.id]);
    res.json({ user: rows[0], restaurant: restRows[0] || null });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
