import { useEffect, useState } from "react";
import { buscarBitacoraRecepcion, BitacoraRow } from "../../../api/bitacoraApi";
import "./BitacoraPage.css";

export default function BitacoraHistorialPage() {
  const [rows, setRows] = useState<BitacoraRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [texto, setTexto] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [estatus, setEstatus] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError(null);

      const data = await buscarBitacoraRecepcion({
        texto: texto.trim() ? texto.trim() : undefined,
        desdeUtc: desde ? new Date(desde).toISOString() : undefined,
        hastaUtc: hasta ? new Date(hasta).toISOString() : undefined,
        estatus: estatus || undefined,
      });

      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar bitácora");
    } finally {
      setLoading(false);
    }
  }

  // carga inicial
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onKeyDownBuscar(e: React.KeyboardEvent) {
    if (e.key === "Enter") cargar();
  }

  return (
    <div className="bitacora-wrap">
      <div className="bitacora-card">
        <div className="bitacora-header">
          <div>
            <h2>Bitácora historial médico de pacientes</h2>
            <p>Filtra por paciente, doctor, folio, fechas y estatus.</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bitacora-filtros">
          <input
            type="text"
            placeholder="Paciente, doctor, folio..."
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

          <div>
            <label>Estatus</label>
            <select value={estatus} onChange={(e) => setEstatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="Atendida">Atendida</option>
              <option value="NoAsistio">No asistió</option>
            </select>
          </div>

          <button onClick={cargar} disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Estados */}
        {error && <p className="error">{error}</p>}

        {/* Tabla */}
        <div className="bitacora-tableWrap">
          {!loading && rows.length > 0 ? (
            <div className="bitacora-tabla">
              <table>
                <thead>
                  <tr>
                    <th>Bitácora</th>
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
                  {rows.map((r) => (
                    <tr key={r.idBitacora}>
                      <td>{r.idBitacora}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}
