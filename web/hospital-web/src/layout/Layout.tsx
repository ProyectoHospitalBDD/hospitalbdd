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
    else navigate("/home");
  };

  const esDoctor = user?.rol === "Doctor";
  const esPaciente = user?.rol === "Paciente";

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header-inner">
          <div className="layout-left">
            <div className="layout-logo">PoliMed</div>

            {/* Tabs SOLO para Doctor */}
            {esDoctor && (
              <nav className="layout-tabs">
                <NavLink
                  to="/doctor/citas"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `layout-tab ${isActive ? "layout-tab--active" : ""}`
                  }
                >
                  Mis citas
                </NavLink>

                <NavLink
                  to="/doctor/atender"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `layout-tab ${isActive ? "layout-tab--active" : ""}`
                  }
                >
                  Atender cita
                </NavLink>
              </nav>
            )}
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

<<<<<<< Updated upstream
                    {/* Paciente */}
                    {esPaciente && (
                      <NavLink to="/citas/agendar" onClick={closeMenu}>
                        <li>Agendar cita</li>
=======
                    {/* --- FARMACÉUTICO / ADMIN --- */}
                    {(role.includes("farmac") || role.includes("admin")) && (
                        <>
                            <NavLink to="/tienda" onClick={closeMenu}><li>🛒 Tienda</li></NavLink>
                            <NavLink to="/farmacia" onClick={closeMenu}><li>🏥 Farmacia (Caja)</li></NavLink>
                            <NavLink to="/inventario" onClick={closeMenu}><li>📦 Inventario (Gestión)</li></NavLink> 
                        </>
                    )}
                    
                    {/* --- ENFERMERÍA --- */}
                    {(role.includes("enfermera") || role.includes("admin")) && (
                        <NavLink to="/farmacia" onClick={closeMenu}><li>🏥 Farmacia (Caja)</li></NavLink>
                    )}

                    {/* --- RECEPCIÓN --- */}
                    {(role.includes("recepcionista") || role.includes("admin")) && (
                        <NavLink to="/recepcion" onClick={closeMenu}><li>📋 Recepción</li></NavLink>
                    )}

                  </nav>
                  
                  <hr style={{margin: '5px 0', border: '0', borderTop: '1px solid #eee'}}/>
                  
                  {user ? (
                      <li onClick={handleLogout} style={{color: '#d63031'}}>Cerrar sesión</li>
                  ) : (
                      <NavLink to="/login" onClick={closeMenu}>
                          <li style={{color: '#27ae60', fontWeight:'bold'}}>Iniciar Sesión</li>
>>>>>>> Stashed changes
                      </NavLink>
                    )}

                    {/* Doctor */}
                    {esDoctor && (
                      <>
                        <NavLink to="/doctor/citas" onClick={closeMenu}>
                          <li>Mis citas</li>
                        </NavLink>
                        <NavLink to="/doctor/atender" onClick={closeMenu}>
                          <li>Atender cita</li>
                        </NavLink>
                      </>
                    )}
                  </nav>

                  <li onClick={handleLogout} style={{ cursor: "pointer" }}>
                    Cerrar sesión
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
