import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";
import "./LoginPage.css"; 

export function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!correo || !password) {
      setError("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const user = await login({ correo, password });

      // por ahora, solo guardamos al usuario en localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // y mandamos a la página principal o a agendar cita
      navigate("/citas/agendar");
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.errors?.Correo?.[0] ||
        err?.response?.data?.errors?.Password?.[0];

      if (detail) setError(detail);
      else setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agendar-page">
      <div className="agendar-card">
        <h2 className="agendar-title">Iniciar sesión</h2>
        <p className="agendar-subtitle">
          Ingresa tu correo y contraseña para continuar.
        </p>

        <form className="agendar-form" onSubmit={handleSubmit}>
          <div className="agendar-field">
            <label>Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div className="agendar-field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <div className="agendar-actions">
            <button className="agendar-btn" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </div>
        </form>

        {error && <p className="agendar-error">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
