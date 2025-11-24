// src/router/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import HomePage from "../pages/HomePage";
import AgendarCitaPage from "../pages/Citas/AgendarCitaPage";
import LoginPage from "../pages/Auth/LoginPage";
import PrivateRoute from "./PrivateRoute";
import Comprobante from "../pages/Comprobante/Comprobante";

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

      </Route>

     

      

      {/* Redirecciones */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default AppRouter;
