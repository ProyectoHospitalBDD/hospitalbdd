// src/router/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../lib/auth/AuthContext";

type PrivateRouteProps = {
  children: ReactNode;
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  // Mientras se carga el usuario desde localStorage
  if (loading) {
    return <div>Cargando sesión...</div>;
  }

  // Si no hay usuario después de cargar, mandamos a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //Si hay usuario, mostramos la página protegida
  return <>{children}</>;
}
