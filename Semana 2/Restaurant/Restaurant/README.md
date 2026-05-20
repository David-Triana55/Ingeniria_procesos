# RestaurantOS

Sistema de gestión administrativa para restaurantes. Panel con dashboard, pedidos, cocina, menú, reportes y perfil.

## Stack

| Capa       | Tecnología                                                   |
| ---------- | ------------------------------------------------------------ |
| Frontend   | React 18, React Router 7, Recharts, Lucide React, Vite       |
| Backend    | Express 4, PostgreSQL (pg), JWT, bcryptjs                    |
| Despliegue | Frontend → Vercel, Backend → Railway                         |

## Funcionalidades

- **Dashboard** — tarjetas con ingresos/pedidos/clientes/ticket promedio + gráficas semanales y por hora + pedidos recientes
- **Pedidos** — crear/editar pedidos con búsqueda de productos, ajuste de cantidad, cálculo automático de total
- **Cocina** — vista tipo kanban (pendiente → en preparación → listo → entregado) con arrastre (drag & drop)
- **Menú** — CRUD completo de productos con modal de confirmación para eliminar
- **Reportes** — (vista base)
- **Perfil** — datos del restaurante y configuración de notificaciones

## Estructura

```
RestaurantOS/
├── backend/
│   ├── routes/         # auth, dashboard, orders, kitchen, menu, reports, profile
│   ├── middleware/      # auth middleware (JWT)
│   ├── app.js          # Express app
│   ├── server.js        # Entry point
│   ├── db.js            # Pool + initDB + seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Dashboard, Orders, Kitchen, Menu, Login, Layout, etc.
│   │   │   ├── routes.ts
│   │   │   └── App.tsx
│   │   ├── services/         # api.ts (cliente HTTP)
│   │   └── styles/           # fonts.css, index.css
│   ├── api/                  # serverless proxy para Vercel
│   ├── vercel.json
│   └── package.json
└── .gitignore
```

## Desarrollo local

### Backend

```bash
# 1. variables de entorno (crear backend/.env)
DATABASE_URL=postgres://user:pass@host:5432/restaurantos
# o variables individuales:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=restaurantos
# DB_USER=restaurantos
# DB_PASSWORD=restaurantos123

# 2. instalar y arrancar
cd backend
npm install
npm run dev
# API en http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App en http://localhost:5173
```

El frontend en dev proxy `/api/*` a `http://localhost:4000` (configurado en `vite.config.ts`).

## Despliegue

### Railway (Backend)

1. Crear proyecto en Railway desde `backend/`
2. Добавить переменную `DATABASE_URL` con la conexión a PostgreSQL
3. Railway ejecuta `npm start` automáticamente

### Vercel (Frontend)

1. Importar repo, apuntar a `frontend/`
2. Agregar variable de entorno `BACKEND_URL` = URL de Railway (ej: `https://restaurantos-api.up.railway.app`)
3. Vercel usa `vercel.json` para redirigir `/api/*` al serverless proxy y el resto a SPA

## Credenciales por defecto

- Email: `admin@restaurantos.com`
- Password: `demo1234`

Al iniciar, la DB se crea sola con datos de demostración (productos, pedidos, estadísticas semanales).
