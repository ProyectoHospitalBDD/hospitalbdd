import "../Profile/ProfilePage.css"; // reutiliza tu css del paciente
import "./RecepcionistaPerfilPage.css";
import { useEffect, useState } from "react";
import { getMiPerfilRecepcionista, type PerfilRecepcionista } from "../../api/recepcionistaApi";

export default function RecepcionistaPerfilPage() {
  const [perfil, setPerfil] = useState<PerfilRecepcionista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const p = await getMiPerfilRecepcionista();
        setPerfil(p);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando perfil del recepcionista");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Cargando…</p>;
  if (error) return <p style={{ padding: 24, color: "crimson" }}>{error}</p>;
  if (!perfil) return <p style={{ padding: 24 }}>No se encontró el perfil.</p>;

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <h2 className="perfil-title">Mi perfil (Recepcionista)</h2>
        <p className="perfil-subtitle">
          Aquí puedes ver tus datos.
        </p>

        <section className="perfil-section">
          <h3 className="perfil-section-title">Datos</h3>

          <div className="perfil-grid">
            <div className="perfil-field">
              <span className="perfil-field-label">Nombre</span>
              <div className="perfil-field-value">{perfil.nombreCompleto}</div>
            </div>

            <div className="perfil-field">
              <span className="perfil-field-label">CURP</span>
              <div className="perfil-field-value">{perfil.curp}</div>
            </div>

            <div className="perfil-field">
              <span className="perfil-field-label">Tipo de Empleado</span>
              <div className="perfil-field-value">{perfil.tipoEmpleado}</div>
            </div>

            <div className="perfil-field">
              <span className="perfil-field-label">Estatus</span>
              <div className="perfil-field-value">
                <span className={`perfil-chip ${perfil.estatusEmpleado ? "perfil-chip--ok" : "perfil-chip--bad"}`}>
                  {perfil.estatusEmpleado ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div className="perfil-field">
              <span className="perfil-field-label">Salario</span>
              <div className="perfil-field-value">${perfil.salario.toFixed(2)}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}