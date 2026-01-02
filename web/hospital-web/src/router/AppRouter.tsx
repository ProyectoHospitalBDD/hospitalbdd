import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import PrivateRoute from "./PrivateRoute";

// Auth
import LoginPage from "../pages/Auth/LoginPage";

// Paciente / General
import AgendarCitaPage from "../pages/Citas/AgendarCitaPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import Comprobante from "../pages/Comprobante/Comprobante";

// Tienda / Farmacia
import Tienda from "../pages/Tienda/Tienda";
import Carrito from "../pages/Carrito/Carrito";
import CobroTicket from "../pages/Farmacia/CobroTicket";
import Inventario from "../pages/Inventario/Productos";

// Doctor
import DoctorPerfilPage from "../pages/Doctor/DoctorPerfilPage";
import DoctorMisCitasPage from "../pages/Doctor/Citas/DoctorMisCitasPage";
import DoctorAtenderCitaPage from "../pages/Doctor/Citas/DoctorAtenderCitaPage";

// Recepción
import RecepCancelacionesPage from "../pages/Recep/Cancelaciones/RecepCancelacionesPage";
import RecepEmpleadosPage from "../pages/Recep/Empleados/RecepEmpleadosPage";

// Carrito
import { CartProvider } from "../pages/Carrito/CartContext";

export function AppRouter() {
  return (
    <CartProvider>
      <Routes>
        {/* ---------- PÚBLICA ---------- */}
        <Route path="/login" element={<LoginPage />} />

        {/* ---------- CON LAYOUT ---------- */}
        <Route element={<Layout />}>
          {/* Home */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <></>
              </PrivateRoute>
            }
          />

          {/* ---------- PACIENTE ---------- */}
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

          {/* ---------- TIENDA / FARMACIA ---------- */}
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

          {/* ---------- DOCTOR ---------- */}
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

          {/* ---------- RECEPCIÓN ---------- */}
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
                <RecepEmpleadosPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* ---------- REDIRECCIONES ---------- */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </CartProvider>
  );
}

export default AppRouter;
