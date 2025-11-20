// src/layout/Layout.tsx
import { Link, NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header-inner">
          <Link to="/" className="layout-logo">
            Hospital <span>ESCOM</span>
          </Link>

          <nav className="layout-nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                "layout-nav-link" + (isActive ? " active" : "")
              }
            >
              Inicio
            </NavLink>

            <NavLink
              to="/citas/agendar"
              className={({ isActive }) =>
                "layout-nav-link" + (isActive ? " active" : "")
              }
            >
              Agendar cita
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                "layout-nav-link" + (isActive ? " active" : "")
              }
            >
              Iniciar sesión
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="layout-main">
        {/* Aquí se dibuja la página actual */}
        <Outlet />
      </main>
    </div>
  );
}
