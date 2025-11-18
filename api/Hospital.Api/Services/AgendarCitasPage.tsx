import { FormEvent, useState } from "react";
import { crearCita } from "../../api/citasApi";

export function AgendarCitaPage() {
  
  const [pacienteId, setPacienteId] = useState<number>(1);
  const [doctorId, setDoctorId] = useState<number>(2);

  const [fecha, setFecha] = useState(""); // "2025-11-24"
  const [hora, setHora] = useState("");   // "10:00"
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
      const fechaLocal = new Date(`${fecha}T${hora}:00`);
      const fechaIso = fechaLocal.toISOString();

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
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1rem" }}>
      <h1>Agendar cita</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Paciente (id)</label>
          <input
            type="number"
            value={pacienteId}
            onChange={e => setPacienteId(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Doctor (id)</label>
          <input
            type="number"
            value={doctorId}
            onChange={e => setDoctorId(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
          />
        </div>

        <div>
          <label>Hora</label>
          <input
            type="time"
            value={hora}
            onChange={e => setHora(e.target.value)}
          />
        </div>

        <div>
          <label>Duración</label>
          <select
            value={duracionMin}
            onChange={e => setDuracionMin(Number(e.target.value))}
          >
            <option value={30}>30 minutos</option>
            <option value={60}>1 hora</option>
            <option value={90}>1 hora 30 min</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
          {loading ? "Agendando..." : "Agendar cita"}
        </button>
      </form>

      {resultado && (
        <p style={{ marginTop: "1rem", color: "green" }}>{resultado}</p>
      )}
      {error && (
        <p style={{ marginTop: "1rem", color: "red" }}>{error}</p>
      )}
    </div>
  );
}
