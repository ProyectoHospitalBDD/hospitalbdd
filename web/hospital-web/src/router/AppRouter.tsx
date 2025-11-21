// src/router/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import HomePage from "../pages/HomePage";
import AgendarCitaPage from "../pages/Citas/AgendarCitaPage";
import LoginPage from "../pages/Auth/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      {/* redirigir raíz al login */}
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/citas/agendar" element={<AgendarCitaPage />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRouter;
