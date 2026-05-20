import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Printer, ChevronLeft, ChevronRight, Filter, X, Minus, Trash2, Edit2 } from 'lucide-react';
import { useBreakpoint } from './useBreakpoint';
import { api } from '../../services/api';

type OrderStatus = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';

interface Order {
  id: string;
  table: string;
  items: string[];
  total: number;
  status: OrderStatus;
  time: string;
  waiter: string;
  guests: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  available: boolean;
  category: string;
}

interface SelectedItem {
  lineId: string;
  productId?: number | null;
  name: string;
  price: number;
  quantity: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pendiente: { label: 'Pendiente', color: '#D97706', bg: 'rgba(217,119,6,0.1)', dot: '#D97706' },
  en_preparacion: { label: 'En prep.', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', dot: '#3B82F6' },
  listo: { label: 'Listo', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', dot: '#22C55E' },
  entregado: { label: 'Entregado', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', dot: '#9CA3AF' },
  cancelado: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', dot: '#EF4444' },
};

const tabs: { key: OrderStatus | 'todos'; label: string; short: string }[] = [
  { key: 'todos', label: 'Todos', short: 'Todos' },
  { key: 'pendiente', label: 'Pendientes', short: 'Pend.' },
  { key: 'en_preparacion', label: 'En preparación', short: 'En prep.' },
  { key: 'listo', label: 'Listos', short: 'Listos' },
  { key: 'entregado', label: 'Entregados', short: 'Entregados' },
  { key: 'cancelado', label: 'Cancelados', short: 'Cancel.' },
];

export function Orders() {
  const { isMobile } = useBreakpoint();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrderStatus | 'todos'>('todos');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [menu, setMenu] = useState<Product[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuQuery, setMenuQuery] = useState('');
  const [menuCategory, setMenuCategory] = useState('Todos');
  const [tableName, setTableName] = useState('');
  const [waiter, setWaiter] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const perPage = isMobile ? 5 : 7;

  const loadOrders = () =>
    api.getOrders({ status: activeTab, search: search || undefined }).then(setAllOrders).catch(() => {});

  useEffect(() => {
    loadOrders();
  }, [activeTab, search]);

  const filtered = allOrders;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const counts: Record<string, number> = { todos: 0 };
  filtered.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; counts.todos++; });

  useEffect(() => {
    if (mode !== 'edit') return;
    if (!createOpen) return;
    if (menu.length === 0) return;
    setSelectedItems(prev => prev.map(item => {
      if (item.productId || !item.name) return item;
      const match = menu.find(p => p.name === item.name);
      if (!match) return item;
      return { ...item, productId: match.id, price: match.price };
    }));
  }, [menu, mode, createOpen]);

  const openCreate = async () => {
    setMode('create');
    setEditId(null);
    setCreateOpen(true);
    setCreateError(null);
    setTableName('');
    setWaiter('');
    setGuests(2);
    setSelectedItems([]);
    setCustomName('');
    setCustomPrice('');
    setMenuQuery('');
    setMenuCategory('Todos');
    if (menu.length === 0 && !menuLoading) {
      setMenuLoading(true);
      try {
        const data = await api.getMenu();
        setMenu(data);
      } catch {
        setMenu([]);
      } finally {
        setMenuLoading(false);
      }
    }
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setCreateError(null);
  };

  const openEdit = async (order: Order) => {
    setMode('edit');
    setEditId(order.id);
    setCreateOpen(true);
    setCreateError(null);
    setTableName(order.table || '');
    setWaiter(order.waiter || '');
    setGuests(order.guests || 1);
    setSelectedItems(order.items.map((label, idx) => {
      const match = label.match(/^(.+?)\s*x(\d+)$/);
      const name = match ? match[1].trim() : label.trim();
      const quantity = match ? parseInt(match[2]) : 1;
      const product = menu.find(p => p.name === name);
      return {
        lineId: `${Date.now()}-${idx}`,
        productId: product?.id ?? null,
        name,
        price: product?.price ?? 0,
        quantity: quantity || 1,
      };
    }));
    setCustomName('');
    setCustomPrice('');
    setMenuQuery('');
    setMenuCategory('Todos');
    if (menu.length === 0 && !menuLoading) {
      setMenuLoading(true);
      try {
        const data = await api.getMenu();
        setMenu(data);
      } catch {
        setMenu([]);
      } finally {
        setMenuLoading(false);
      }
    }
  };

  const addItem = (product: Product) => {
    if (!product.available) return;
    setSelectedItems(prev => {
      const match = prev.find(item => item.productId === product.id);
      if (match) return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { lineId: `${Date.now()}-${product.id}`, productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const addCustomItem = () => {
    const name = customName.trim();
    const price = Number(customPrice);
    if (!name || !Number.isFinite(price)) {
      setCreateError('Nombre y precio válidos para el producto manual');
      return;
    }
    setSelectedItems(prev => [...prev, {
      lineId: `${Date.now()}-custom`,
      productId: null,
      name,
      price,
      quantity: 1,
    }]);
    setCustomName('');
    setCustomPrice('');
    setCreateError(null);
  };

  const updateQty = (lineId: string, delta: number) => {
    setSelectedItems(prev => prev.map(item => item.lineId === lineId
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item));
  };

  const updateItemDetails = (lineId: string, next: { name?: string; price?: number }) => {
    setSelectedItems(prev => prev.map(item => item.lineId === lineId
      ? { ...item, name: next.name ?? item.name, price: next.price ?? item.price }
      : item));
  };

  const removeItem = (lineId: string) => {
    setSelectedItems(prev => prev.filter(item => item.lineId !== lineId));
  };

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const submitOrder = async () => {
    const trimmedTable = tableName.trim();
    if (!trimmedTable) {
      setCreateError('La mesa es requerida');
      return;
    }
    if (selectedItems.length === 0) {
      setCreateError('Agrega al menos un producto');
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        table: trimmedTable,
        waiter: waiter.trim() || undefined,
        guests,
        items: selectedItems.map(item => item.productId
          ? { productId: item.productId, quantity: item.quantity }
          : { name: item.name, price: item.price, quantity: item.quantity }),
      };
      if (mode === 'edit' && editId) {
        await api.updateOrder(editId, payload);
        setFlash('Pedido actualizado');
      } else {
        await api.createOrder(payload);
        setFlash('Pedido creado');
      }
      setTableName('');
      setWaiter('');
      setGuests(2);
      setSelectedItems([]);
      setCreateOpen(false);
      loadOrders();
    } catch (err: any) {
      setCreateError(err?.message || 'No se pudo crear el pedido');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 2200);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#1E1E1E', fontWeight: 700, fontSize: isMobile ? 20 : 24, marginBottom: 3 }}>Gestión de Pedidos</h1>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>{allOrders.length} pedidos hoy</p>
        </div>
        {flash && (
          <div style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', color: '#22C55E', fontSize: 12, fontWeight: 600 }}>
            {flash}
          </div>
        )}
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FF7A00', color: 'white', border: 'none', borderRadius: 10, padding: isMobile ? '9px 12px' : '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: isMobile ? 13 : 14, boxShadow: '0 4px 12px rgba(255,122,0,0.3)', flexShrink: 0 }}>
          <Plus size={15} />
          {!isMobile && 'Nuevo pedido'}
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{ padding: isMobile ? '14px' : '18px 22px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar #pedido, mesa..."
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, boxSizing: 'border-box', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', background: '#F9FAFB', color: '#374151' }}
              />
            </div>
            {!isMobile && (
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #E5E7EB', background: 'white', borderRadius: 8, padding: '9px 14px', color: '#6B7280', fontSize: 13, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>
                <Filter size={13} /> Filtros
              </button>
            )}
          </div>

          {/* Status tabs — scrollable on mobile */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                style={{
                  padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: activeTab === tab.key ? '#FF7A00' : '#F3F4F6',
                  color: activeTab === tab.key ? 'white' : '#6B7280',
                  fontSize: 12, fontWeight: 500,
                }}
              >
                {isMobile ? tab.short : tab.label}
                {counts[tab.key] !== undefined && (
                  <span style={{ marginLeft: 5, background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)', borderRadius: 10, padding: '1px 5px', fontSize: 10 }}>
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isMobile ? (
          /* Mobile: card list */
          <div style={{ padding: '8px 14px' }}>
            {paged.map((order, i) => {
              const st = statusConfig[order.status];
              return (
                <div key={order.id} style={{ padding: '14px 0', borderBottom: i < paged.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 14 }}>{order.id}</span>
                      <span style={{ color: '#6B7280', fontSize: 13 }}>{order.table}</span>
                    </div>
                    <span style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 14 }}>${order.total}</span>
                  </div>
                  <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.items.slice(0, 2).join(', ')}{order.items.length > 2 && ` +${order.items.length - 2}`}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 20, background: st.bg }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot }} />
                      <span style={{ color: st.color, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ color: '#9CA3AF', fontSize: 12 }}>{order.time}</span>
                      <button style={{ padding: '4px 7px', background: '#F3F4F6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6B7280', display: 'flex' }}><Eye size={13} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop: table */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#FAFAFA' }}>
                  {['#Pedido', 'Mesa', 'Items', 'Total', 'Mesero', 'Estado', 'Hora', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', color: '#9CA3AF', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((order, i) => {
                  const st = statusConfig[order.status];
                  return (
                    <tr key={order.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '13px 20px', color: '#1E1E1E', fontWeight: 700, fontSize: 14 }}>{order.id}</td>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ color: '#374151', fontSize: 14, fontWeight: 500 }}>{order.table}</div>
                        <div style={{ color: '#9CA3AF', fontSize: 12 }}>{order.guests} pers.</div>
                      </td>
                      <td style={{ padding: '13px 20px', maxWidth: 200 }}>
                        <div style={{ color: '#374151', fontSize: 13 }}>
                          {order.items.slice(0, 2).join(', ')}
                          {order.items.length > 2 && <span style={{ color: '#9CA3AF' }}> +{order.items.length - 2}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '13px 20px', color: '#1E1E1E', fontWeight: 700, fontSize: 14 }}>${order.total}</td>
                      <td style={{ padding: '13px 20px', color: '#6B7280', fontSize: 13 }}>{order.waiter}</td>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 20, background: st.bg }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot }} />
                          <span style={{ color: st.color, fontSize: 12, fontWeight: 600 }}>{st.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 20px', color: '#9CA3AF', fontSize: 13 }}>{order.time}</td>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ padding: '6px 8px', background: '#F3F4F6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6B7280', display: 'flex' }}><Eye size={14} /></button>
                          <button onClick={() => openEdit(order)} style={{ padding: '6px 8px', background: 'rgba(255,122,0,0.12)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#FF7A00', display: 'flex' }}><Edit2 size={14} /></button>
                          <button style={{ padding: '6px 8px', background: '#F3F4F6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6B7280', display: 'flex' }}><Printer size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ padding: isMobile ? '12px 14px' : '14px 22px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ color: '#9CA3AF', fontSize: 12 }}>
            {Math.min((page - 1) * perPage + 1, filtered.length)}-{Math.min(page * perPage, filtered.length)} de {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 9px', border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex', color: '#374151' }}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{ padding: '6px 11px', border: `1px solid ${page === i + 1 ? '#FF7A00' : '#E5E7EB'}`, borderRadius: 6, background: page === i + 1 ? '#FF7A00' : 'white', color: page === i + 1 ? 'white' : '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '6px 9px', border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, display: 'flex', color: '#374151' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: isMobile ? '100%' : 820, maxHeight: isMobile ? '90vh' : '86vh', background: 'white', borderRadius: isMobile ? '16px 16px 0 0' : 16, boxShadow: '0 18px 48px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 16 }}>{mode === 'edit' ? 'Editar pedido' : 'Nuevo pedido'}</div>
                <div style={{ color: '#9CA3AF', fontSize: 12 }}>Agrega productos y datos de la mesa</div>
              </div>
              <button onClick={closeCreate} style={{ border: 'none', background: '#F3F4F6', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
              {createError && (
                <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                <input
                  value={tableName}
                  onChange={e => setTableName(e.target.value)}
                  placeholder="Mesa"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none' }}
                />
                <input
                  value={waiter}
                  onChange={e => setWaiter(e.target.value)}
                  placeholder="Mesero (opcional)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none' }}
                />
                <input
                  type="number"
                  min={1}
                  value={guests}
                  onChange={e => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="Personas"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: 14 }}>
                <div style={{ background: '#FAFAFA', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 13 }}>Productos disponibles</div>
                    <div style={{ color: '#9CA3AF', fontSize: 11 }}>{menu.filter(p => p.available).length} items</div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <input
                      value={menuQuery}
                      onChange={e => setMenuQuery(e.target.value)}
                      placeholder="Buscar producto"
                      style={{ flex: 1, minWidth: 160, padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', fontSize: 12, outline: 'none' }}
                    />
                    <select
                      value={menuCategory}
                      onChange={e => setMenuCategory(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', fontSize: 12, outline: 'none' }}
                    >
                      {['Todos', ...Array.from(new Set(menu.map(p => p.category)))].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {menuLoading ? (
                    <div style={{ padding: 18, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Cargando menú...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: isMobile ? 220 : 320, overflowY: 'auto' }}>
                      {menu
                        .filter(p => p.available)
                        .filter(p => (menuCategory === 'Todos' || p.category === menuCategory))
                        .filter(p => p.name.toLowerCase().includes(menuQuery.toLowerCase()))
                        .map(product => (
                        <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 10, padding: '10px 12px' }}>
                          <div>
                            <div style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 13 }}>{product.name}</div>
                            <div style={{ color: '#9CA3AF', fontSize: 11 }}>{product.category}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#FF7A00', fontWeight: 700, fontSize: 13 }}>${product.price}</span>
                            <button onClick={() => addItem(product)} style={{ border: 'none', background: '#FF7A00', color: 'white', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {menu.length > 0 && menu.filter(p => p.available).length === 0 && (
                        <div style={{ padding: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>No hay productos disponibles</div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 12 }}>
                  <div style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Resumen</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="Producto manual"
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 12, outline: 'none' }}
                    />
                    <input
                      value={customPrice}
                      onChange={e => setCustomPrice(e.target.value)}
                      placeholder="Precio"
                      type="number"
                      min={0}
                      style={{ width: 90, padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 12, outline: 'none' }}
                    />
                    <button onClick={addCustomItem} style={{ border: 'none', background: '#1E1E1E', color: 'white', padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Agregar
                    </button>
                  </div>
                  {selectedItems.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Aún no hay productos</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: isMobile ? 200 : 300, overflowY: 'auto' }}>
                      {selectedItems.map(item => (
                        <div key={item.lineId} style={{ border: '1px solid #F3F4F6', borderRadius: 10, padding: '8px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <input
                                value={item.name}
                                onChange={e => updateItemDetails(item.lineId, { name: e.target.value })}
                                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 8px', fontSize: 12, background: '#F9FAFB' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                <input
                                  value={item.price}
                                  type="number"
                                  min={0}
                                  onChange={e => updateItemDetails(item.lineId, { price: Number(e.target.value) })}
                                  style={{ width: 90, border: '1px solid #E5E7EB', borderRadius: 7, padding: '5px 8px', fontSize: 11, background: '#F9FAFB' }}
                                />
                                <span style={{ color: '#9CA3AF', fontSize: 11 }}>precio unitario</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button onClick={() => updateQty(item.lineId, -1)} style={{ border: 'none', background: '#F3F4F6', color: '#6B7280', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Minus size={12} />
                              </button>
                              <span style={{ minWidth: 18, textAlign: 'center', fontSize: 12, fontWeight: 700 }}>{item.quantity}</span>
                              <button onClick={() => updateQty(item.lineId, 1)} style={{ border: 'none', background: '#FF7A00', color: 'white', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Plus size={12} />
                              </button>
                              <button onClick={() => removeItem(item.lineId)} style={{ border: 'none', background: 'rgba(239,68,68,0.08)', color: '#EF4444', width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 12, paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9CA3AF', fontSize: 12 }}>Total</span>
                    <span style={{ color: '#1E1E1E', fontWeight: 800, fontSize: 16 }}>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <button onClick={closeCreate} style={{ border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Cancelar
              </button>
              <button onClick={submitOrder} disabled={creating} style={{ border: 'none', background: creating ? '#FDBA74' : '#FF7A00', color: 'white', borderRadius: 9, padding: '9px 16px', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(255,122,0,0.3)' }}>
                {creating ? (mode === 'edit' ? 'Guardando...' : 'Creando...') : (mode === 'edit' ? 'Guardar cambios' : 'Crear pedido')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
