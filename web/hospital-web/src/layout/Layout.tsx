import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext";
import "./Layout.css";

// Ruta del logo (asegúrate de que esté en public/imagenes/)
const LOGO_URL = "../public/imagenes/Logo_PoliMed.png";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Lógica de perfil que trajo tu compañero
  const handleMiPerfil = () => {
    closeMenu();
    if (!user) return;
    if (user.rol === "Doctor") navigate("/doctor/perfil");
    else if (user.rol === "Paciente") navigate("/perfil");
    else navigate("/home");
  };

  const userRole = user?.rol;
  const role = userRole ? String(userRole).toLowerCase() : "";

  const esDoctor = role.includes("doctor");
  const esPaciente = role.includes("paciente");
  const esRecepcionista = user?.rol === "Recepcionista"
  // Determinamos si estamos en la página de inicio
  const isHome = location.pathname === "/home" || location.pathname === "/";
  



  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header-inner">
          
          {/* Logo y Tabs (Fusión) */}
          <div className="layout-left">
            <div className="layout-logo">PoliMed</div> 
            
            {/* Tabs SOLO para Doctor (Aporte de tu compañero) */}
            {esDoctor && (
              <nav className="layout-tabs">
                <NavLink
                  to="/doctor/citas"
                  onClick={closeMenu}
                  className={({ isActive }) => `layout-tab ${isActive ? "layout-tab--active" : ""}`}
                >
                  Mis citas
                </NavLink>
                <NavLink
                  to="/doctor/atender"
                  onClick={closeMenu}
                  className={({ isActive }) => `layout-tab ${isActive ? "layout-tab--active" : ""}`}
                >
                  Atender cita
                </NavLink>
              </nav>
            )}

            {/* Tabs SOLO para Recepcionista */}
            {esRecepcionista && (
              <nav className="layout-tabs">
                <NavLink
                  to="/recep/cancelaciones"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `layout-tab ${isActive ? "layout-tab--active" : ""}`
                  }
                >
                  Cancelaciones
                </NavLink>
              </nav>
            )}
          </div>

          {/* Usuario + Menú */}
          <div className="layout-user">
            {user ? (
                <span className="layout-user-name" onClick={handleMiPerfil} style={{cursor: 'pointer'}}>
                    {user.nombreCompleto}
                </span>
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

            {/* Menú Desplegable (Fusión de opciones) */}
            {isOpen && (
              <div className="menu">
                <ul>
                  <nav>
                    <NavLink to="/home" onClick={closeMenu}><li>Inicio</li></NavLink>
                    
                    {user && (
                        <li onClick={handleMiPerfil}>Mi perfil</li>
                    )}
                    
                    {/* --- PACIENTES E INVITADOS --- */}
                    {(!role || esPaciente) && (
                        <>
                            <NavLink to="/tienda" onClick={closeMenu}><li>🛒 Tienda</li></NavLink>
                            <NavLink to="/citas/agendar" onClick={closeMenu}><li>📅 Agendar cita</li></NavLink>
                        </>
                    )}

                    {/* --- DOCTOR (Opciones extra en menú móvil) --- */}
                    {esDoctor && (
                         <>
                            <NavLink to="/medico/agenda" onClick={closeMenu}><li>👨‍⚕️ Mi Agenda</li></NavLink>
                            {/* Los tabs de arriba también disponibles aquí por si acaso */}
                            <NavLink to="/doctor/citas" onClick={closeMenu}><li>Mis citas</li></NavLink>
                         </>
                    )}

                    {/* --- FARMACÉUTICO / ADMIN --- */}
                    {(role.includes("farmac") || role.includes("admin")) && (
                        <>
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
                      </NavLink>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="layout-main">
        {/* HERO SECTION */}
        {isHome ? (
            <div className="home-welcome-section">
                <div className="home-text">
                    <h1>Hospital de Especialidades <span style={{color: '#00c897'}}>PoliMed</span></h1>
                    <p>
                        Hospital PoliMed somos una institución dedicada al diagnóstico y seguimiento integral de diversos padecimientos. Contamos con más de 15 especialidades médicas y un equipo de más de 50 doctores altamente capacitados, además de servicio de farmacia y aplicación de tratamientos, estamos comprometidos con brindar atención de calidad y confianza a nuestros pacientes.
                    </p>
                    
                    {(!role || esPaciente) && (
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