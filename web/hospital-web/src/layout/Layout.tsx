// src/layout/Layout.tsx
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext";
import "./Layout.css";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  const handleMiPerfil = () => {
    closeMenu();
    if (!user) return;

    if (user.rol === "Doctor") navigate("/doctor/perfil");
    else if (user.rol === "Paciente") navigate("/perfil");
    else navigate("/home"); // fallback por si luego agregas roles
  };

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header-inner">
          <div className="layout-left">
            <div className="layout-logo">PoliMed</div>
          </div>

          <div className="layout-user">
            {user && <span className="layout-user-name">{user.nombreCompleto}</span>}

            <div className="hamburger-menu">
              <div className="hamburger-icon" onClick={toggleMenu}>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
            </div>

            {isOpen && (
              <div className="menu">
                <ul>
                  <nav>
                    <NavLink to="/home" onClick={closeMenu}>
                      <li>Inicio</li>
                    </NavLink>

                    <li onClick={handleMiPerfil} style={{ cursor: "pointer" }}>
                      Mi perfil
                    </li>

                    <NavLink to="/citas/agendar" onClick={closeMenu}>
                      <li>Agendar cita</li>
                    </NavLink>
                  </nav>

                  <li onClick={handleLogout} style={{ cursor: "pointer" }}>
                    Cerrar sesion
                  </li>
                </ul>
              </div>
            )}
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
