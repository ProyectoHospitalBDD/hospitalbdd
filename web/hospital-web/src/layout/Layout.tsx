import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext"; // Asegúrate de que esta ruta sea correcta
import "./Layout.css";

// Ruta del logo. Nota: En producción, usualmente se usa "/imagenes/..." si está en la carpeta public.
const LOGO_URL = "/imagenes/Logo_PoliMed.png"; 

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  // Lógica de perfil
  const handleMiPerfil = () => {
    closeMenu();
    if (!user) return;
    if (user.rol === "Doctor") navigate("/doctor/perfil");
    else if (user.rol === "Paciente") navigate("/perfil");
    else navigate("/home"); // O una ruta por defecto
  };

  // --- LÓGICA DE ROLES ---
  const userRole = user?.rol ? String(user.rol).toLowerCase() : "";
  
  const esDoctor = userRole.includes("doctor");
  const esPaciente = userRole.includes("paciente");
  const esRecepcionista = userRole.includes("recepcionista");
  const esFarmaceutico = userRole.includes("farmac"); // Cubre 'Farmacéutico' o 'Farmacia'
  const esEnfermera = userRole.includes("enfermera");
  const esAdmin = userRole.includes("admin");

  // Determinamos si estamos en la página de inicio
  const isHome = location.pathname === "/home" || location.pathname === "/";

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header-inner">
          
          {/* --- IZQUIERDA: LOGO + TABS DE ESCRITORIO --- */}
          <div className="layout-left">
            <div className="layout-logo" onClick={() => navigate('/home')} style={{cursor: 'pointer'}}>
              PoliMed
            </div>
            
            {/* Tabs SOLO para Doctor (Visible en escritorio) */}
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

            {/* Tabs SOLO para Recepcionista (Visible en escritorio) */}
            {esRecepcionista && (
              <nav className="layout-tabs">
                <NavLink
                  to="/recep/cancelaciones"
                  onClick={closeMenu}
                  className={({ isActive }) => `layout-tab ${isActive ? "layout-tab--active" : ""}`}
                >
                  Administrar citas
                </NavLink>
                <NavLink
                  to="/recep/empleados"
                  onClick={closeMenu}
                  className={({ isActive }) => `layout-tab ${isActive ? "layout-tab--active" : ""}`}
                >
                  Administrar empleados
                </NavLink>
              </nav>
            )}
          </div>

          {/* --- DERECHA: USUARIO + HAMBURGUESA --- */}
          <div className="layout-user">
            {user ? (
                <span className="layout-user-name" onClick={handleMiPerfil} style={{cursor: 'pointer'}}>
                    {user.nombreCompleto}
                </span>
            ) : (
                <span className="layout-user-name" style={{fontStyle:'italic', fontWeight:'normal'}}>
                  Invitado
                </span>
            )}
            
            <div className="hamburger-menu">
              <div className="hamburger-icon" onClick={toggleMenu}>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
            </div>

            {/* --- MENÚ DESPLEGABLE (MÓVIL Y PERFIL) --- */}
            {isOpen && (
              <div className="menu">
                <ul>
                    {/* Opción Común: Inicio */}
                    <NavLink to="/home" onClick={closeMenu}>
                      <li>Inicio</li>
                    </NavLink>
                    
                    {/* Opción Común: Mi Perfil (Si hay usuario) */}
                    {user && (
                        <li onClick={handleMiPerfil} style={{ cursor: "pointer" }}>Mi perfil</li>
                    )}
                    
                    {/* --- PACIENTES E INVITADOS --- */}
                    {(!userRole || esPaciente) && (
                        <>
                            <NavLink to="/tienda" onClick={closeMenu}><li>🛒 Tienda</li></NavLink>
                            <NavLink to="/citas/agendar" onClick={closeMenu}><li>📅 Agendar cita</li></NavLink>
                        </>
                    )}

                    {/* --- DOCTOR (Opciones extra en menú móvil) --- */}
                    {esDoctor && (
                        <>
                           <NavLink to="/medico/agenda" onClick={closeMenu}><li>👨‍⚕️ Mi Agenda</li></NavLink>
                           <NavLink to="/doctor/citas" onClick={closeMenu}><li>Mis citas</li></NavLink>
                        </>
                    )}

                    {/* --- FARMACÉUTICO / ADMIN --- */}
                    {(esFarmaceutico || esAdmin) && (
                        <>
                            <NavLink to="/tienda" onClick={closeMenu}><li>🛒 Tienda</li></NavLink>
                            <NavLink to="/farmacia" onClick={closeMenu}><li>🏥 Farmacia (Caja)</li></NavLink>
                            <NavLink to="/inventario" onClick={closeMenu}><li>📦 Inventario (Gestión)</li></NavLink> 
                        </>
                    )}
                    
                    {/* --- ENFERMERÍA --- */}
                    {(esEnfermera || esAdmin) && (
                        <NavLink to="/farmacia" onClick={closeMenu}><li>🏥 Farmacia (Caja)</li></NavLink>
                    )}

                    {/* --- RECEPCIÓN --- */}
                    {(esRecepcionista || esAdmin) && (
                        <NavLink to="/recepcion" onClick={closeMenu}><li>📋 Recepción</li></NavLink>
                    )}
                  
                  <hr style={{margin: '5px 0', border: '0', borderTop: '1px solid #eee'}}/>
                  
                  {/* --- LOGIN / LOGOUT --- */}
                  {user ? (
                      <li onClick={handleLogout} style={{color: '#d63031', cursor: 'pointer'}}>
                        Cerrar sesión
                      </li>
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
        {/* HERO SECTION (Solo se muestra en Home) */}
        {isHome ? (
            <div className="home-welcome-section">
                <div className="home-text">
                    <h1>Hospital de Especialidades <span style={{color: '#00c897'}}>PoliMed</span></h1>
                    <p>
                        Hospital PoliMed somos una institución dedicada al diagnóstico y seguimiento integral de diversos padecimientos. Contamos con más de 15 especialidades médicas y un equipo de más de 50 doctores altamente capacitados, además de servicio de farmacia y aplicación de tratamientos, estamos comprometidos con brindar atención de calidad y confianza a nuestros pacientes.
                    </p>
                    
                    {(!userRole || esPaciente) && (
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
                    <img src={LOGO_URL} alt="Logo PoliMed Grande" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
            </div>
        ) : (
            /* Renderiza las rutas hijas aquí si NO es Home */
            <Outlet />
        )}
      </main>
    </div>
  );
}

export default Layout;