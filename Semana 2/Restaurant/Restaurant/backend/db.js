import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;

const pool = new Pool(
  process.env.DATABASE_URL || process.env.POSTGRES_URL
    ? { connectionString: (process.env.DATABASE_URL || process.env.POSTGRES_URL), ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'restaurantos',
        user: process.env.DB_USER || 'restaurantos',
        password: process.env.DB_PASSWORD || 'restaurantos123',
      }
);

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'Administrador',
        phone TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
        name TEXT DEFAULT 'Mi Restaurante',
        address TEXT DEFAULT '',
        capacity INTEGER DEFAULT 0,
        hours TEXT DEFAULT 'Lun-Dom 10:00 - 22:00',
        cuisine TEXT DEFAULT '',
        plan TEXT DEFAULT 'Pro Edition',
        plan_renewal TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        available INTEGER DEFAULT 1,
        description TEXT DEFAULT '',
        orders_count INTEGER DEFAULT 0,
        rating DOUBLE PRECISION DEFAULT 4.5,
        emoji TEXT DEFAULT '🍽️',
        prep TEXT DEFAULT '10 min',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        display_id TEXT NOT NULL,
        table_name TEXT NOT NULL,
        total DOUBLE PRECISION NOT NULL,
        status TEXT DEFAULT 'pendiente',
        waiter TEXT DEFAULT '',
        guests INTEGER DEFAULT 1,
        time TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        price DOUBLE PRECISION DEFAULT 0
      );

      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id);

      CREATE TABLE IF NOT EXISTS notification_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
        new_order INTEGER DEFAULT 1,
        order_ready INTEGER DEFAULT 1,
        daily_report INTEGER DEFAULT 1,
        weekly_report INTEGER DEFAULT 0,
        low_stock INTEGER DEFAULT 1,
        cancellations INTEGER DEFAULT 1,
        sms INTEGER DEFAULT 0,
        email INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS weekly_stats (
        id SERIAL PRIMARY KEY,
        day TEXT NOT NULL,
        sales DOUBLE PRECISION DEFAULT 0,
        orders_count INTEGER DEFAULT 0
      );
    `);

    const { rows } = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(rows[0].count) === 0) await seedData(client);
  } finally {
    client.release();
  }
}

async function seedData(client) {
  const hash = bcrypt.hashSync('demo1234', 10);

  await client.query(
    'INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)',
    ['David Triana', 'admin@restaurantos.com', hash, 'Administrador', '+52 55 1234 5678']
  );

  await client.query(
    'INSERT INTO restaurants (user_id, name, address, capacity, hours, cuisine, plan, plan_renewal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [1, 'El Fogón Mexicano', 'Av. Insurgentes Sur 1234, CDMX', 45, 'Lun-Dom 10:00 - 22:00', 'Mexicana contemporánea', 'Pro Edition', '15 jun, 2026']
  );

  await client.query('INSERT INTO notification_settings (user_id) VALUES (1)');

  const products = [
    ['Burger Clásica', 'Platos Fuertes', 125, 1, 'Carne 200g, lechuga, tomate, queso cheddar, cebolla morada', 145, 4.8, '🍔', '12 min'],
    ['Pizza Margherita', 'Platos Fuertes', 165, 1, 'Masa artesanal, salsa de tomate, mozzarella fresca, albahaca', 98, 4.7, '🍕', '18 min'],
    ['Tacos al Pastor', 'Platos Fuertes', 65, 1, 'Orden de 3 tacos con adobo, piña, cilantro y cebolla', 203, 4.9, '🌮', '8 min'],
    ['Pasta Carbonara', 'Platos Fuertes', 145, 0, 'Espagueti, tocino ahumado, huevo, parmesano, pimienta negra', 67, 4.5, '🍝', '15 min'],
    ['Ensalada César', 'Entradas', 85, 1, 'Lechuga romana, crutones, parmesano, aderezo clásico', 89, 4.6, '🥗', '5 min'],
    ['Sopa Azteca', 'Entradas', 75, 1, 'Caldo de tomate con chile pasilla, tortilla frita, crema, queso', 112, 4.8, '🍲', '10 min'],
    ['Guacamole + Totopos', 'Entradas', 55, 1, 'Aguacate Hass, jitomate, cebolla, chile serrano, limón', 178, 4.9, '🥑', '5 min'],
    ['Ceviche de Camarón', 'Entradas', 95, 0, 'Camarón fresco, jugo de limón, jitomate, pepino, cilantro', 54, 4.4, '🦐', '10 min'],
    ['Brownie con Helado', 'Postres', 70, 1, 'Brownie de chocolate caliente, helado de vainilla, jarabe de chocolate', 134, 4.7, '🍫', '5 min'],
    ['Churros con Cajeta', 'Postres', 55, 1, 'Churros artesanales con azúcar y canela, cajeta de cabra', 88, 4.6, '🥐', '8 min'],
    ['Agua de Jamaica', 'Bebidas', 35, 1, 'Agua fresca de flor de jamaica sin azúcar / con azúcar', 245, 4.5, '🍹', '2 min'],
    ['Michelada', 'Bebidas', 65, 1, 'Cerveza con clamato, jugo de limón, sal, chamoy, chile', 167, 4.7, '🍺', '3 min'],
  ];

  for (const p of products) {
    await client.query(
      'INSERT INTO products (name, category, price, available, description, orders_count, rating, emoji, prep) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      p
    );
  }

  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Hoy'];
  const sales = [4200, 3800, 5100, 4700, 6200, 8900, 5640];
  const orders = [42, 38, 51, 47, 62, 89, 56];
  for (let i = 0; i < days.length; i++) {
    await client.query('INSERT INTO weekly_stats (day, sales, orders_count) VALUES ($1, $2, $3)', [days[i], sales[i], orders[i]]);
  }

  const ordersData = [
    ['#4521', 'Mesa 5', 285, 'en_preparacion', 'Carlos M.', 2, '12:45', ['Burger Clásica x2', 'Papas Fritas x2', 'Refresco x2']],
    ['#4520', 'Mesa 12', 195, 'pendiente', 'Laura V.', 2, '12:43', ['Pizza Margherita', 'Ensalada César', 'Agua x2']],
    ['#4519', 'Mesa 3', 145, 'listo', 'Roberto S.', 3, '12:38', ['Tacos x3', 'Agua Mineral x2', 'Guacamole']],
    ['#4518', 'Mesa 8', 320, 'entregado', 'Ana G.', 2, '12:30', ['Pasta Carbonara', 'Vino Tinto Copa', 'Pan de Ajo']],
    ['#4517', 'Mesa 1', 95, 'entregado', 'Carlos M.', 1, '12:22', ['Sopa Azteca', 'Pan de Ajo', 'Jamaica']],
    ['#4516', 'Mesa 9', 580, 'entregado', 'Laura V.', 2, '12:15', ['Filete Miñón', 'Vino Tinto Botella', 'Postre del Día']],
    ['#4515', 'Barra 2', 240, 'entregado', 'Pedro L.', 2, '11:58', ['Camarones al Ajillo', 'Michelada x2']],
    ['#4514', 'Mesa 6', 110, 'cancelado', 'Ana G.', 2, '11:45', ['Ensalada de la Casa x2', 'Agua x2']],
    ['#4513', 'Mesa 11', 390, 'en_preparacion', 'Roberto S.', 2, '12:40', ['Costillas BBQ', 'Papas Fritas x2', 'Refresco x2']],
    ['#4512', 'Terraza 1', 275, 'pendiente', 'Pedro L.', 4, '12:41', ['Ceviche', 'Tostadas x3', 'Agua de Coco x2']],
  ];

  for (const o of ordersData) {
    const { rows } = await client.query(
      'INSERT INTO orders (display_id, table_name, total, status, waiter, guests, time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [o[0], o[1], o[2], o[3], o[4], o[5], o[6]]
    );
    const orderId = rows[0].id;
    for (const item of o[7]) {
      const match = item.match(/^(.+?)\s*x(\d+)$/);
      if (match) {
        await client.query('INSERT INTO order_items (order_id, name, quantity, price) VALUES ($1, $2, $3, $4)', [orderId, match[1].trim(), parseInt(match[2]), Math.round(o[2] / o[7].length)]);
      } else {
        await client.query('INSERT INTO order_items (order_id, name, quantity, price) VALUES ($1, $2, $3, $4)', [orderId, item, 1, Math.round(o[2] / o[7].length)]);
      }
    }
  }
}

export default pool;
