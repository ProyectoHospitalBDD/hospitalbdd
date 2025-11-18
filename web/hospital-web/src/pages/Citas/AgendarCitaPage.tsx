// src/pages/Citas/AgendarCitaPage.tsx
import { FormEvent, useState } from "react";
import { crearCita } from "../../api/citasApi";
import "./AgendarCitaPage.css";

export function AgendarCitaPage() {
  // por ahora simulamos "login"
  const [pacienteId, setPacienteId] = useState<number>(1);
  const [doctorId, setDoctorId] = useState<number>(2);

  const [fecha, setFecha] = useState(""); // "2025-11-24"
  const [hora, setHora] = useState(""); // "10:00"
  const [duracionMin, setDuracionMin] = useState<number>(30);

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);
    setError(null);

    try {
      if (!fecha || !hora) {
        setError("Debes seleccionar fecha y hora");
        setLoading(false);
        return;
      }

      // construir fecha-hora local y mandarla en ISO
      const fechaIso = `${fecha}T${hora}:00`; // ej: "2025-11-24T10:00:00"

      const cita = await crearCita({
        pacienteId,
        doctorId,
        fechaInicioUtc: fechaIso,
        duracionMin,
      });

      setResultado(
        `Cita #${cita.idCita} agendada. Estatus: ${cita.estatusCita}. ` +
          `Inicio: ${cita.fechaHoraInicio}, fin: ${cita.fechaHoraFin}.`
      );
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.errors?.FechaInicioUtc?.[0] ||
        err?.response?.data?.errors?.DuracionMin?.[0];

      if (detail) setError(detail);
      else setError("Error al agendar la cita");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="agendar-page">
      <div className="agendar-card">
        <h2 className="agendar-title">Agendar cita</h2>
        <p className="agendar-subtitle">
          Ingresa los datos para crear una cita médica.
        </p>

        <form className="agendar-form" onSubmit={handleSubmit}>
          <div className="agendar-field">
            <label>Paciente (id)</label>
            <input
              type="number"
              value={pacienteId}
              onChange={(e) => setPacienteId(Number(e.target.value))}
            />
          </div>

          <div className="agendar-field">
            <label>Doctor (id)</label>
            <input
              type="number"
              value={doctorId}
              onChange={(e) => setDoctorId(Number(e.target.value))}
            />
          </div>

          <div className="agendar-field">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="agendar-field">
            <label>Hora</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </div>

          <div className="agendar-field">
            <label>Duración</label>
            <select
              value={duracionMin}
              onChange={(e) => setDuracionMin(Number(e.target.value))}
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1 hora 30 min</option>
            </select>
          </div>

          <div className="agendar-actions">
            <button className="agendar-btn" type="submit" disabled={loading}>
              {loading ? "Agendando..." : "Agendar cita"}
            </button>
          </div>
        </form>

        {resultado && <p className="agendar-result">{resultado}</p>}
        {error && <p className="agendar-error">{error}</p>}
      </div>
    </div>
  );
}

export default AgendarCitaPage;
