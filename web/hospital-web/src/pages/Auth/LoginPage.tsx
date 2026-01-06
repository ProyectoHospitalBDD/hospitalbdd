// src/pages/Auth/LoginPage.tsx
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../../api/authApi";
import { useAuth } from "../../lib/auth/AuthContext";
import "./LoginPage.css";

export function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await loginApi({ correo, password });
      // guardamos en contexto + localStorage
      login(user);
      // mandamos a la pantalla principal
      navigate("/home");
    } catch (err: any) {
      const data = err?.response?.data;

      const msg =
        (typeof data === "string" && data) ||
        data?.message ||
        data?.detail ||
        err?.message ||
        "Usuario o contraseña incorrectos.";

      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Iniciar sesión</h2>
        <p className="login-subtitle">
          Usa tu correo y contraseña registrados en el sistema.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          <button type="button"
            className="signup-btn"
            onClick={() => navigate("/register")}>
            Crear cuenta
          </button>
          <button
            type="button"
            className="guest-btn"
            onClick={() => navigate("/home")}>
              Ingresar como invitado
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;