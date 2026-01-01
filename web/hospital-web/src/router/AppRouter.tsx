import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
// import HomePage from "../pages/HomePage"; // Ya no se usa HomePage separado porque está en el Layout
import AgendarCitaPage from "../pages/Citas/AgendarCitaPage";
import LoginPage from "../pages/Auth/LoginPage";
import PrivateRoute from "./PrivateRoute";
import Comprobante from "../pages/Comprobante/Comprobante";
import CobroTicket from "../pages/Farmacia/CobroTicket";

import Inventario from "../pages/Inventario/Productos";
import Tienda from "../pages/Tienda/Tienda";
import Carrito from "../pages/Carrito/Carrito";

// Importamos el Provider
import { CartProvider } from "../pages/Carrito/CartContext";

import ProfilePage from "../pages/Profile/ProfilePage";
import DoctorPerfilPage from "../pages/Doctor/DoctorPerfilPage";
import DoctorMisCitasPage from "../pages/Doctor/Citas/DoctorMisCitasPage";
import DoctorAtenderCitaPage from "../pages/Doctor/Citas/DoctorAtenderCitaPage";

export function AppRouter() {
  return (
    /* Envolvemos todo el sistema de rutas con el CartProvider */
    <CartProvider>
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
                {/* El Layout detecta /home y muestra el Hero */}
                <></> 
              </PrivateRoute>
            }
          />

          {/* --- RUTAS DE PACIENTE / TIENDA --- */}
          <Route
            path="/citas/agendar"
            element={
              <PrivateRoute>
                <AgendarCitaPage />
              </PrivateRoute>
            }
          />
          
          <Route
              path="/tienda"
              element={
                  <PrivateRoute>
                      <Tienda />
                  </PrivateRoute>
              }
          />

          <Route
            path="/comprobante/Comprobar"
            element={
              <PrivateRoute>
                <Comprobante/>
              </PrivateRoute>
            }
          />

          {/* --- RUTAS DE FARMACIA / INVENTARIO --- */}
          <Route 
              path="farmacia" 
              element={
                  <PrivateRoute>
                      <CobroTicket />
                  </PrivateRoute>
              } 
          />
          <Route 
              path="inventario" 
              element={
                  <PrivateRoute>
                      <Inventario/>
                  </PrivateRoute>
              } 
          />

          <Route 
              path="carrito" 
              element={
                  <PrivateRoute>
                      <Carrito/>
                  </PrivateRoute>
              } 
          />

          {/* --- RUTAS DE DOCTOR / PERFIL --- */}
          <Route 
              path="/perfil" 
              element={
                  <PrivateRoute>
                      <ProfilePage />
                  </PrivateRoute>
              } 
          />
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

        </Route>

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </CartProvider>
  );
}

export default AppRouter;