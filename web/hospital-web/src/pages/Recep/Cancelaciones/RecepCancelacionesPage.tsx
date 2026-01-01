import "./RecepCancelacionesPage.css";
import { useEffect, useMemo, useState } from "react";
import {
  getPendientesCancelacionDoctor,
  confirmarCancelacionDoctor,
  rechazarCancelacionDoctor,
  buscarCitasRecepcion,
  cancelarCitaPorRecepcion,
  type CancelacionPendiente,
  type CitaRecepRow,
} from "../../../api/recepCancelacionesApi";


function fmtFecha(s: string) {
  const d = new Date(s);
  return d.toLocaleString();
}

export default function RecepCancelacionesPage() {
  const [pendientes, setPendientes] = useState<CancelacionPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [accionandoId, setAccionandoId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [idCancelar, setIdCancelar] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [msgOk, setMsgOk] = useState<string | null>(null);

  const [texto, setTexto] = useState("");
  const [desdeLocal, setDesdeLocal] = useState("");
  const [hastaLocal, setHastaLocal] = useState("");
  const [estatus, setEstatus] = useState("");

  const [resultados, setResultados] = useState<CitaRecepRow[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  function toUtcIso(local: string) {
    // local viene de <input type="datetime-local"> => "YYYY-MM-DDTHH:mm"
    if (!local) return undefined;
    const d = new Date(local);
    return d.toISOString();
  }

  function esCancelable(estatus: string) {
  const e = (estatus ?? "").toLowerCase();

    // ya canceladas
    if (e.includes("cancelada")) return false;

    // ya atendida
    if (e.includes("atendida")) return false;

    // está en solicitud del doctor:
    if (e.includes("cancelacionsolicitada")) return false;

    return true;
  }

  async function onBuscar() {
    setError(null);
    setBuscando(true);
    try {
      const data = await buscarCitasRecepcion({
        texto: texto.trim() || undefined,
        desdeUtc: toUtcIso(desdeLocal),
        hastaUtc: toUtcIso(hastaLocal),
        estatus: estatus || undefined,
      });
      setResultados(data);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo buscar.");
    } finally {
      setBuscando(false);
    }
  }

  async function onCancelarFila(c: CitaRecepRow) {
    setError(null);

    const ok = window.confirm(
      `¿Cancelar la cita #${c.idCita}?\nPaciente: ${c.pacienteNombre}\nDoctor: ${c.doctorNombre}\nFecha: ${fmtFecha(c.fechaHoraInicio)}`
    );
    if (!ok) return;

    setCancelandoId(c.idCita);
    try {
      await cancelarCitaPorRecepcion(c.idCita);
      // la quitamos de la tabla
      setResultados(prev => prev.filter(x => x.idCita !== c.idCita));
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cancelar.");
    } finally {
      setCancelandoId(null);
    }
  }



  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendientesCancelacionDoctor();
      setPendientes(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando pendientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const total = useMemo(() => pendientes.length, [pendientes]);

  async function onCancelarPorRecepcion() {
  setMsgOk(null);
  setError(null);

  const id = Number(idCancelar);
  if (!Number.isInteger(id) || id <= 0) {
    setError("Ingresa un ID de cita válido.");
    return;
  }

  const ok = window.confirm(`¿Seguro que quieres cancelar la cita #${id}?`);
  if (!ok) return;

  setCancelando(true);
  try {
    await cancelarCitaPorRecepcion(id);
    setMsgOk(`Cita #${id} cancelada.`);
    setIdCancelar("");
  } catch (e: any) {
    setError(e?.message ?? "No se pudo cancelar la cita.");
  } finally {
    setCancelando(false);
  }
}



  async function onConfirmar(idCita: number) {
    setAccionandoId(idCita);
    setError(null);
    try {
      await confirmarCancelacionDoctor(idCita);
      setPendientes(prev => prev.filter(x => x.idCita !== idCita));
    } catch (e: any) {
      setError(e?.message ?? "No se pudo confirmar");
    } finally {
      setAccionandoId(null);
    }
  }

  async function onRechazar(idCita: number) {
    setAccionandoId(idCita);
    setError(null);
    try {
      await rechazarCancelacionDoctor(idCita);
      setPendientes(prev => prev.filter(x => x.idCita !== idCita));
    } catch (e: any) {
      setError(e?.message ?? "No se pudo rechazar");
    } finally {
      setAccionandoId(null);
    }
  }

  return (
    <div className="recep-cancelaciones">
      <div className="recep-cancelaciones__hero">
        <div className="recep-cancelaciones__heroTop">
          <h1>Administrar Citas</h1>

          <span className="recep-cancelaciones__pill">
            Solicitudes: <b>{total}</b>
          </span>
        </div>

        <p className="recep-cancelaciones__heroSub">
          Consulta y administra todas las citas. También gestiona solicitudes de cancelación de doctores.
        </p>
      </div>

      {error && <div className="recep-cancelaciones__error">{error}</div>}

      {/* =========================
          A) Solicitudes del doctor
          ========================= */}
      <div className="recep-cancelaciones__card">
        <div className="recep-cancelaciones__cardHeader">
          <div>
            <h2>Solicitudes de cancelación (Doctor)</h2>
            <p className="recep-cancelaciones__muted">
              Aprueba o rechaza solicitudes de cancelación enviadas por doctores.
            </p>
          </div>

          <button className="btn btn-ghost" onClick={cargar} disabled={loading}>
            Refrescar
          </button>
        </div>

        {loading ? (
          <p>Cargando…</p>
        ) : pendientes.length === 0 ? (
          <p>No hay solicitudes pendientes.</p>
        ) : (
          <div className="recep-cancelaciones__tableWrap">
            <table className="recep-cancelaciones__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Doctor</th>
                  <th>Costo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map(x => (
                  <tr key={x.idCita}>
                    <td>{x.idCita}</td>
                    <td>{fmtFecha(x.fechaHoraInicio)}</td>
                    <td>{x.pacienteNombre}</td>
                    <td>{x.doctorNombre}</td>
                    <td>${Number(x.costo).toFixed(2)}</td>
                    <td className="recep-cancelaciones__actions">
                      <button
                        className="btn btn-ok"
                        disabled={accionandoId === x.idCita}
                        onClick={() => onConfirmar(x.idCita)}
                      >
                        Aprobar
                      </button>
                      <button
                        className="btn btn-bad"
                        disabled={accionandoId === x.idCita}
                        onClick={() => onRechazar(x.idCita)}
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          B) Buscar citas y cancelar
          ========================= */}
      <div className="recep-cancelaciones__card">
        <h2>Buscar Citas del Paciente</h2>
        <p className="recep-cancelaciones__muted">
          Busca por nombre (paciente/doctor), por fecha o por estatus. Luego cancela desde la lista.
        </p>

        <div className="recep-cancelaciones__filters">
          <div className="recep-cancelaciones__field">
            <label>Búsqueda</label>
            <input
              className="recep-cancelaciones__input"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Nombre paciente/doctor o ID de cita"
            />
          </div>

          <div className="recep-cancelaciones__field">
            <label>Desde</label>
            <input
              className="recep-cancelaciones__input"
              type="datetime-local"
              value={desdeLocal}
              onChange={(e) => setDesdeLocal(e.target.value)}
            />
          </div>

          <div className="recep-cancelaciones__field">
            <label>Hasta</label>
            <input
              className="recep-cancelaciones__input"
              type="datetime-local"
              value={hastaLocal}
              onChange={(e) => setHastaLocal(e.target.value)}
            />
          </div>

          <div className="recep-cancelaciones__field">
            <label>Estatus</label>
            <select
              className="recep-cancelaciones__input"
              value={estatus}
              onChange={(e) => setEstatus(e.target.value)}
            >
              <option value="">(Cualquiera)</option>
              <option value="AgendadaPendPago">AgendadaPendPago</option>
              <option value="PagadaPendAtender">PagadaPendAtender</option>
              <option value="CancelacionSolicitadaDoctor">CancelacionSolicitadaDoctor</option>
              <option value="CanceladaPaciente">CanceladaPaciente</option>
              <option value="CanceladaDoctor">CanceladaDoctor</option>
              <option value="Atendida">Atendida</option>
            </select>
          </div>

          <button className="btn btn-ok" onClick={onBuscar} disabled={buscando}>
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {resultados.length > 0 ? (
          <div className="recep-cancelaciones__tableWrap" style={{ marginTop: 14 }}>
            <table className="recep-cancelaciones__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Doctor</th>
                  <th>Estatus</th>
                  <th>Costo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map(c => (
                  <tr key={c.idCita}>
                    <td>{c.idCita}</td>
                    <td>{fmtFecha(c.fechaHoraInicio)}</td>
                    <td>{c.pacienteNombre}</td>
                    <td>{c.doctorNombre}</td>
                    <td>{c.estatusCita}</td>
                    <td>${Number(c.costo).toFixed(2)}</td>
                    <td className="recep-cancelaciones__actions">
                      {esCancelable(c.estatusCita) ? (
                        <button
                          className="btn btn-bad"
                          disabled={cancelandoId === c.idCita}
                          onClick={() => onCancelarFila(c)}
                        >
                          {cancelandoId === c.idCita ? "Cancelando..." : "Cancelar"}
                        </button>
                      ) : (
                        <span className="recep-cancelaciones__tag recep-cancelaciones__tag--disabled">
                          No cancelable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !buscando && (
            <p style={{ marginTop: 12 }} className="recep-cancelaciones__muted">
              Sin resultados. Usa filtros y presiona Buscar.
            </p>
          )
        )}

      </div>
    </div>
  );
    
}