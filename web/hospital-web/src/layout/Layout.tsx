// src/layout/Layout.tsx
import React, { FC, useState } from "react";
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

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };


  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header-inner">
  
          {/* IZQUIERDA: logo */}
          <div className="layout-left">
            <div className="layout-logo">PoliMed</div> 
          </div>

          {/* DERECHA: usuario + menu */}
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
                    <NavLink to="/home" className="">
                    <li>Inicio</li>
                    </NavLink>
                    <NavLink to="/perfil" className="">
                    <li>Mi perfil</li>
                    </NavLink>
                    <NavLink to="/citas/agendar" className="">
                    <li>Agendar cita</li>
                    </NavLink>
                  </nav>
                  <li onClick={handleLogout}>Cerrar sesion</li>
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

