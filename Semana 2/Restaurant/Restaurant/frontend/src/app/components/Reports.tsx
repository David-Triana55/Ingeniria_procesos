import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, Download } from 'lucide-react';
import { useBreakpoint } from './useBreakpoint';
import { api } from '../../services/api';

const ranges = ['7 días', '30 días', '90 días', '12 meses'];

function MetricCard({ icon: Icon, label, value, sub, color, up }: { icon: React.ElementType; label: string; value: string; sub: string; color: string; up: boolean }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '18px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
        <span style={{ color: up ? '#22C55E' : '#EF4444', fontSize: 12, fontWeight: 600, background: up ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', padding: '3px 8px', borderRadius: 20 }}>
          {up ? '↑' : '↓'} {sub}
        </span>
      </div>
      <div style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 3 }}>{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: '#9CA3AF' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

export function Reports() {
  const { isMobile, isTablet } = useBreakpoint();
  const [range, setRange] = useState('7 días');
  const [data, setData] = useState<{ label: string; revenue: number; orders: number; customers: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; orders: number; revenue: number; growth: number }[]>([]);

  useEffect(() => {
    Promise.all([
      api.getReports(range),
      api.getCategoryData(),
      api.getTopProducts(),
    ]).then(([reportData, catData, topData]) => {
      setData(reportData.data);
      setCategoryData(catData);
      setTopProducts(topData);
    }).catch(() => {});
  }, [range]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const totalCustomers = data.reduce((s, d) => s + d.customers, 0);
  const isCompact = isMobile || isTablet;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: 20, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0 }}>
        <div>
          <h1 style={{ color: '#1E1E1E', fontWeight: 700, fontSize: isMobile ? 20 : 24, marginBottom: 3 }}>Estadísticas y Reportes</h1>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>Analítica del rendimiento</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Range selector */}
          <div style={{ display: 'flex', background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
            {ranges.map(r => (
              <button key={r} onClick={() => setRange(r)}
                style={{ padding: isMobile ? '7px 10px' : '7px 13px', border: 'none', cursor: 'pointer', background: range === r ? '#FF7A00' : 'transparent', color: range === r ? 'white' : '#6B7280', fontSize: 12, fontWeight: range === r ? 600 : 400 }}>
                {isMobile ? r.replace(' días', 'd').replace(' meses', 'm') : r}
              </button>
            ))}
          </div>
          {!isMobile && (
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #E5E7EB', background: 'white', borderRadius: 10, padding: '7px 13px', color: '#6B7280', fontSize: 13, cursor: 'pointer' }}>
              <Download size={13} /> Exportar
            </button>
          )}
        </div>
      </div>

      {/* Metric cards — 2x2 on mobile, 4-col on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 14,
        marginBottom: 20,
      }}>
        <MetricCard icon={DollarSign} label={`Ingresos (${range})`} value={`$${(totalRevenue / 1000).toFixed(0)}k`} sub="18%" color="#FF7A00" up />
        <MetricCard icon={ShoppingBag} label="Pedidos" value={totalOrders.toLocaleString()} sub="12%" color="#3B82F6" up />
        <MetricCard icon={Users} label="Clientes" value={totalCustomers.toLocaleString()} sub="9%" color="#22C55E" up />
        <MetricCard icon={TrendingUp} label="Ticket promedio" value={`$${Math.round(totalRevenue / totalOrders)}`} sub="3%" color="#8B5CF6" up />
      </div>

      {/* Revenue chart + Category pie — stack on mobile */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexDirection: isCompact ? 'column' : 'row' }}>
        <div style={{ flex: 2, background: 'white', borderRadius: 14, padding: isMobile ? 16 : 22, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Evolución de ingresos</h3>
              <p style={{ color: '#9CA3AF', fontSize: 12 }}>Ingresos en MXN</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 210}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={isMobile ? 1 : 0} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#FF7A00" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div style={{ flex: 1, background: 'white', borderRadius: 14, padding: isMobile ? 16 : 22, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Ventas por categoría</h3>
          <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 14 }}>% del total de pedidos</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
            {categoryData.map(cat => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: cat.color }} />
                  <span style={{ color: '#6B7280', fontSize: 12 }}>{cat.name}</span>
                </div>
                <span style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 12 }}>{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row — stack on mobile */}
      <div style={{ display: 'flex', gap: 14, flexDirection: isCompact ? 'column' : 'row' }}>
        {/* Bar chart */}
        <div style={{ flex: 1, background: 'white', borderRadius: 14, padding: isMobile ? 16 : 22, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Pedidos y clientes</h3>
          <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 14 }}>Comparativa por período</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} barSize={7} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={isMobile ? 2 : 1} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#FF7A00" radius={[3, 3, 0, 0]} />
              <Bar dataKey="customers" name="customers" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div style={{ flex: 1, background: 'white', borderRadius: 14, padding: isMobile ? 16 : 22, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Top productos</h3>
          <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 16 }}>Por número de pedidos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topProducts.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: i === 0 ? '#FF7A00' : '#F3F4F6', color: i === 0 ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: '#374151', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ color: '#9CA3AF', fontSize: 11 }}>{p.orders} pedidos</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: '#1E1E1E', fontSize: 13, fontWeight: 600 }}>${(p.revenue / 1000).toFixed(1)}k</div>
                  <div style={{ color: '#22C55E', fontSize: 11 }}>+{p.growth}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
