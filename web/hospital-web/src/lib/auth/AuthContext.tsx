// src/lib/auth/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export interface UsuarioActual {
  idUsuario: number;
  nombreCompleto: string;
  rol: string;
}

interface AuthContextValue {
  user: UsuarioActual | null;
  login: (u: UsuarioActual) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioActual | null>(() => {
    const saved = localStorage.getItem("authUser");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as UsuarioActual;
    } catch {
      return null;
    }
  });

  const login = (u: UsuarioActual) => {
    setUser(u);
    localStorage.setItem("authUser", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  const value: AuthContextValue = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
