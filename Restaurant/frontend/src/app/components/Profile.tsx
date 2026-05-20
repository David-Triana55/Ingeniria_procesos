import { useState, useEffect } from 'react';
import { User, Lock, Bell, Building2, Save, Camera, Check } from 'lucide-react';
import { useBreakpoint } from './useBreakpoint';
import { api } from '../../services/api';

const tabs = [
  { key: 'personal', icon: User, label: 'Personal' },
  { key: 'restaurant', icon: Building2, label: 'Restaurante' },
  { key: 'security', icon: Lock, label: 'Seguridad' },
  { key: 'notifications', icon: Bell, label: 'Notificaciones' },
];

function InputField({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: '10px 13px', boxSizing: 'border-box', border: `1px solid ${focused ? '#FF7A00' : '#E5E7EB'}`, borderRadius: 9, fontSize: 14, outline: 'none', background: 'white', color: '#1E1E1E', transition: 'border-color 0.2s' }}
      />
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F3F4F6', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#1E1E1E', fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{description}</div>
      </div>
      <button onClick={() => onChange(!value)}
        style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: value ? '#FF7A00' : '#E5E7EB', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

export function Profile() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState('personal');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [restName, setRestName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [hours, setHours] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [initials, setInitials] = useState('MR');
  const [notifs, setNotifs] = useState({
    newOrder: true, orderReady: true, dailyReport: true,
    weeklyReport: false, lowStock: true, cancellations: true, sms: false, email: true,
  });

  useEffect(() => {
    api.getProfile().then(data => {
      setName(data.user.name);
      setEmail(data.user.email);
      setPhone(data.user.phone);
      setRole(data.user.role);
      setInitials(data.user.initials);
      if (data.restaurant) {
        setRestName(data.restaurant.name);
        setAddress(data.restaurant.address);
        setCapacity(String(data.restaurant.capacity));
        setHours(data.restaurant.hours);
        setCuisine(data.restaurant.cuisine);
      }
      if (data.notifications) setNotifs(data.notifications);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setError('');
    setSaved(false);
    try {
      if (activeTab === 'personal') await api.updatePersonal({ name, email, phone, role });
      else if (activeTab === 'restaurant') await api.updateRestaurant({ name: restName, address, capacity: parseInt(capacity), hours, cuisine });
      else if (activeTab === 'security') {
        if (newPw !== confirmPw) { setError('Las contraseñas no coinciden'); return; }
        if (newPw) await api.updatePassword({ currentPassword: currentPw, newPassword: newPw });
      }
      else if (activeTab === 'notifications') await api.updateNotifications(notifs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#1E1E1E', fontWeight: 700, fontSize: isMobile ? 20 : 24, marginBottom: 3 }}>Perfil de Usuario</h1>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>Gestiona tu cuenta y configuración</p>
        </div>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 7, background: saved ? '#22C55E' : '#FF7A00', color: 'white', border: 'none', borderRadius: 10, padding: isMobile ? '9px 12px' : '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'background 0.3s', boxShadow: `0 4px 12px ${saved ? 'rgba(34,197,94,0.3)' : 'rgba(255,122,0,0.3)'}`, flexShrink: 0 }}>
          {saved ? <><Check size={15} />{!isMobile && ' Guardado'}</> : <><Save size={15} />{!isMobile && ' Guardar'}</>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>

        {/* Sidebar / Tab bar */}
        <div style={{ width: isMobile ? '100%' : 210, flexShrink: 0 }}>
          {/* Avatar card */}
          <div style={{ background: 'white', borderRadius: 14, padding: 20, marginBottom: 14, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', display: isMobile ? 'flex' : 'block', alignItems: 'center', gap: isMobile ? 16 : 0 }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: isMobile ? 0 : 10 }}>
              <div style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: '50%', background: 'linear-gradient(135deg,#FF7A00,#FF4500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: isMobile ? 22 : 26, margin: isMobile ? 0 : '0 auto' }}>
                {initials}
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: '#1E1E1E', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <Camera size={10} />
              </button>
            </div>
            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
              <div style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14 }}>{name}</div>
              <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{role}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.08)', padding: '3px 9px', borderRadius: 20, marginTop: 6, border: '1px solid rgba(34,197,94,0.15)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ color: '#22C55E', fontSize: 11, fontWeight: 600 }}>Activo</span>
              </div>
            </div>
          </div>

          {/* Tabs — horizontal scroll on mobile, vertical on desktop */}
          {isMobile ? (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
              {tabs.map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', border: 'none', borderRadius: 20, cursor: 'pointer', background: activeTab === key ? '#FF7A00' : '#F3F4F6', color: activeTab === key ? 'white' : '#6B7280', fontWeight: activeTab === key ? 600 : 400, fontSize: 13, flexShrink: 0 }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
              {tabs.map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '12px 15px', border: 'none', background: activeTab === key ? 'rgba(255,122,0,0.06)' : 'transparent', color: activeTab === key ? '#FF7A00' : '#6B7280', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === key ? 600 : 400, fontSize: 14, borderLeft: `3px solid ${activeTab === key ? '#FF7A00' : 'transparent'}` }}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: isMobile ? 18 : 26, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#EF4444', fontSize: 13, fontWeight: 500 }}>{error}</div>
            )}

            {activeTab === 'personal' && (
              <div>
                <h2 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 16, marginBottom: 3 }}>Información personal</h2>
                <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 22 }}>Actualiza tus datos de contacto y acceso</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  <InputField label="Nombre completo" value={name} onChange={setName} />
                  <InputField label="Correo electrónico" value={email} onChange={setEmail} type="email" />
                  <InputField label="Teléfono" value={phone} onChange={setPhone} />
                  <InputField label="Rol / Cargo" value={role} onChange={setRole} />
                </div>
                <div style={{ marginTop: 18 }}>
                  <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Idioma preferido</label>
                  <select style={{ padding: '10px 13px', border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 14, color: '#1E1E1E', background: 'white', outline: 'none', width: isMobile ? '100%' : 'auto', minWidth: 200 }}>
                    <option>Español (México)</option>
                    <option>English (US)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'restaurant' && (
              <div>
                <h2 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 16, marginBottom: 3 }}>Mi restaurante</h2>
                <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 22 }}>Información general de tu establecimiento</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  <InputField label="Nombre del restaurante" value={restName} onChange={setRestName} />
                  <InputField label="Tipo de cocina" value={cuisine} onChange={setCuisine} />
                  <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                    <InputField label="Dirección" value={address} onChange={setAddress} />
                  </div>
                  <InputField label="Capacidad (personas)" value={capacity} onChange={setCapacity} type="number" />
                  <InputField label="Horario" value={hours} onChange={setHours} />
                </div>
                <div style={{ marginTop: 22, padding: '14px 18px', background: '#FFF7ED', borderRadius: 11, border: '1px solid #FDE68A' }}>
                  <div style={{ color: '#92400E', fontWeight: 600, fontSize: 13, marginBottom: 3 }}>Plan actual: Pro Edition</div>
                  <div style={{ color: '#B45309', fontSize: 13 }}>Renovación: 15 jun, 2026 · $1,299 MXN/mes</div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 16, marginBottom: 3 }}>Seguridad</h2>
                <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 22 }}>Cambia tu contraseña de acceso</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                  <InputField label="Contraseña actual" value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" />
                  <InputField label="Nueva contraseña" value={newPw} onChange={setNewPw} type="password" placeholder="••••••••" />
                  <InputField label="Confirmar contraseña" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="••••••••" />
                </div>
                {newPw && (
                  <div style={{ marginTop: 14, maxWidth: 400 }}>
                    <div style={{ color: '#6B7280', fontSize: 12, marginBottom: 6 }}>Fortaleza de la contraseña:</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: newPw.length >= i * 3 ? (i <= 2 ? '#EF4444' : i === 3 ? '#F59E0B' : '#22C55E') : '#E5E7EB' }} />
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #F3F4F6' }}>
                  <h3 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Sesiones activas</h3>
                  {[
                    { device: 'Chrome · Windows 11', location: 'Ciudad de México, MX', time: 'Ahora', current: true },
                    { device: 'Safari · iPhone 15', location: 'Ciudad de México, MX', time: 'Hace 2 horas', current: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#374151', fontSize: 13, fontWeight: 500 }}>{s.device}</div>
                        <div style={{ color: '#9CA3AF', fontSize: 12 }}>{s.location} · {s.time}</div>
                      </div>
                      {s.current
                        ? <span style={{ color: '#22C55E', fontSize: 12, fontWeight: 600, background: 'rgba(34,197,94,0.08)', padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>Actual</span>
                        : <button style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, background: 'rgba(239,68,68,0.08)', padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0 }}>Cerrar</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 style={{ color: '#1E1E1E', fontWeight: 600, fontSize: 16, marginBottom: 3 }}>Notificaciones</h2>
                <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20 }}>Configura qué alertas deseas recibir</p>
                <p style={{ color: '#374151', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Notificaciones del sistema</p>
                <ToggleRow label="Nuevo pedido" description="Alerta cuando entra un pedido" value={notifs.newOrder} onChange={v => setNotifs(p => ({ ...p, newOrder: v }))} />
                <ToggleRow label="Pedido listo" description="Cuando el pedido está listo para entregar" value={notifs.orderReady} onChange={v => setNotifs(p => ({ ...p, orderReady: v }))} />
                <ToggleRow label="Cancelaciones" description="Cuando se cancela un pedido" value={notifs.cancellations} onChange={v => setNotifs(p => ({ ...p, cancellations: v }))} />
                <ToggleRow label="Inventario bajo" description="Cuando un producto esté agotándose" value={notifs.lowStock} onChange={v => setNotifs(p => ({ ...p, lowStock: v }))} />
                <p style={{ color: '#374151', fontWeight: 600, fontSize: 13, marginTop: 18, marginBottom: 2 }}>Reportes automáticos</p>
                <ToggleRow label="Reporte diario" description="Resumen de ventas al cierre del día" value={notifs.dailyReport} onChange={v => setNotifs(p => ({ ...p, dailyReport: v }))} />
                <ToggleRow label="Reporte semanal" description="Análisis de rendimiento cada lunes" value={notifs.weeklyReport} onChange={v => setNotifs(p => ({ ...p, weeklyReport: v }))} />
                <p style={{ color: '#374151', fontWeight: 600, fontSize: 13, marginTop: 18, marginBottom: 2 }}>Canales de notificación</p>
                <ToggleRow label="Email" description="Recibir alertas en tu correo" value={notifs.email} onChange={v => setNotifs(p => ({ ...p, email: v }))} />
                <ToggleRow label="SMS" description="Alertas críticas vía mensaje de texto" value={notifs.sms} onChange={v => setNotifs(p => ({ ...p, sms: v }))} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
