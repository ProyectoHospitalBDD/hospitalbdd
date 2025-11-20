// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="home-container">
      <h2 className="home-title">Bienvenido al sistema del Hospital ESCOM</h2>
      <p className="home-text">
        Desde aquí podrás agendar citas, consultar horarios de doctores
        y administrar la información del hospital.
      </p>

      <div className="home-actions">
        <Link to="/citas/agendar" className="home-btn primary">
          Agendar una cita
        </Link>
        <Link to="/login" className="home-btn secondary">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
