import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import ordersRoutes from './routes/orders.js';
import kitchenRoutes from './routes/kitchen.js';
import menuRoutes from './routes/menu.js';
import reportsRoutes from './routes/reports.js';
import profileRoutes from './routes/profile.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

export default app;
