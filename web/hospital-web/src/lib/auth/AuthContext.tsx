// src/lib/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AuthUser {
  idUsuario: number;
  nombreCompleto: string;
  rol: string;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Leer de localStorage al arrancar
  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        const saved = JSON.parse(raw) as AuthUser;
        setUser(saved);
      }
    } catch {
      // si falla el parse, ignoramos y arrancamos sin user
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem("authUser", JSON.stringify(u));
    localStorage.setItem("authToken", u.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
