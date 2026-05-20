import { Router } from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      "SELECT * FROM orders WHERE status IN ('pendiente', 'en_preparacion', 'listo', 'entregado') ORDER BY id DESC"
    );

    const columns = { pendiente: [], en_preparacion: [], listo: [], entregado: [] };

    for (const o of orders) {
      const { rows: items } = await pool.query('SELECT name, quantity FROM order_items WHERE order_id = $1', [o.id]);
      const itemNames = items.map(i => `${i.name} x${i.quantity}`);
      const startTime = new Date(o.created_at).getTime();
      const priority = o.status === 'pendiente'
        ? (Date.now() - startTime > 10 * 60000 ? 'urgent' : Date.now() - startTime > 5 * 60000 ? 'high' : 'normal')
        : 'normal';

      if (columns[o.status]) {
        columns[o.status].push({
          id: o.display_id,
          table: o.table_name,
          items: itemNames,
          startTime,
          priority,
          guests: o.guests,
        });
      }
    }

    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:displayId/move', authMiddleware, async (req, res) => {
  try {
    const { displayId } = req.params;
    const { toStatus } = req.body;
    const validStatuses = ['pendiente', 'en_preparacion', 'listo', 'entregado'];

    if (!validStatuses.includes(toStatus)) {
      return res.status(400).json({ error: 'Estado destino inválido' });
    }

    const { rowCount } = await pool.query('UPDATE orders SET status = $1 WHERE display_id = $2', [toStatus, displayId]);
    if (rowCount === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
