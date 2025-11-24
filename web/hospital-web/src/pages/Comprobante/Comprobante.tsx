import "./Comprobante.css";
import { useAuth } from "../../lib/auth/AuthContext";  
import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { listarEspecialidades, EspecialidadDto } from "../../api/especialidadesApi";
import { listarDoctoresPorEspecialidad, DoctorListaDto } from "../../api/doctoresApi";

export function Comprobante() {
  const [especialidad, setEspecialidad] = useState<EspecialidadDto | null>(null);
  const [doctor, setDoctor] = useState<DoctorListaDto | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

const location = useLocation();
const state = location.state as {
  citaId: number;
  estatus: string;
  fechaInicio: string;
  fechaFin: string;
  fechaSeleccionada: string;
  horarioSeleccionado: string;
  especialidadId: number;
  doctorId: number;
};

// Convertir horarioSeleccionado a Date
const horarioDate = new Date(state.horarioSeleccionado);

const hora = horarioDate.toLocaleTimeString("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
});

const fecha = state.fechaSeleccionada; // ya es string tipo YYYY-MM-DD


  const horarioSeleccionado = new Date(state.horarioSeleccionado);
  const fechaSeleccionada = state.fechaSeleccionada;
  const especialidadId = state.especialidadId;
  const doctorId = state.doctorId;

  useEffect(() => {
    setResultado(
      `Cita #${state.citaId} agendada. Estatus: ${state.estatus}. ` +
        `Inicio: ${state.fechaInicio}, fin: ${state.fechaFin}.`
    );
  }, [state]);

  useEffect(() => {
    listarEspecialidades()
      .then((espList) => {
        const esp = espList.find((e) => e.idEspecialidad === especialidadId) || null;
        setEspecialidad(esp);
      })
      .catch(() => console.error("Error al cargar especialidad"));

    listarDoctoresPorEspecialidad(especialidadId)
      .then((docs) => {
        const doc = docs.find((d) => d.idDoctor === doctorId) || null;
        setDoctor(doc);
      })
      .catch(() => console.error("Error al cargar doctor"));
  }, [especialidadId, doctorId]);

  const { user } = useAuth();



  return (
    <div className="app">
      <div className="centro">
        <div className="txt">Comprobante</div>
      </div>
      <div className="nose">
        <div className="Cuadro">
          <p className="P">Folio: #{state.citaId}</p>
          <p className="P">Nombre: {user?.nombreCompleto}</p>
          <div className="box-fila">
            <p className="P">Doctor: {doctor?.nombreMostrar}</p> <p className="P2">Fecha: {fechaSeleccionada}</p>
          </div>
          <div className="box-fila">
            <p className="P">Especialidad: {especialidad?.nombre}</p> <p className="P2">Hora: {hora}</p>
          </div>
          <p className="centro">Costo: ${especialidad?.costo}</p>
          <ul className="centro">
            Politicas de cancelacion
            <strong>
              <p className="P">1.- 48 horas de anticipación: 100% del pago</p>
              <p className="P">2.- 24 horas: 50% del pago</p>
              <p className="P">3.- Menos de 24 horas: 0%</p>
            </strong>
          </ul>
          <p className="centro">{resultado}</p>
        </div>
        <div className="box-fila">
          <Link to="/citas/agendar" className="btn primary">
            Agendar nueva cita
          </Link>
          <Link to="/home" className="btn primary">
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Comprobante;