import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { api } from "./lib/api";
import DoctoresPage from "./pages/DoctoresPage.jsx";
import CitasPage from "./pages/CitasPage.jsx";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api.get("/health/db")
      .then(r => setStatus(`API OK · DB: ${r.data.database} · usuarios: ${r.data.usuarios ?? "?"}`))
      .catch(err => setStatus(`Error: ${err.message}`));
  }, []);

  const link = (to, text) => (
    <NavLink to={to} className={({isActive}) =>
      `px-2 py-1 ${isActive ? "font-bold underline" : ""}`}>{text}</NavLink>
  );

  return (
    <div style={{padding: 16, fontFamily: "system-ui, sans-serif"}}>
      <h1>Hospital Web</h1>
      <p style={{marginBottom: 12}}>Backend: {status}</p>

      <nav style={{marginBottom: 16}}>
        {link("/", "Inicio")}
        {link("/doctores", "Doctores")}
        {link("/citas", "Citas")}
      </nav>

      <Routes>
        <Route path="/" element={<div>Bienvenido 👋 — selecciona una sección.</div>} />
        <Route path="/doctores" element={<DoctoresPage />} />
        <Route path="/citas" element={<CitasPage />} />
      </Routes>
    </div>
  );
}
