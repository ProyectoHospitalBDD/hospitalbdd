import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AgendarCitaPage } from "../pages/Citas/AgendarCitaPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/citas/agendar" element={<AgendarCitaPage />} />
        {/* Por ahora cualquier ruta desconocida manda a agendar */}
        <Route path="*" element={<Navigate to="/citas/agendar" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
