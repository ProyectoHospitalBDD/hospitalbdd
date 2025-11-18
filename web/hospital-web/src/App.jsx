// src/App.jsx
import { Routes, Route, Navigate, Link } from "react-router-dom";
import AgendarCitaPage from "./pages/Citas/AgendarCitaPage.tsx";
import "./App.css";

function App() {
  return (
    <div className="app">
      {/* Barra superior */}
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">Hospital ESCOM</h1>

          <nav className="app-nav">
            <Link to="/citas/agendar" className="app-nav-link">
              Agendar cita
            </Link>
            {/* luego aquí podrás agregar más links */}
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="app-main">
        <Routes>
          {/* redirige / a /citas/agendar */}
          <Route
            path="/"
            element={<Navigate to="/citas/agendar" replace />}
          />

          <Route path="/citas/agendar" element={<AgendarCitaPage />} />

          {/* ruta por si alguien escribe algo raro */}
          <Route path="*" element={<p>Página no encontrada</p>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
