import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UtensilsCrossed, Eye, EyeOff, Zap, ChefHat, BarChart2 } from 'lucide-react';
import { api } from '../../services/api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@restaurantos.com');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError("El usuario o contraseña no son correctos");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, text: 'Pedidos en tiempo real con actualizaciones instantáneas' },
    { icon: ChefHat, text: 'Vista de cocina Kanban para gestión eficiente' },
    { icon: BarChart2, text: 'Reportes y analíticas avanzadas del negocio' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,122,0,0.1) 0%,transparent 70%)', top: -300, right: -200, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,122,0,0.06) 0%,transparent 70%)', bottom: -200, left: -100, pointerEvents: 'none' }} />

      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ maxWidth: 480 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FF7A00', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(255,122,0,0.4)' }}>
              <UtensilsCrossed size={26} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>RestaurantOS</div>
              <div style={{ color: '#FF7A00', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>PRO EDITION</div>
            </div>
          </div>

          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 42, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Gestión inteligente<br />
            <span style={{ color: '#FF7A00' }}>para tu restaurante</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
            Controla pedidos, gestiona tu cocina y analiza el rendimiento de tu negocio desde un solo lugar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon size={16} color="#FF7A00" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.5, paddingTop: 6 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[['500+', 'Restaurantes'], ['1M+', 'Pedidos/mes'], ['99.9%', 'Uptime']].map(([val, label]) => (
              <div key={label}>
                <div style={{ color: '#FF7A00', fontWeight: 800, fontSize: 22 }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login card */}
      <div style={{ width: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: 40 }}>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: 26, marginBottom: 6 }}>Iniciar sesión</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 32 }}>Bienvenido de vuelta</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#EF4444', fontSize: 13, fontWeight: 500 }}>{error}</div>
            )}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={{
                  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${focused === 'email' ? '#FF7A00' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10, color: 'white', fontSize: 14, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  placeholder="••••••••"
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('pw')}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.07)',
                    border: `1px solid ${focused === 'pw' ? '#FF7A00' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10, color: 'white', fontSize: 14, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <a href="#" style={{ color: '#FF7A00', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>¿Olvidaste tu contraseña?</a>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '14px', background: '#FF7A00', border: 'none', borderRadius: 10,
              color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 20px rgba(255,122,0,0.35)', transition: 'all 0.2s',
            }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Iniciando sesión...
                </>
              ) : 'Ingresar al sistema'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(255,122,0,0.08)', borderRadius: 10, border: '1px solid rgba(255,122,0,0.15)' }}>
            <p style={{ color: '#FF7A00', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>CREDENCIALES DEMO</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>admin@restaurantos.com / demo1234</p>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', marginTop: 24 }}>
            © 2026 RestaurantOS · Todos los derechos reservados
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
