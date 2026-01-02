import "./DoctorAtenderCitaPage.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMisCitasDoctor,
  type CitaDoctor,
  getHistorialMedicoPaciente,
  type HistorialMedicoPaciente,
} from "../../../api/doctorApi";

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DoctorAtenderCitaPage() {
  const [citas, setCitas] = useState<CitaDoctor[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(null);
  const [historialMedico, setHistorialMedico] = useState<HistorialMedicoPaciente | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const navigate = useNavigate();

  // Cargar próximas ~90 días
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const desde = ymd(new Date());
        const hastaDate = new Date();
        hastaDate.setDate(hastaDate.getDate() + 90);
        const hasta = ymd(hastaDate);

        const data = await getMisCitasDoctor({ desde, hasta });
        setCitas(data);
      } catch (err) {
        console.error("Error cargando citas:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Pacientes únicos con citas pendientes (PagadaPendAtender)
  const pacientesPendientes = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string }>();

    for (const c of citas) {
      const est = (c.estatus ?? "").toLowerCase();
      const pendiente = est === "pagadapendatender";
      if (!pendiente) continue;

      if (!map.has(c.idPaciente)) {
        map.set(c.idPaciente, { id: c.idPaciente, nombre: c.paciente ?? "—" });
      }
    }

    return Array.from(map.values());
  }, [citas]);

  const citasDelPaciente = useMemo(() => {
    if (!selectedPacienteId) return [] as CitaDoctor[];
    return citas.filter((c) => {
      if (c.idPaciente !== selectedPacienteId) return false;
      const est = (c.estatus ?? "").toLowerCase();
      return est === "pagadapendatender";
    });
  }, [citas, selectedPacienteId]);

  const cargarHistorialMedico = async () => {
    if (!selectedPacienteId) return;
    try {
      const hm = await getHistorialMedicoPaciente(selectedPacienteId);
      setHistorialMedico(hm);
      setMostrarHistorial(true);
    } catch (err) {
      console.error("Error cargando historial médico:", err);
      alert("Error al cargar el historial médico");
    }
  };

  return (
    <div className="page">
      <div className="carta">
        <h2 className="titulo">Atender cita</h2>

        <div style={{ margin: "12px 0" }}>
          <label style={{ display: "block", marginBottom: 6 }} className="etiqueta">
            Pacientes con citas pendientes
          </label>

          {loading ? (
            <div>Cargando...</div>
          ) : (
            <select
              value={selectedPacienteId ?? ""}
              onChange={(e) => setSelectedPacienteId(e.target.value ? Number(e.target.value) : null)}
              className="selector"
            >
              <option value="">-- Seleccionar un paciente --</option>
              {pacientesPendientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedPacienteId && (
          <div>
            <h3 className="titulo">Citas del paciente</h3>

            {citasDelPaciente.length === 0 ? (
              <p>No hay citas pendientes por atender para este paciente.</p>
            ) : (
              <ul className="etiqueta">
                {citasDelPaciente.map((c) => (
                  <li
                    key={c.idCita}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span>
                      {c.fecha} · {c.horaInicio}
                      {c.horaFin ? `–${c.horaFin}` : ""} · {c.estatus}
                    </span>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() =>
                          navigate("/receta", { state: { citaId: c.idCita, pacienteId: c.idPaciente } })
                        }
                        className="boton"
                      >
                        Generar Receta
                      </button>

                      <button onClick={cargarHistorialMedico} className="boton2">
                        Ver Historial Médico
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {mostrarHistorial && historialMedico && (
          <div className="espacio">
            <h3 className="titulo">Historial Médico del Paciente</h3>
            <p className="etiqueta">
              <strong>Tipo de Sangre:</strong> {historialMedico.tipoSangre || "No registrado"}
            </p>
            <p className="etiqueta">
              <strong>Peso:</strong> {historialMedico.peso ? `${historialMedico.peso} kg` : "No registrado"}
            </p>
            <p className="etiqueta">
              <strong>Estatura:</strong> {historialMedico.estatura ? `${historialMedico.estatura} m` : "No registrado"}
            </p>
          </div>
        )}

        <p className="texto">
          Aquí podrás seleccionar la cita y comenzar el proceso de atención (receta, notas, etc.).
        </p>
      </div>
    </div>
  );
}
