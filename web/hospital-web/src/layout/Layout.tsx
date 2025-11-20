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
    <div className="app-layout">
      <header className="app-header">
        <div className="logo">Hospital ESCOM</div>

        <nav className="nav-links">
          <NavLink to="/home">Inicio</NavLink>
          <NavLink to="/citas/agendar">Agendar cita</NavLink>
        </nav>

        <div className="user-area">
          {user && <span className="user-name">{user.nombreCompleto}</span>}
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
