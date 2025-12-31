// src/layout/Layout.tsx
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
// Ajuste de ruta: sube un nivel para encontrar 'lib'
import { useAuth } from "../lib/auth/AuthContext";
import "./Layout.css";

const LOGO_URL = "../public/imagenes/Logo_PoliMed.png";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  const userRole = user?.rol;
  const role = userRole ? String(userRole).toLowerCase() : "";

  // Determinamos si estamos en la página de inicio para mostrar el contenido de bienvenida
  const isHome = location.pathname === "/home" || location.pathname === "/";

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header-inner">
          {/* Logo Texto Header */}
          <div className="layout-left">
            <div className="layout-logo">PoliMed</div> 
          </div>

          {/* Usuario + Menú */}
          <div className="layout-user">
            {user ? (
                <span className="layout-user-name">{user.nombreCompleto}</span>
            ) : (
                <span className="layout-user-name" style={{fontStyle:'italic', fontWeight:'normal'}}>Invitado</span>
            )}
            
            <div className="hamburger-menu">
              <div className="hamburger-icon" onClick={toggleMenu}>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
            </div>

            {/* Menú Desplegable */}
            {isOpen && (
              <div className="menu">
                <ul>
                  <nav>
                    <NavLink to="/home" onClick={() => setIsOpen(false)}><li>Inicio</li></NavLink>
                    
                    {(!role || role.includes("paciente")) && (
                        <>
                            <NavLink to="/tienda" onClick={() => setIsOpen(false)}><li>🛒 Tienda</li></NavLink>
                            <NavLink to="/citas/agendar" onClick={() => setIsOpen(false)}><li>📅 Agendar cita</li></NavLink>
                        </>
                    )}

                    {(role.includes("farmac") || role.includes("admin")) && (
                        <>
                            <NavLink to="/farmacia" onClick={() => setIsOpen(false)}><li>🏥 Farmacia (Caja)</li></NavLink>
                            <NavLink to="/inventario" onClick={() => setIsOpen(false)}><li>📦 Inventario (Gestión)</li></NavLink> 
                        </>
                    )}
                    
                    {(role.includes("enfermera") || role.includes("admin")) && (
                        <NavLink to="/farmacia" onClick={() => setIsOpen(false)}><li>🏥 Farmacia (Caja)</li></NavLink>
                    )}

                    {(role.includes("recepcionista") || role.includes("admin")) && (
                        <NavLink to="/recepcion" onClick={() => setIsOpen(false)}><li>📋 Recepción</li></NavLink>
                    )}

                    {(role.includes("doctor") || role.includes("medico")) && (
                        <NavLink to="/medico/agenda" onClick={() => setIsOpen(false)}><li>👨‍⚕️ Mi Agenda</li></NavLink>
                    )}
                  </nav>
                  
                  <hr style={{margin: '5px 0', border: '0', borderTop: '1px solid #eee'}}/>
                  
                  {user ? (
                      <li onClick={handleLogout} style={{color: '#d63031'}}>Cerrar sesión</li>
                  ) : (
                      <NavLink to="/login" onClick={() => setIsOpen(false)}>
                          <li style={{color: '#27ae60', fontWeight:'bold'}}>Iniciar Sesión</li>
                      </NavLink>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="layout-main">
        {/* LÓGICA DE VISUALIZACIÓN: Si es HOME, mostramos la bienvenida. Si no, mostramos la ruta hija (Outlet) */}
        {isHome ? (
            <div className="home-welcome-section">
                {/* Texto a la Izquierda */}
                <div className="home-text">
                    <h1>Hospital de Especialidades <span style={{color: '#00c897'}}>PoliMed</span></h1>
                    <p>
                       Hospital PoliMed somos una institución dedicada al diagnóstico y seguimiento integral de diversos padecimientos. Contamos con más de 15 especialidades médicas y un equipo de más de 50 doctores altamente capacitados, además de servicio de farmacia y aplicación de tratamientos, estamos comprometidos con brindar atención de calidad y confianza a nuestros pacientes.
                    </p>
                    
                    {/* Botones exclusivos para pacientes en el Home */}
                    {(!role || role.includes("paciente")) && (
                        <div className="home-cta-buttons">
                            <button className="cta-btn primary" onClick={() => navigate('/citas/agendar')}>
                                📅 Agendar Cita
                            </button>
                            <button className="cta-btn secondary" onClick={() => navigate('/tienda')}>
                                🛒 Ir a la Tienda
                            </button>
                        </div>
                    )}
                </div>

                {/* Logo a la Derecha */}
                <div className="home-logo-visual">
                    <img src={LOGO_URL} alt="Logo PoliMed Grande" />
                </div>
            </div>
        ) : (
            <Outlet />
        )}
      </main>
    </div>
  );
}

export default Layout;

/*Aqui  quito cosas*/ 