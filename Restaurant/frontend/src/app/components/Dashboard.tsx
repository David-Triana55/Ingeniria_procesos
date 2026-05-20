import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Clock, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useBreakpoint } from './useBreakpoint';
import { api } from '../../services/api';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  en_preparacion: { label: 'En preparación', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  listo: { label: 'Listo', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  entregado: { label: 'Entregado', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' },
  cancelado: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

function StatCard({ icon: Icon, label, value, sub, up, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; up: boolean; color: string;
}) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={19} color={color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: up ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', padding: '3px 7px', borderRadius: 20 }}>
          {up ? <ArrowUpRight size={12} color="#22C55E" /> : <ArrowDownRight size={12} color="#EF4444" />}
          <span style={{ color: up ? '#22C55E' : '#EF4444', fontSize: 11, fontWeight: 600 }}>{sub}</span>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.name === 'ventas' ? `$${p.value.toLocaleString()}` : p.value}</div>
      ))}
    </div>
  );
};

export function Dashboard() {
  const { isMobile, isTablet } = useBreakpoint();
  const [stats, setStats] = useState({ todayOrders: 0, activeOrders: 0, todayRevenue: 0, avgTicket: 0 });
  const [weeklyData, setWeeklyData] = useState<{ day: string; ventas: number; pedidos: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; p: number }[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = async () => {
    try {
      const [dashData, weekly, recent, hourly] = await Promise.all([
        api.getDashboard(),
        api.getWeeklyData(),
        api.getRecentOrders(),
        api.getHourlyData(),
      ]);
      setStats(dashData);
      setWeeklyData(weekly.map((w: any) => ({ day: w.day, ventas: w.sales, pedidos: w.orders_count })));
      setRecentOrders(recent);
      setHourlyData(hourly);
      setLastUpdated(new Date());
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const t = setInterval(loadData, 15000);
    return () => clearInterval(t);
  }, []);

  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  const isCompact = isMobile || isTablet;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: 20, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0 }}>
        <div>
          <h1 style={{ color: '#1E1E1E', fontWeight: 700, fontSize: isMobile ? 20 : 24, marginBottom: 3 }}>Dashboard</h1>
          <p style={{ color: '#9CA3AF', fontSize: 13, textTransform: 'capitalize' }}>{today}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: 12 }}>
          <RefreshCw size={13} />
          <span>{lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* Stat cards — 2 cols on mobile, 4 on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 14,
        marginBottom: 20,
      }}>
        <StatCard icon={ShoppingBag} label="Pedidos hoy" value={String(stats.todayOrders ?? 0)} sub="hoy" up color="#FF7A00" />
        <StatCard icon={Clock} label="Pedidos activos" value={String(stats.activeOrders ?? 0)} sub="ahora" up color="#3B82F6" />
        <StatCard icon={DollarSign} label="Ingresos del día" value={`$${Number(stats.todayRevenue ?? 0).toLocaleString()}`} sub="hoy" up color="#22C55E" />
        <StatCard icon={TrendingUp} label="Ticket promedio" value={`$${Number(stats.avgTicket ?? 0).toLocaleString()}`} sub="promedio" up={false} color="#8B5CF6" />
      </div>

      {/* Charts row — stack on mobile */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexDirection: isCompact ? 'column' : 'row' }}>
        {/* Weekly revenue */}
        <div style={{ flex: 2, background: 'white', borderRadius: 14, padding: isMobile ? 16 : 22, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Ventas de la semana</h3>
              <p style={{ color: '#9CA3AF', fontSize: 12 }}>Ingresos diarios en MXN</p>
            </div>
            <div style={{ background: 'rgba(255,122,0,0.08)', padding: '4px 10px', borderRadius: 20 }}>
              <span style={{ color: '#FF7A00', fontSize: 12, fontWeight: 600 }}>Esta semana</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ventas" name="ventas" stroke="#FF7A00" strokeWidth={2.5} fill="url(#orangeGrad)" dot={false} activeDot={{ r: 5, fill: '#FF7A00' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly orders */}
        <div style={{ flex: 1, background: 'white', borderRadius: 14, padding: isMobile ? 16 : 22, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Pedidos por hora</h3>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>Distribución del día</p>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
            <BarChart data={hourlyData} barSize={isMobile ? 8 : 10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={isMobile ? 2 : 1} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="p" name="pedidos" fill="#FF7A00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: isMobile ? '16px' : '18px 22px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Pedidos recientes</h3>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>Últimas 5 órdenes</p>
          </div>
          <a href="/orders" style={{ color: '#FF7A00', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Ver todos →</a>
        </div>

        {isMobile ? (
          /* Mobile: card list */
          <div style={{ padding: '8px 14px' }}>
            {recentOrders.map((order, i) => {
              const st = statusConfig[order.status] ?? { label: 'Desconocido', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
              return (
                <div key={order.id} style={{ padding: '12px 0', borderBottom: i < recentOrders.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 13 }}>{order.id}</span>
                      <span style={{ color: '#6B7280', fontSize: 12 }}>{order.table}</span>
                    </div>
                    <span style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 13 }}>${order.total}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: '#9CA3AF', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{order.items}</p>
                    <span style={{ padding: '3px 9px', borderRadius: 20, background: st.bg, color: st.color, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop: table */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#FAFAFA' }}>
                  {['#Pedido', 'Mesa', 'Items', 'Total', 'Estado', 'Hora'].map(h => (
                    <th key={h} style={{ padding: '10px 22px', textAlign: 'left', color: '#9CA3AF', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
            {recentOrders.map((order, i) => {
              const st = statusConfig[order.status] ?? { label: 'Desconocido', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
              return (
                    <tr key={order.id} style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                      <td style={{ padding: '13px 22px', color: '#1E1E1E', fontWeight: 600, fontSize: 14 }}>{order.id}</td>
                      <td style={{ padding: '13px 22px', color: '#374151', fontSize: 14 }}>{order.table}</td>
                      <td style={{ padding: '13px 22px', color: '#6B7280', fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.items}</td>
                      <td style={{ padding: '13px 22px', color: '#1E1E1E', fontWeight: 700, fontSize: 14 }}>${order.total}</td>
                      <td style={{ padding: '13px 22px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, background: st.bg, color: st.color, fontSize: 12, fontWeight: 600 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '13px 22px', color: '#9CA3AF', fontSize: 13 }}>{order.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
