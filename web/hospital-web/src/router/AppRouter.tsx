import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import PrivateRoute from "./PrivateRoute";

// --- IMPORTANTE: AuthProvider para el contexto de usuario ---
// Esto es vital para que useAuth() funcione dentro del Layout
import { AuthProvider } from "../lib/auth/AuthContext"; 

// Auth Pages
import LoginPage from "../pages/Auth/LoginPage";

// Paciente / General
import AgendarCitaPage from "../pages/Citas/AgendarCitaPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import Comprobante from "../pages/Comprobante/Comprobante";

// Tienda / Farmacia (Web Paciente)
import Tienda from "../pages/Tienda/Tienda";
import Carrito from "../pages/Carrito/Carrito";
// Contexto Global (Carrito Web del Paciente)
import { CartProvider } from "../pages/Carrito/CartContext";

// --- MÓDULOS DE FARMACIA (Punto de Venta Físico y Gestión) ---
import CobroTicket from "../pages/Farmacia/CobroTicket";
import Inventario from "../pages/Inventario/Productos";
import PuntoVenta from "../pages/CarroFisico/Cart"; 
import { CartFisicoProvider } from "../pages/CarroFisico/CartContextFisico";

// Doctor
import DoctorPerfilPage from "../pages/Doctor/DoctorPerfilPage";
import DoctorMisCitasPage from "../pages/Doctor/Citas/DoctorMisCitasPage";
import DoctorAtenderCitaPage from "../pages/Doctor/Citas/DoctorAtenderCitaPage";

// Recepción
import RecepCancelacionesPage from "../pages/Recep/Cancelaciones/RecepCancelacionesPage";
import RecepEmpleadosCreatePage from "../pages/Recep/Empleados/RecepEmpleadosCreatePage";
import RecepEmpleadosListPage from "../pages/Recep/Empleados/RecepEmpleadosListPage";

export function AppRouter() {
  return (
    /* 1. Proveedor de Autenticación (Debe ser el padre de todos) */
    <AuthProvider>
      {/* 2. Proveedor del Carrito Web (Paciente) */}
      <CartProvider>
        {/* 3. Proveedor del Carrito Físico (Farmacia/Punto de Venta) */}
        <CartFisicoProvider>
          
          <Routes>
            {/* ---------- PÚBLICA ---------- */}
            <Route path="/login" element={<LoginPage />} />

            {/* ---------- CON LAYOUT (Rutas Protegidas) ---------- */}
            <Route element={<Layout />}>
              
              {/* Home / Default */}
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <></> {/* Dashboard o Home Page vacía por ahora */}
                  </PrivateRoute>
                }
              />

              {/* --- Rutas Paciente --- */}
              <Route
                path="/citas/agendar"
                element={
                  <PrivateRoute>
                    <AgendarCitaPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/comprobante/Comprobar"
                element={
                  <PrivateRoute>
                    <Comprobante />
                  </PrivateRoute>
                }
              />

              {/* --- Tienda y Carrito (Web) --- */}
              <Route
                path="/tienda"
                element={
                  <PrivateRoute>
                    <Tienda />
                  </PrivateRoute>
                }
              />
              <Route
                path="/carrito"
                element={
                  <PrivateRoute>
                    <Carrito />
                  </PrivateRoute>
                }
              />

              {/* --- Farmacia / Compra Física / Inventario --- */}
              <Route
                path="/farmacia/punto-venta"
                element={
                  <PrivateRoute>
                    <PuntoVenta />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmacia"
                element={
                  <PrivateRoute>
                    <CobroTicket />
                  </PrivateRoute>
                }
              />
              <Route
                path="/inventario"
                element={
                  <PrivateRoute>
                    <Inventario />
                  </PrivateRoute>
                }
              />

              {/* --- Doctor --- */}
              <Route
                path="/doctor/perfil"
                element={
                  <PrivateRoute>
                    <DoctorPerfilPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/citas"
                element={
                  <PrivateRoute>
                    <DoctorMisCitasPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/atender"
                element={
                  <PrivateRoute>
                    <DoctorAtenderCitaPage />
                  </PrivateRoute>
                }
              />

              {/* --- Recepción --- */}
              <Route
                path="/recep/cancelaciones"
                element={
                  <PrivateRoute>
                    <RecepCancelacionesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recep/empleados"
                element={
                  <PrivateRoute>
                    <RecepEmpleadosListPage />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/recep/empleados/crear" 
                element={
                  <PrivateRoute>
                    <RecepEmpleadosCreatePage />
                  </PrivateRoute>
                } 
              />

            </Route>

            {/* Redirecciones */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>

        </CartFisicoProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default AppRouter;