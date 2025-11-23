// src/layout/Layout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext";
import "./Layout.css";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header-inner">
  
          {/* IZQUIERDA: logo + menú */}
          <div className="layout-left">
            <div className="layout-logo">Hospital ESCOM</div>

            <nav className="layout-nav">
              <NavLink to="/home" className="layout-nav-link">
                Inicio
              </NavLink>
              <NavLink to="/citas/agendar" className="layout-nav-link">
                Agendar cita
              </NavLink>
            </nav>
          </div>

          {/* DERECHA: usuario + botón */}
          <div className="layout-user">
            {user && <span className="layout-user-name">{user.nombreCompleto}</span>}
            <button className="layout-logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>

        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
