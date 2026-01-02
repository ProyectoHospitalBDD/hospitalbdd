// src/router/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import HomePage from "../pages/HomePage";
import AgendarCitaPage from "../pages/Citas/AgendarCitaPage";
import LoginPage from "../pages/Auth/LoginPage";
import PrivateRoute from "./PrivateRoute";
import Comprobante from "../pages/Comprobante/Comprobante";
<<<<<<< Updated upstream
import ProfilePage from "../pages/Profile/ProfilePage";
=======

// Tienda / Farmacia (Web Paciente)
import Tienda from "../pages/Tienda/Tienda";
import Carrito from "../pages/Carrito/Carrito";
// Contexto Global (Carrito Web del Paciente)
import { CartProvider } from "../pages/Carrito/CartContext";

// --- MÓDULOS DE FARMACIA ---
import CobroTicket from "../pages/Farmacia/CobroTicket";
import Inventario from "../pages/Inventario/Productos";
import PuntoVenta from "../pages/CarroFisico/Cart"; 
import { CartFisicoProvider } from "../pages/CarroFisico/CartContextFisico";

// Doctor
>>>>>>> Stashed changes
import DoctorPerfilPage from "../pages/Doctor/DoctorPerfilPage";
import DoctorMisCitasPage from "../pages/Doctor/Citas/DoctorMisCitasPage";
import DoctorAtenderCitaPage from "../pages/Doctor/Citas/DoctorAtenderCitaPage";

<<<<<<< Updated upstream
export function AppRouter() {
  return (
    <Routes>
      {/* Ruta de login (siempre pública) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas que usan el layout */}
      <Route element={<Layout />}>
        {/* Home protegida */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />

        {/* Agendar cita protegida */}
        <Route
          path="/citas/agendar"
          element={
            <PrivateRoute>
              <AgendarCitaPage />
            </PrivateRoute>
          }
        />

        {/*Comprobante protegido*/}
        <Route
          path="/comprobante/Comprobar"
          element={
            <PrivateRoute>
              <Comprobante/>
            </PrivateRoute>
          }
        />

        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/doctor/perfil" element={<DoctorPerfilPage />} />
        <Route path="/doctor/citas" element={<DoctorMisCitasPage />} />
        <Route path="/doctor/atender" element={<DoctorAtenderCitaPage />} />



      </Route>

     

      

      {/* Redirecciones */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
=======
// Recepción
import RecepCancelacionesPage from "../pages/Recep/Cancelaciones/RecepCancelacionesPage";
import RecepEmpleadosCreatePage from "../pages/Recep/Empleados/RecepEmpleadosCreatePage";
import RecepEmpleadosListPage from "../pages/Recep/Empleados/RecepEmpleadosListPage";

export function AppRouter() {
  return (
    /* 1. Proveedor del Carrito Web (Global) */
    <CartProvider>
      {/* 2. Proveedor del Carrito Físico (AHORA ES GLOBAL TAMBIÉN) 
          Esto soluciona el error en la Tienda. */
      }
      <CartFisicoProvider>
        <Routes>
          {/* ---------- PÚBLICA ---------- */}
          <Route path="/login" element={<LoginPage />} />

          {/* ---------- CON LAYOUT ---------- */}
          <Route element={<Layout />}>
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <></>
                </PrivateRoute>
              }
            />

            {/* Rutas Paciente */}
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

            {/* Tienda y Carrito */}
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

            {/* Farmacia */}
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

            {/* Doctor */}
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

            {/* Recepción */}
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
>>>>>>> Stashed changes
  );
}

export default AppRouter;