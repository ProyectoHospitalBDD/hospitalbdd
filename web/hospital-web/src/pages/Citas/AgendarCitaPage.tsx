// src/pages/Citas/AgendarCitaPage.tsx

import { FormEvent, useEffect, useState } from "react";
import { crearCita } from "../../api/citasApi";
import {
  listarEspecialidades,
  EspecialidadDto,
} from "../../api/especialidadesApi";
import {
  listarDoctoresPorEspecialidad,
  listarFechasDisponibles,
  listarHorariosDisponibles,
  DoctorListaDto,
  HorarioDisponibleDto,
} from "../../api/doctoresApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AgendarCitaPage.css";
import { useAuth } from "../../lib/auth/AuthContext";  

export function AgendarCitaPage() {
  const { user } = useAuth(); // tomamos el usuario logueado

  // si no hay usuario logueado, mostramos mensaje 
  if (!user) {
    return (
      <div className="agendar-page">
        <div className="agendar-card">
          <h2>Agendar cita</h2>
          <p>Debes iniciar sesión para agendar una cita.</p>
        </div>
      </div>
    );
  }

  // idUsuario del contexto = pacienteId
  const pacienteId = user.idUsuario; // 

  // datos cargados desde el backend
  const [especialidades, setEspecialidades] = useState<EspecialidadDto[]>([]);
  const [doctores, setDoctores] = useState<DoctorListaDto[]>([]);
  const [fechas, setFechas] = useState<string[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponibleDto[]>([]);

  // selecciones del usuario
  const [especialidadId, setEspecialidadId] = useState<number | "">("");
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string>("");

  // estado de UI
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fecha seleccionada en el DatePicker (tipo Date)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Cargar especialidades al montar la página
  useEffect(() => {
    listarEspecialidades()
      .then(setEspecialidades)
      .catch(() =>
        setError("No se pudieron cargar las especialidades. Intenta más tarde.")
      );
  }, []);

  // Cuando cambia la especialidad -> cargar doctores
  useEffect(() => {
    if (!especialidadId) {
      setDoctores([]);
      setDoctorId("");
      setFechas([]);
      setHorarios([]);
      setFechaSeleccionada("");
      setHorarioSeleccionado("");
      setSelectedDate(null);
      return;
    }

    setDoctores([]);
    setDoctorId("");
    setFechas([]);
    setHorarios([]);
    setFechaSeleccionada("");
    setHorarioSeleccionado("");
    setSelectedDate(null);

    listarDoctoresPorEspecialidad(Number(especialidadId))
      .then(setDoctores)
      .catch(() => setError("No se pudieron cargar los doctores."));
  }, [especialidadId]);

  // Cuando cambia el doctor -> cargar fechas disponibles
  useEffect(() => {
    if (!doctorId) {
      setFechas([]);
      setHorarios([]);
      setFechaSeleccionada("");
      setHorarioSeleccionado("");
      setSelectedDate(null);
      return;
    }

    setFechas([]);
    setHorarios([]);
    setFechaSeleccionada("");
    setHorarioSeleccionado("");
    setSelectedDate(null);

    listarFechasDisponibles(Number(doctorId))
      .then(setFechas)
      .catch(() =>
        setError("No se pudieron cargar las fechas disponibles.")
      );
  }, [doctorId]);

  // Cuando cambia la fecha -> cargar horarios disponibles
  useEffect(() => {
    if (!doctorId || !fechaSeleccionada) {
      setHorarios([]);
      setHorarioSeleccionado("");
      return;
    }

    listarHorariosDisponibles(Number(doctorId), fechaSeleccionada)
      .then(setHorarios)
      .catch(() =>
        setError("No se pudieron cargar los horarios disponibles.")
      );
  }, [doctorId, fechaSeleccionada]);

  const formatTimeRange = (slot: HorarioDisponibleDto) => {
    const inicio = new Date(slot.inicio);
    const fin = new Date(slot.fin);

    const pad = (n: number) => (n < 10 ? `0${n}` : n.toString());

    const hi = `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}`;
    const hf = `${pad(fin.getHours())}:${pad(fin.getMinutes())}`;

    return `${hi} - ${hf}`;
  };

  const fechasSet = new Set(fechas.map((f) => f.substring(0, 10)));

  const isAvailableDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    return fechasSet.has(key);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultado(null);

    if (!especialidadId) {
      setError("Debes seleccionar una especialidad.");
      return;
    }
    if (!doctorId) {
      setError("Debes seleccionar un doctor.");
      return;
    }
    if (!fechaSeleccionada) {
      setError("Debes seleccionar una fecha.");
      return;
    }
    if (!horarioSeleccionado) {
      setError("Debes seleccionar un horario.");
      return;
    }

    setLoading(true);
    try {
      const cita = await crearCita({
        pacienteId, // 
        doctorId: Number(doctorId),
        fechaInicioUtc: horarioSeleccionado,
        duracionMin: 60,
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
          Selecciona especialidad, doctor, fecha y horario disponible.
        </p>

        <form className="agendar-form" onSubmit={handleSubmit}>
          <div className="agendar-field">
            <label>Especialidad</label>
            <select
              value={especialidadId}
              onChange={(e) =>
                setEspecialidadId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
            >
              <option value="">Selecciona una especialidad</option>
              {especialidades.map((esp) => (
                <option key={esp.idEspecialidad} value={esp.idEspecialidad}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="agendar-field">
            <label>Doctor</label>
            <select
              value={doctorId}
              onChange={(e) =>
                setDoctorId(e.target.value ? Number(e.target.value) : "")
              }
              disabled={!especialidadId || doctores.length === 0}
            >
              <option value="">Selecciona un doctor</option>
              {doctores.map((doc) => (
                <option key={doc.idDoctor} value={doc.idDoctor}>
                  {doc.nombreMostrar}
                </option>
              ))}
            </select>
          </div>

          <div className="agendar-field">
            <label>Fecha</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);

                if (date) {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, "0");
                  const dd = String(date.getDate()).padStart(2, "0");
                  const value = `${yyyy}-${mm}-${dd}`;
                  setFechaSeleccionada(value);
                } else {
                  setFechaSeleccionada("");
                }
              }}
              filterDate={isAvailableDate}
              dateFormat="yyyy-MM-dd"
              placeholderText={
                !doctorId || fechas.length === 0
                  ? "Selecciona primero un doctor"
                  : "Selecciona una fecha"
              }
              disabled={!doctorId || fechas.length === 0}
            />
          </div>

          <div className="agendar-field">
            <label>Horario</label>
            <select
              value={horarioSeleccionado}
              onChange={(e) => setHorarioSeleccionado(e.target.value)}
              disabled={!fechaSeleccionada || horarios.length === 0}
            >
              <option value="">Selecciona un horario</option>
              {horarios.map((slot) => (
                <option key={slot.inicio} value={slot.inicio}>
                  {formatTimeRange(slot)}
                </option>
              ))}
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
