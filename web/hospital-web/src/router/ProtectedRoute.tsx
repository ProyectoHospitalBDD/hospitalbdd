import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../lib/auth/AuthContext";

type Props = {
  children: ReactNode;
  roles?: string[]; 
};

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const rol = user.rol; 
    if (!roles.includes(rol)) return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
