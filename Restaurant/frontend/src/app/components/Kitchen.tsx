import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ChevronRight, Plus } from 'lucide-react';
import { useBreakpoint } from './useBreakpoint';
import { api } from '../../services/api';

interface KitchenOrder {
  id: string;
  table: string;
  items: string[];
  startTime: number;
  priority: 'normal' | 'high' | 'urgent';
  guests: number;
}

type Column = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';

const columnConfig: Record<Column, { label: string; short: string; color: string; bg: string; border: string; nextLabel: string; nextCol: Column | null }> = {
  pendiente: { label: 'Pendiente', short: 'Pendiente', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', nextLabel: 'Iniciar', nextCol: 'en_preparacion' },
  en_preparacion: { label: 'En preparación', short: 'En prep.', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', nextLabel: 'Listo', nextCol: 'listo' },
  listo: { label: 'Listo', short: 'Listo', color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0', nextLabel: 'Entregado', nextCol: 'entregado' },
  entregado: { label: 'Entregado', short: 'Entregado', color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB', nextLabel: '', nextCol: null },
};

const priorityConfig = {
  normal: { label: 'Normal', color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
  high: { label: 'Urgente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  urgent: { label: '¡VIP!', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

function ElapsedTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startTime) / 1000));
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isWarn = mins >= 10;
  const isAlert = mins >= 18;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {isAlert && <AlertTriangle size={11} color="#EF4444" />}
      <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: isAlert ? '#EF4444' : isWarn ? '#F59E0B' : '#6B7280' }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}

function OrderCard({ order, col, onMove }: { order: KitchenOrder; col: Column; onMove: (id: string, from: Column, to: Column) => void }) {
  const cfg = columnConfig[col];
  const pri = priorityConfig[order.priority];
  const elapsed = Math.floor((Date.now() - order.startTime) / 1000 / 60);
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: 12,
      border: `1px solid ${elapsed >= 18 ? '#FCA5A5' : '#E5E7EB'}`,
      boxShadow: elapsed >= 18 ? '0 0 0 2px rgba(239,68,68,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 13 }}>{order.id}</span>
          {order.priority !== 'normal' && (
            <span style={{ padding: '2px 6px', borderRadius: 8, background: pri.bg, color: pri.color, fontSize: 10, fontWeight: 700 }}>{pri.label}</span>
          )}
        </div>
        <ElapsedTimer startTime={order.startTime} />
      </div>
      <div style={{ color: '#374151', fontWeight: 600, fontSize: 12, marginBottom: 8 }}>
        {order.table} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>· {order.guests} pers.</span>
      </div>
      <div style={{ background: '#F9FAFB', borderRadius: 7, padding: '7px 9px', marginBottom: 10 }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, paddingBottom: i < order.items.length - 1 ? 4 : 0, marginBottom: i < order.items.length - 1 ? 3 : 0, borderBottom: i < order.items.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0 }} />
            <span style={{ color: '#374151', fontSize: 12 }}>{item}</span>
          </div>
        ))}
      </div>
      {cfg.nextCol && (
        <button onClick={() => onMove(order.id, col, cfg.nextCol!)}
          style={{ width: '100%', padding: '7px', background: cfg.color, color: 'white', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {cfg.nextLabel} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

let newOrderCounter = 4522;
const tables = ['Mesa 4', 'Mesa 6', 'Mesa 7', 'Mesa 10', 'Barra 1', 'Terraza 2'];
const itemSets = [
  ['Burger Especial x2', 'Refresco x2'],
  ['Enchiladas Verdes x3', 'Agua x3'],
  ['Pollo Asado', 'Ensalada', 'Limonada'],
  ['Arrachera 300g', 'Papas Fritas', 'Cerveza'],
];

export function Kitchen() {
  const { isMobile } = useBreakpoint();
  const [columns, setColumns] = useState<Record<Column, KitchenOrder[]>>({ pendiente: [], en_preparacion: [], listo: [], entregado: [] });
  const [activeCol, setActiveCol] = useState<Column>('pendiente');
  const [, forceUpdate] = useState(0);

  const loadKitchen = async () => {
    try {
      const data = await api.getKitchen();
      setColumns(data);
    } catch {}
  };

  useEffect(() => { loadKitchen(); }, []);

  useEffect(() => {
    const t = setInterval(() => forceUpdate(c => c + 1), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(loadKitchen, 15000);
    return () => clearInterval(t);
  }, []);

  const moveOrder = async (id: string, from: Column, to: Column) => {
    setColumns(prev => {
      const order = prev[from].find(o => o.id === id);
      if (!order) return prev;
      return { ...prev, [from]: prev[from].filter(o => o.id !== id), [to]: [...prev[to], { ...order, startTime: Date.now() }] };
    });
    try { await api.moveOrder(id, to); } catch { loadKitchen(); }
  };

  const addOrder = async () => {
    try {
      await api.createOrder({
        table: tables[Math.floor(Math.random() * tables.length)],
        items: itemSets[Math.floor(Math.random() * itemSets.length)].map(name => ({ name: name.split(' x')[0], quantity: parseInt(name.split(' x')[1]) || 1, price: 80 })),
        guests: Math.floor(Math.random() * 4) + 1,
      });
      loadKitchen();
      if (isMobile) setActiveCol('pendiente');
    } catch {}
  };

  const colKeys: Column[] = ['pendiente', 'en_preparacion', 'listo', 'entregado'];
  const total = Object.values(columns).reduce((s, arr) => s + arr.length, 0);
  const active = columns.pendiente.length + columns.en_preparacion.length;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: 16, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 0 }}>
        <div>
          <h1 style={{ color: '#1E1E1E', fontWeight: 700, fontSize: isMobile ? 20 : 24, marginBottom: 3 }}>Vista de Cocina</h1>
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ color: '#9CA3AF', fontSize: 13 }}>{total} pedidos total</span>
            <span style={{ color: '#FF7A00', fontSize: 13, fontWeight: 600 }}>• {active} activos</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', padding: '7px 12px', borderRadius: 20, border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            <span style={{ color: '#22C55E', fontSize: 12, fontWeight: 700 }}>COCINA ACTIVA</span>
          </div>
          <button onClick={addOrder} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FF7A00', color: 'white', border: 'none', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 12px rgba(255,122,0,0.3)' }}>
            <Plus size={14} /> Simular pedido
          </button>
        </div>
      </div>

      {/* Timer legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        {[{ color: '#6B7280', label: '0-9 min' }, { color: '#F59E0B', label: '10-17 min' }, { color: '#EF4444', label: '+18 min crítico' }].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={11} color={color} />
            <span style={{ color: '#9CA3AF', fontSize: 11 }}>{label}</span>
          </div>
        ))}
      </div>

      {isMobile ? (
        /* Mobile: tab-based column view */
        <div>
          {/* Column tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 14, background: 'white', borderRadius: 12, padding: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
            {colKeys.map(col => {
              const cfg = columnConfig[col];
              const isActive = activeCol === col;
              return (
                <button key={col} onClick={() => setActiveCol(col)}
                  style={{ flex: 1, padding: '8px 4px', border: 'none', borderRadius: 8, cursor: 'pointer', background: isActive ? cfg.color : 'transparent', color: isActive ? 'white' : '#6B7280', fontSize: 11, fontWeight: isActive ? 700 : 500, transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span>{cfg.short}</span>
                  <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>{columns[col].length}</span>
                </button>
              );
            })}
          </div>

          {/* Active column cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {columns[activeCol].map(order => (
              <OrderCard key={order.id} order={order} col={activeCol} onMove={moveOrder} />
            ))}
            {columns[activeCol].length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', fontSize: 13, border: '2px dashed #E5E7EB', borderRadius: 12, padding: 32 }}>
                Sin pedidos en esta etapa
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: full Kanban */
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))', gap: 14, minWidth: 800 }}>
            {colKeys.map(col => {
              const cfg = columnConfig[col];
              const orders = columns[col];
              return (
                <div key={col} style={{ display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                  <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '11px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color }} />
                      <span style={{ color: cfg.color, fontWeight: 700, fontSize: 13 }}>{cfg.label}</span>
                    </div>
                    <span style={{ background: cfg.color, color: 'white', borderRadius: 20, padding: '2px 9px', fontSize: 12, fontWeight: 700 }}>{orders.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {orders.map(order => (
                      <OrderCard key={order.id} order={order} col={col} onMove={moveOrder} />
                    ))}
                    {orders.length === 0 && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', fontSize: 13, border: '2px dashed #E5E7EB', borderRadius: 12, padding: 24, minHeight: 100 }}>
                        Sin pedidos
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
