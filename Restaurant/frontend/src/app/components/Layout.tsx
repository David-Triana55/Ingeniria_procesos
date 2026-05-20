import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  BarChart2,
  User,
  Bell,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";

const navItems = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  { path: "/orders", icon: ShoppingBag, label: "Pedidos" },
  { path: "/kitchen", icon: ChefHat, label: "Cocina" },
  { path: "/menu", icon: UtensilsCrossed, label: "Menú" },
  { path: "/reports", icon: BarChart2, label: "Reportes" },
  { path: "/profile", icon: User, label: "Perfil" },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      style={{
        color: "#374151",
        fontSize: "13px",
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {time.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

export function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Usuario';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const [open, setOpen] = useState(windowWidth >= 1024);

  // Auto-collapse on resize
  useEffect(() => {
    if (isMobile) setOpen(false);
    else if (!isTablet) setOpen(true);
  }, [isMobile, isTablet]);

  const handleNavClick = () => {
    if (isMobile) setOpen(false);
  };

  const sidebarW = isMobile ? 240 : open ? 240 : 72;
  const mainML = isMobile ? 0 : open ? 240 : 72;
  const showLabel = open || isMobile;

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "#F5F5F5",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: sidebarW,
          background: "#1E1E1E",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflow: "hidden",
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
          transition: isMobile
            ? "transform 0.25s ease"
            : "width 0.25s ease",
          transform: isMobile
            ? open
              ? "translateX(0)"
              : "translateX(-100%)"
            : "none",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            minHeight: 72,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#FF7A00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(255,122,0,0.4)",
            }}
          >
            <UtensilsCrossed size={20} color="white" />
          </div>
          {showLabel && (
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                  whiteSpace: "nowrap",
                }}
              >
                RestaurantOS
              </div>
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
                display: "flex",
                padding: 4,
                marginLeft: "auto",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 8,
                color: isActive
                  ? "#FF7A00"
                  : "rgba(255,255,255,0.5)",
                background: isActive
                  ? "rgba(255,122,0,0.1)"
                  : "transparent",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                whiteSpace: "nowrap",
                borderLeft: `3px solid ${isActive ? "#FF7A00" : "transparent"}`,
                transition: "all 0.15s ease",
              })}
            >
              <Icon size={19} style={{ flexShrink: 0 }} />
              {showLabel && label}
            </NavLink>
          ))}
        </nav>

        {/* Live indicator */}
        {showLabel && (
          <div
            style={{
              margin: "0 12px 12px",
              padding: "10px 12px",
              background: "rgba(34,197,94,0.08)",
              borderRadius: 8,
              border: "1px solid rgba(34,197,94,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 6px #22C55E",
                }}
              />
              <span
                style={{
                  color: "#22C55E",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Sistema activo
              </span>
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 11,
                marginTop: 3,
              }}
            >
              Tiempo real activado
            </div>
          </div>
        )}

        {/* User */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#FF7A00,#FF4500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "white",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {userInitials}
          </div>
          {showLabel && (
            <>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 11,
                  }}
                >
                  {user.role || 'Administrador'}
                </div>
              </div>
              <button
                onClick={() => navigate("/login")}
                style={{
                  color: "rgba(255,255,255,0.3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <div
        style={{
          marginLeft: mainML,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: isMobile
            ? "none"
            : "margin-left 0.25s ease",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            padding: `0 ${isMobile ? 12 : 20}px`,
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 8 : 14,
            position: "sticky",
            top: 0,
            zIndex: 50,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              padding: 6,
              borderRadius: 6,
              display: "flex",
              flexShrink: 0,
            }}
          >
            {open && !isMobile ? (
              <X size={18} />
            ) : (
              <MenuIcon size={18} />
            )}
          </button>

          {/* Mobile logo */}
          {isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "#FF7A00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UtensilsCrossed size={13} color="white" />
              </div>
              <span
                style={{
                  color: "#1E1E1E",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                RestaurantOS
              </span>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Live badge — hidden on mobile */}
          {!isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(34,197,94,0.08)",
                padding: "5px 12px",
                borderRadius: 20,
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22C55E",
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  color: "#22C55E",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                EN VIVO
              </span>
            </div>
          )}

          {/* Notification */}
          <button
            style={{
              position: "relative",
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              padding: "7px 8px",
              borderRadius: 8,
              display: "flex",
              color: "#6B7280",
            }}
          >
            <Bell size={17} />
            <span
              style={{
                position: "absolute",
                top: 3,
                right: 3,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#FF7A00",
                color: "white",
                fontSize: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              3
            </span>
          </button>

          {!isMobile && <LiveClock />}

          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#FF7A00,#FF4500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {userInitials}
          </div>
        </header>

        <main
          style={{
            flex: 1,
            padding: isMobile ? 14 : 24,
            minWidth: 0,
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}