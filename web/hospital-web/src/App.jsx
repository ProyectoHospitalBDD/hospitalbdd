// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import HomePage from "./pages/HomePage";
import AgendarCitaPage from "./pages/Citas/AgendarCitaPage";
import LoginPage from "./pages/Auth/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login SIN layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Todo lo demás usa el Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/citas/agendar" element={<AgendarCitaPage />} />

          {/* cualquier ruta rara => redirige a Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
