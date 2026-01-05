import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import PrivateRoute from "./PrivateRoute";

// Contextos
import { AuthProvider } from "../lib/auth/AuthContext";
import { CartProvider } from "../pages/Carrito/CartContext";
import { CartFisicoProvider } from "../pages/CarroFisico/CartContextFisico";

// Auth Pages
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Register/RegisterPage";

// Paciente / General
import AgendarCitaPage from "../pages/Citas/AgendarCitaPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import Comprobante from "../pages/Comprobante/Comprobante";

// Tienda / Farmacia (Web Paciente)
import Tienda from "../pages/Tienda/Tienda";
import Carrito from "../pages/Carrito/Carrito";

// --- MÓDULOS DE FARMACIA (Punto de Venta Físico y Gestión) ---
import CobroTicket from "../pages/Farmacia/CobroTicket";
import Inventario from "../pages/Inventario/Productos";
import PuntoVenta from "../pages/CarroFisico/Cart";

// Doctor
import DoctorPerfilPage from "../pages/Doctor/DoctorPerfilPage";
import DoctorMisCitasPage from "../pages/Doctor/Citas/DoctorMisCitasPage";
import DoctorAtenderCitaPage from "../pages/Doctor/Citas/DoctorAtenderCitaPage";

//Farmaceutico
import FarmaceuticoPerfilPage from "../pages/Farmaceutico/FarmaceuticoPerfilPage";

//Recepcionista
import RecepcionistaPerfilPage from "../pages/Recepcionista/RecepcionistaPerfilPage";

// Receta (del compa)
import Receta from "../pages/Receta/RecetaM";
import ComprobanteReceta from "../pages/Receta/ComprobanteReceta";

// Recepción (dev)
import RecepCancelacionesPage from "../pages/Recep/Cancelaciones/RecepCancelacionesPage";
import RecepEmpleadosCreatePage from "../pages/Recep/Empleados/RecepEmpleadosCreatePage";
import RecepEmpleadosListPage from "../pages/Recep/Empleados/RecepEmpleadosListPage";
import BitacoraPage from "../pages/Recep/Bitacora/BitacoraPage";

import RecepAsignarHorarioPage from "../pages/Recep/Empleados/AsignarHorarioEmpleadoPage"; 

export function AppRouter() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartFisicoProvider>
          <Routes>
            {/* ---------- PÚBLICA ---------- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ---------- CON LAYOUT ---------- */}
            <Route element={<Layout />}>
              {/* Home / Default - CORRECCIÓN: Le quité el PrivateRoute para que el invitado vea la bienvenida */}
              <Route
                path="/home"
                element={<></>}
              />

              {/* --- Tienda y Carrito (Web) - CORRECCIÓN: Públicos para invitados --- */}
              <Route path="/tienda" element={<Tienda />} />
              <Route path="/carrito" element={<Carrito />} />

              {/* --- Rutas Paciente (Protegidas) --- */}
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

              {/* --- Farmaceutico --- */}
              <Route
                path="/farmaceutico/perfil"
                element={
                  <PrivateRoute>
                    <FarmaceuticoPerfilPage />
                  </PrivateRoute>
                }
              />

              {/* --- Recepcionista ---*/}
              <Route
                path="/recepcionista/perfil"
                element={
                  <PrivateRoute>
                    <RecepcionistaPerfilPage />
                  </PrivateRoute>
                }
              />

                <Route
                  path="/recep/bitacora"
                  element={
                    <PrivateRoute>
                      <BitacoraPage />
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

              {/* --- Receta médica --- */}
              <Route
                path="/receta"
                element={
                  <PrivateRoute>
                    <Receta />
                  </PrivateRoute>
                }
              />
              <Route
                path="/comprobante-receta"
                element={
                  <PrivateRoute>
                    <ComprobanteReceta />
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
              
              <Route
                path="/recep/empleados/asignar-horario"
                element={
                  <PrivateRoute>
                    <RecepAsignarHorarioPage />
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