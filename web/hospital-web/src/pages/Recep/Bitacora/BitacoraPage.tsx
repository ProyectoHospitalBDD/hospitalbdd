import { useEffect, useMemo, useState } from "react";
import {
  buscarBitacoraRecepcion,
  buscarBitacoraEstatusRecepcion,
  BitacoraRow,
  BitacoraEstatusCitaRow,
} from "../../../api/bitacoraApi";
import "./BitacoraPage.css";

type Tab = "historial" | "estatus";

export default function BitacoraHistorialPage() {
  const [tab, setTab] = useState<Tab>("historial");

  // estado general UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtros compartidos
  const [texto, setTexto] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // filtros por tab
  const [estatusHistorial, setEstatusHistorial] = useState(""); // Atendida | NoAsistio | ""
  const [estatusCita, setEstatusCita] = useState(""); // ej: CanceladaPaciente | Atendida... | ""

  // data por tab
  const [rowsHistorial, setRowsHistorial] = useState<BitacoraRow[]>([]);
  const [rowsEstatus, setRowsEstatus] = useState<BitacoraEstatusCitaRow[]>([]);

  const titulo = useMemo(() => {
    return tab === "historial"
      ? "Bitácora historial médico de pacientes"
      : "Bitácora estatus de citas";
  }, [tab]);

  const subtitulo = useMemo(() => {
    return tab === "historial"
      ? "Filtra por paciente, doctor, folio, fechas y estatus."
      : "Filtra cambios de estatus de la cita por folio, fechas y estatus.";
  }, [tab]);

  async function cargar() {
    try {
      setLoading(true);
      setError(null);

      const textoQ = texto.trim() ? texto.trim() : undefined;
      const desdeUtc = desde ? new Date(desde).toISOString() : undefined;
      const hastaUtc = hasta ? new Date(hasta).toISOString() : undefined;

      if (tab === "historial") {
        const data = await buscarBitacoraRecepcion({
          texto: textoQ,
          desdeUtc,
          hastaUtc,
          estatus: estatusHistorial || undefined,
        });
        setRowsHistorial(data);
      } else {
        const data = await buscarBitacoraEstatusRecepcion({
          texto: textoQ,
          desdeUtc,
          hastaUtc,
          estatusCita: estatusCita || undefined,
        });
        setRowsEstatus(data);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar bitácora");
    } finally {
      setLoading(false);
    }
  }

  // carga inicial + al cambiar tab
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function onKeyDownBuscar(e: React.KeyboardEvent) {
    if (e.key === "Enter") cargar();
  }

  // helpers para formato
  function fmtFecha(iso: string) {
    // iso tipo "2026-01-12" o datetime
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
  }

  function fmtHora(h: string) {
    // "08:00:00" -> "08:00"
    return (h ?? "").toString().slice(0, 5) || "—";
  }

  return (
    <div className="bitacora-wrap">
      <div className="bitacora-card">
        <div className="bitacora-header">
          <div>
            <h2 style={{ margin: 0 }}>{titulo}</h2>
            <p style={{ margin: "0.25rem 0 0" }}>{subtitulo}</p>
          </div>

          <div className="bitacora-tabs">
            <button
              className={`bitacora-tabBtn ${tab === "historial" ? "is-active" : ""}`}
              onClick={() => setTab("historial")}
              type="button"
            >
              Historial médico
            </button>

            <button
              className={`bitacora-tabBtn ${tab === "estatus" ? "is-active" : ""}`}
              onClick={() => setTab("estatus")}
              type="button"
            >
              Estatus de cita
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bitacora-filtros">
          <input
            type="text"
            placeholder={
              tab === "historial"
                ? "Paciente, doctor, folio..."
                : "Folio cita, estatus, paciente/doctor..."
            }
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={onKeyDownBuscar}
          />

          <div>
            <label>Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              onKeyDown={onKeyDownBuscar}
            />
          </div>

          <div>
            <label>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              onKeyDown={onKeyDownBuscar}
            />
          </div>

          {tab === "historial" ? (
            <div>
              <label>Estatus</label>
              <select
                value={estatusHistorial}
                onChange={(e) => setEstatusHistorial(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Atendida">Atendida</option>
                <option value="NoAsistio">No asistió</option>
              </select>
            </div>
          ) : (
            <div>
              <label>Estatus cita</label>
              <select value={estatusCita} onChange={(e) => setEstatusCita(e.target.value)}>
                <option value="">Todos</option>
                <option value="AgendadaPendPago">Agendada (pend. pago)</option>
                <option value="AgendadaPagada">Agendada (pagada)</option>
                <option value="Atendida">Atendida</option>
                <option value="NoAcudio">No acudió</option>
                <option value="CanceladaPaciente">Cancelada (paciente)</option>
                <option value="CanceladaDoctor">Cancelada (doctor)</option>
                <option value="CanceladaRecepcion">Cancelada (recepción)</option>
              </select>
            </div>
          )}

          <button onClick={cargar} disabled={loading} type="button">
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Estados */}
        {error && <p className="error">{error}</p>}

        {/* Tabla */}
        <div className="bitacora-tableWrap">
          {tab === "historial" ? (
            !loading && rowsHistorial.length > 0 ? (
              <div className="bitacora-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Bitácora</th>
                      <th>Folio cita</th>
                      <th>Folio receta</th>
                      <th>Fecha consulta</th>
                      <th>Hora</th>
                      <th>Fecha mov.</th>
                      <th>Usuario</th>
                      <th>Paciente</th>
                      <th>Especialidad</th>
                      <th>Consultorio</th>
                      <th>Estatus</th>
                      <th>Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsHistorial.map((r) => (
                      <tr key={r.idBitacora}>
                        <td>{r.idBitacora}</td>
                        <td>{r.folioCita}</td>
                        <td>{r.folioReceta ?? "—"}</td>
                        <td>{fmtFecha(r.fechaCita)}</td>
                        <td>{fmtHora(r.horaCita)}</td>

                        <td>{new Date(r.fechaMovimiento).toLocaleString()}</td>
                        <td>{r.usuario}</td>
                        <td>{r.nombrePaciente}</td>
                        <td>{r.especialidad}</td>
                        <td>{r.consultorio}</td>

                        <td>
                          <span className={`chip chip--${r.estatusConsulta}`}>
                            {r.estatusConsulta}
                          </span>
                        </td>
                        <td className="diagnostico" title={r.diagnostico ?? ""}>
                          {r.diagnostico ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !loading ? (
              <p style={{ margin: "0.75rem", color: "rgba(0,0,0,0.65)" }}>
                No hay registros para los filtros seleccionados.
              </p>
            ) : (
              <p style={{ margin: "0.75rem", color: "rgba(0,0,0,0.65)" }}>
                Cargando...
              </p>
            )
          ) : !loading && rowsEstatus.length > 0 ? (
            <div className="bitacora-tabla">
              <table>
                <thead>
                  <tr>
                    <th>Bitácora</th>
                    <th>Fecha mov.</th>
                    <th>Folio cita</th>
                    <th>Estatus</th>
                    <th>Paciente</th>
                    <th>Doctor</th>
                    <th>Costo</th>
                    <th>Política</th>
                    <th>Devuelto</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsEstatus.map((r) => (
                    <tr key={r.idBitacora}>
                      <td>{r.idBitacora}</td>
                      <td>{new Date(r.fechaMov).toLocaleString()}</td>
                      <td>{r.idCita}</td>
                      <td>
                        <span className="chip">{r.estatusCita}</span>
                      </td>
                      <td>{r.nombrePaciente ?? (r.idPaciente ?? "—")}</td>
                      <td>{r.nombreDoctor ?? (r.idDoctor ?? "—")}</td>
                      <td>{r.costo == null ? "—" : `$${r.costo.toFixed(2)}`}</td>
                      <td>{r.politica ?? "—"}</td>
                      <td>
                        {r.montoDevuelto == null ? "—" : `$${r.montoDevuelto.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !loading ? (
            <p style={{ margin: "0.75rem", color: "rgba(0,0,0,0.65)" }}>
              No hay registros para los filtros seleccionados.
            </p>
          ) : (
            <p style={{ margin: "0.75rem", color: "rgba(0,0,0,0.65)" }}>
              Cargando...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
