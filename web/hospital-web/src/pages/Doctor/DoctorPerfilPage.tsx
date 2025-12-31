// pages/Doctor/DoctorPerfilPage.tsx
import "../Profile/ProfilePage.css"; // reutiliza tu css del paciente
import "./DoctorPerfilPage.css";   // estilos extra para horario
import { useEffect, useMemo, useState } from "react";
import { getMiPerfilDoctor, getMiHorarioDoctor, type PerfilDoctor, type HorarioDoctor } from "../../api/doctorApi";

type TabKey = "datos" | "horario" | "consultorio";

const ordenDias = ["Lunes","Martes","Miercoles","Miércoles","Jueves","Viernes","Sabado","Sábado","Domingo"];

function normalizaDia(d: string) {
  return (d ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function soloHHmm(s: string) {
  // soporta "08:00", "08:00:00", "2025-..T08:00:00"
  if (!s) return "";
  if (s.length >= 5) return s.slice(0, 5);
  return s;
}

export default function DoctorPerfilPage() {
  const [tab, setTab] = useState<TabKey>("datos");
  const [perfil, setPerfil] = useState<PerfilDoctor | null>(null);
  const [horario, setHorario] = useState<HorarioDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const p = await getMiPerfilDoctor();
        setPerfil(p);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando perfil del doctor");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // carga horario solo cuando se entra a la tab (más ligero)
  useEffect(() => {
    if (tab !== "horario") return;

    (async () => {
      setLoadingHorario(true);
      setError("");
      try {
        const h = await getMiHorarioDoctor();
        setHorario(h);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando horario");
      } finally {
        setLoadingHorario(false);
      }
    })();
  }, [tab]);

  const horarioOrdenado = useMemo(() => {
    const idx = (dia: string) => {
      const n = normalizaDia(dia);
      const i = ordenDias.findIndex(x => normalizaDia(x) === n);
      return i === -1 ? 999 : i;
    };
    return [...horario].sort((a, b) => idx(a.diaSemana) - idx(b.diaSemana));
  }, [horario]);

  if (loading) return <p style={{ padding: 24 }}>Cargando…</p>;
  if (error) return <p style={{ padding: 24, color: "crimson" }}>{error}</p>;
  if (!perfil) return <p style={{ padding: 24 }}>No se encontró el perfil.</p>;

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <h2 className="perfil-title">Mi perfil (Doctor)</h2>
        <p className="perfil-subtitle">
          Aquí puedes ver tus datos, tu consultorio y tu horario de atención.
        </p>

        <div className="perfil-tabs">
          <button
            className={`perfil-tab ${tab === "datos" ? "perfil-tab--active" : ""}`}
            onClick={() => setTab("datos")}
          >
            Datos
          </button>

          <button
            className={`perfil-tab ${tab === "horario" ? "perfil-tab--active" : ""}`}
            onClick={() => setTab("horario")}
          >
            Horario
          </button>

          <button
            className={`perfil-tab ${tab === "consultorio" ? "perfil-tab--active" : ""}`}
            onClick={() => setTab("consultorio")}
          >
            Consultorio
          </button>
        </div>

        {tab === "datos" && (
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
                <span className="perfil-field-label">Cédula</span>
                <div className="perfil-field-value">{perfil.cedula}</div>
              </div>

              <div className="perfil-field">
                <span className="perfil-field-label">Especialidad</span>
                <div className="perfil-field-value">{perfil.especialidad}</div>
              </div>

              <div className="perfil-field">
                <span className="perfil-field-label">Estatus</span>
                <div className="perfil-field-value">
                  <span className={`perfil-chip ${perfil.estatusEmpleado ? "perfil-chip--ok" : "perfil-chip--bad"}`}>
                    {perfil.estatusEmpleado ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "consultorio" && (
          <section className="perfil-section">
            <h3 className="perfil-section-title">Consultorio</h3>

            <div className="doctor-consultorio">
              <div className="doctor-consultorio__badge">
                <span className="doctor-consultorio__num">{perfil.consultorio}</span>
                <span className="doctor-consultorio__label">Consultorio</span>
              </div>

              <div className="doctor-consultorio__info">
                <div className="doctor-consultorio__row">
                  <span className="doctor-consultorio__k">Especialidad</span>
                  <span className="doctor-consultorio__v">{perfil.especialidad}</span>
                </div>
                <div className="doctor-consultorio__row">
                  <span className="doctor-consultorio__k">Doctor</span>
                  <span className="doctor-consultorio__v">{perfil.nombreCompleto}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "horario" && (
          <section className="perfil-section">
            <h3 className="perfil-section-title">Horario de atención</h3>

            {loadingHorario && <p style={{ color: "#475569", marginTop: 0 }}>Cargando horario…</p>}

            {!loadingHorario && horarioOrdenado.length === 0 && (
              <p style={{ color: "#475569", marginTop: 0 }}>
                No tienes horario registrado todavía.
              </p>
            )}

            <div className="doctor-horario-grid">
              {horarioOrdenado.map((h, i) => (
                <div key={`${h.diaSemana}-${i}`} className="doctor-horario-card">
                  <div className="doctor-horario-dia">{h.diaSemana}</div>
                  <div className="doctor-horario-horas">
                    <span className="doctor-horario-hora">{soloHHmm(h.horaInicio)}</span>
                    <span className="doctor-horario-sep">–</span>
                    <span className="doctor-horario-hora">{soloHHmm(h.horaFin)}</span>
                  </div>
                  <div className="doctor-horario-meta">
                    <span className="perfil-chip perfil-chip--ok">Disponible</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
