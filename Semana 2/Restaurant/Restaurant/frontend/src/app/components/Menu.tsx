import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Star, X, AlertTriangle } from 'lucide-react';
import { useBreakpoint } from './useBreakpoint';
import { api } from '../../services/api';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
  description: string;
  orders: number;
  rating: number;
  emoji: string;
  prep: string;
}

function ProductCard({ product, onToggle, onDelete, onEdit, compact }: { product: Product; onToggle: (id: number) => void; onDelete: (id: number) => void; onEdit: (id: number) => void; compact: boolean }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${product.available ? 'rgba(0,0,0,0.07)' : 'rgba(239,68,68,0.2)'}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      opacity: product.available ? 1 : 0.78,
    }}>
      {/* Emoji area */}
      <div style={{ background: product.available ? 'linear-gradient(135deg,#FFF7ED,#FEF3C7)' : '#F9FAFB', padding: compact ? '16px' : '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 36 : 46, position: 'relative' }}>
        {product.emoji}
        {!product.available && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>NO DISPONIBLE</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span style={{ background: '#FF7A00', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 10 }}>{product.orders}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: compact ? '12px' : '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5 }}>
          <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{product.name}</h3>
          <span style={{ color: '#FF7A00', fontWeight: 700, fontSize: 14, flexShrink: 0, marginLeft: 6 }}>${product.price}</span>
        </div>
        {!compact && <p style={{ color: '#9CA3AF', fontSize: 12, lineHeight: 1.5, marginBottom: 9 }}>{product.description}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={10} color="#F59E0B" fill="#F59E0B" />
            <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 500 }}>{product.rating}</span>
          </div>
          <span style={{ color: '#D1D5DB', fontSize: 11 }}>•</span>
          <span style={{ color: '#9CA3AF', fontSize: 11 }}>⏱ {product.prep}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F3F4F6', paddingTop: 10 }}>
          <button onClick={() => onToggle(product.id)}
            style={{ flex: 1, padding: '6px', border: 'none', borderRadius: 7, cursor: 'pointer', background: product.available ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', color: product.available ? '#22C55E' : '#EF4444', fontSize: 11, fontWeight: 600 }}>
            {product.available ? '✓ Disponible' : '✗ No disponible'}
          </button>
          <button onClick={() => onEdit(product.id)} style={{ padding: '6px 9px', background: '#F3F4F6', border: 'none', borderRadius: 7, cursor: 'pointer', color: '#6B7280', display: 'flex' }}><Edit2 size={13} /></button>
          <button onClick={() => onDelete(product.id)} style={{ padding: '6px 9px', background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 7, cursor: 'pointer', color: '#EF4444', display: 'flex' }}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}

export function MenuPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🍽️');
  const [prep, setPrep] = useState('10 min');
  const [flash, setFlash] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<number | null>(null);

  useEffect(() => {
    api.getMenu({ category: activeCategory, search: search || undefined }).then(setProducts).catch(() => {});
  }, [activeCategory, search]);

  useEffect(() => {
    api.getCategories().then(cats => setCategories(['Todos', ...cats])).catch(() => {});
  }, []);

  const filtered = products;
  const toggleAvailability = async (id: number) => {
    try {
      const result = await api.toggleProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, available: result.available } : p));
    } catch {}
  };
  const available = products.filter(p => p.available).length;
  const compact = isMobile || isTablet;

  const deleteProduct = async (id: number) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (deleteTarget === null) return;
    setDeleting(true);
    try {
      await api.deleteProduct(deleteTarget);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget));
      setFlash('Producto eliminado');
      setDeleteTarget(null);
      api.getCategories().then(cats => setCategories(['Todos', ...cats])).catch(() => {});
    } catch {}
    setDeleting(false);
  };

  const cardMinWidth = isMobile ? '140px' : isTablet ? '200px' : '250px';

  const openCreate = () => {
    setEditTarget(null);
    setCreateOpen(true);
    setFormError(null);
    setName('');
    setCategory('');
    setPrice('');
    setDescription('');
    setEmoji('🍽️');
    setPrep('10 min');
  };

  const openEdit = (id: number) => {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    setEditTarget(id);
    setCreateOpen(true);
    setFormError(null);
    setName(p.name);
    setCategory(p.category);
    setPrice(String(p.price));
    setDescription(p.description);
    setEmoji(p.emoji || '🍽️');
    setPrep(p.prep || '10 min');
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setFormError(null);
  };

  const submitProduct = async () => {
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const numericPrice = Number(price);
    if (!trimmedName || !trimmedCategory || !Number.isFinite(numericPrice)) {
      setFormError('Nombre, categoría y precio son requeridos');
      return;
    }

    setCreating(true);
    setFormError(null);
    try {
      const body = {
        name: trimmedName,
        category: trimmedCategory,
        price: numericPrice,
        description: description.trim(),
        emoji: emoji.trim() || '🍽️',
        prep: prep.trim() || '10 min',
      };
      if (editTarget) {
        await api.updateProduct(editTarget, body);
        setFlash('Producto actualizado');
      } else {
        await api.createProduct(body);
        setFlash('Producto creado');
      }
      setEditTarget(null);
      setCreateOpen(false);
      api.getMenu({ category: activeCategory, search: search || undefined }).then(setProducts).catch(() => {});
      api.getCategories().then(cats => setCategories(['Todos', ...cats])).catch(() => {});
    } catch (err: any) {
      setFormError(err?.message || 'No se pudo guardar el producto');
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ color: '#1E1E1E', fontWeight: 700, fontSize: isMobile ? 20 : 24, marginBottom: 3 }}>Gestión del Menú</h1>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>{products.length} productos · {available} disponibles</p>
        </div>
        {flash && (
          <div style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', color: '#22C55E', fontSize: 12, fontWeight: 600 }}>
            {flash}
          </div>
        )}
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FF7A00', color: 'white', border: 'none', borderRadius: 10, padding: isMobile ? '9px 12px' : '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 12px rgba(255,122,0,0.3)', flexShrink: 0 }}>
          <Plus size={15} />
          {!isMobile && 'Agregar'}
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ background: 'white', borderRadius: 13, padding: isMobile ? '12px' : '14px 18px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, boxSizing: 'border-box', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', background: '#F9FAFB', color: '#374151' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0, background: activeCategory === cat ? '#FF7A00' : '#F3F4F6', color: activeCategory === cat ? 'white' : '#6B7280', fontSize: 12, fontWeight: 500 }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, overflowX: 'auto' }}>
          {categories.slice(1).map(cat => {
            const count = products.filter(p => p.category === cat).length;
            const avail = products.filter(p => p.category === cat && p.available).length;
            return (
              <div key={cat} style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(0,0,0,0.05)', flexShrink: 0, minWidth: 120 }}>
                <div style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 3 }}>{cat}</div>
                <div style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 18 }}>{count}</div>
                <div style={{ color: '#22C55E', fontSize: 11, marginTop: 1 }}>{avail} disponibles</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinWidth}, 1fr))`, gap: isMobile ? 10 : 14 }}>
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} onToggle={toggleAvailability} onDelete={deleteProduct} onEdit={openEdit} compact={compact} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 24px', color: '#9CA3AF' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
          <p style={{ fontSize: 14 }}>No se encontraron productos</p>
        </div>
      )}

      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: isMobile ? '100%' : 520, maxHeight: isMobile ? '90vh' : '86vh', background: 'white', borderRadius: isMobile ? '16px 16px 0 0' : 16, boxShadow: '0 18px 48px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 16 }}>{editTarget ? 'Editar producto' : 'Nuevo producto'}</div>
                <div style={{ color: '#9CA3AF', fontSize: 12 }}>{editTarget ? 'Actualiza los datos del producto' : 'Agrega un producto al menú'}</div>
              </div>
              <button onClick={closeCreate} style={{ border: 'none', background: '#F3F4F6', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
              {formError && (
                <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nombre"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none' }}
                />
                <input
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Categoría"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none' }}
                />
                <input
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="Precio"
                  type="number"
                  min={0}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none' }}
                />
                <input
                  value={emoji}
                  onChange={e => setEmoji(e.target.value)}
                  placeholder="Emoji"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none' }}
                />
                <input
                  value={prep}
                  onChange={e => setPrep(e.target.value)}
                  placeholder="Tiempo de preparación"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none' }}
                />
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descripción"
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 13, outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <button onClick={closeCreate} style={{ border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Cancelar
              </button>
              <button onClick={submitProduct} disabled={creating} style={{ border: 'none', background: creating ? '#FDBA74' : '#FF7A00', color: 'white', borderRadius: 9, padding: '9px 16px', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(255,122,0,0.3)' }}>
                {creating ? 'Guardando...' : editTarget ? 'Guardar cambios' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ width: 360, background: 'white', borderRadius: 16, boxShadow: '0 18px 48px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 20px 16px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertTriangle size={22} color="#EF4444" />
              </div>
              <div style={{ color: '#1E1E1E', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Eliminar producto</div>
              <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.4 }}>
                ¿Eliminar <strong>{products.find(p => p.id === deleteTarget)?.name}</strong>? Esta acción no se puede deshacer.
              </div>
            </div>
            <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => { setDeleteTarget(null); setDeleting(false); }} style={{ flex: 1, padding: '9px 0', border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Cancelar
              </button>
              <button onClick={confirmDelete} disabled={deleting} style={{ flex: 1, padding: '9px 0', border: 'none', background: deleting ? '#FCA5A5' : '#EF4444', color: 'white', borderRadius: 9, cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
