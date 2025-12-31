// pages/Perfil/PerfilPage.tsx
import "./ProfilePage.css";
import { useEffect, useMemo, useState } from "react";
import {
  getMiPerfil,
  getMisCitas,
  getMiHistorialMedico,
  cancelarCita,
  pagarCita,
  type PerfilPaciente,
  type CitaPaciente,
  type HistorialMedicoPaciente,
} from "../../api/pacienteApi";

type TabKey = "datos" | "citas" | "historial" | "estatus";

function chipClass(estatus: string) {
  const e = (estatus ?? "").toLowerCase();

  if (e.includes("atendida") || e.includes("pagada")) return "perfil-chip perfil-chip--ok";
  if (e.includes("pend")) return "perfil-chip perfil-chip--warn";
  if (e.includes("cancel") || e.includes("no acud")) return "perfil-chip perfil-chip--bad";

  return "perfil-chip";
}

export default function PerfilPage() {
  const [tab, setTab] = useState<TabKey>("datos");

  const [perfil, setPerfil] = useState<PerfilPaciente | null>(null);
  const [historialMedico, setHistorialMedico] = useState<HistorialMedicoPaciente | null>(null);

  const [citas, setCitas] = useState<CitaPaciente[]>([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);

  const [estatus, setEstatus] = useState<string>("");
  const [desde, setDesde] = useState<string>(""); // YYYY-MM-DD
  const [hasta, setHasta] = useState<string>("");

  const [pagandoId, setPagandoId] = useState<number | null>(null);

  // 1) Perfil + historial médico: solo al montar
  useEffect(() => {
    (async () => {
      const p = await getMiPerfil();
      setPerfil(p);

      const hm = await getMiHistorialMedico();
      setHistorialMedico(hm);
    })();
  }, []);

  // 2) Citas: se recargan cada vez que cambian los filtros
  useEffect(() => {
    (async () => {
      setCargandoCitas(true);
      try {
        const c = await getMisCitas({
          desde: desde || undefined,
          hasta: hasta || undefined,
          estatus: estatus || undefined,
        });
        setCitas(c);
      } finally {
        setCargandoCitas(false);
      }
    })();
  }, [desde, hasta, estatus]);

  const onCancelar = async (folioCita: number) => {
    await cancelarCita(folioCita);

    // recargar respetando filtros actuales
    setCargandoCitas(true);
    try {
      const c = await getMisCitas({
        desde: desde || undefined,
        hasta: hasta || undefined,
        estatus: estatus || undefined,
      });
      setCitas(c);
    } finally {
      setCargandoCitas(false);
    }
  };

  const onPagar = async (folioCita: number) => {
  console.log("CLICK pagar", folioCita);
  setPagandoId(folioCita);
    try {
      console.log("antes pagarCita()");
      await pagarCita(folioCita);
      console.log("después pagarCita()");

      setCargandoCitas(true);
      try {
        const c = await getMisCitas({ desde: desde || undefined, hasta: hasta || undefined, estatus: estatus || undefined });
        setCitas(c);
        console.log("recargadas", c.length);
      } finally {
        setCargandoCitas(false);
      }
    } catch (err) {
      console.error("ERROR pagando:", err);
      alert("Falló el pago (mira consola/network)");
    } finally {
      setPagandoId(null);
    }
  };


  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <h2 className="perfil-title">Mi perfil</h2>
        <p className="perfil-subtitle">
          Aquí puedes ver tus datos personales, tu historial de citas y tu información médica.
        </p>

        <div className="perfil-tabs">
          <button
            className={`perfil-tab ${tab === "datos" ? "perfil-tab--active" : ""}`}
            onClick={() => setTab("datos")}
          >
            Datos
          </button>
          <button
            className={`perfil-tab ${tab === "citas" ? "perfil-tab--active" : ""}`}
            onClick={() => setTab("citas")}
          >
            Citas
          </button>
          <button
            className={`perfil-tab ${tab === "historial" ? "perfil-tab--active" : ""}`}
            onClick={() => setTab("historial")}
          >
            Historial médico
          </button>
          <button
            className={`perfil-tab ${tab === "estatus" ? "perfil-tab--active" : ""}`}
            onClick={() => setTab("estatus")}
          >
            Estatus
          </button>
        </div>

        {tab === "datos" && (
          <section className="perfil-section">
            <h3 className="perfil-section-title">Datos personales</h3>

            {!perfil ? (
              <p>Cargando…</p>
            ) : (
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
                  <span className="perfil-field-label">Teléfono</span>
                  <div className="perfil-field-value">{perfil.telefono ?? "—"}</div>
                </div>

                <div className="perfil-field">
                  <span className="perfil-field-label">Email</span>
                  <div className="perfil-field-value">{perfil.email ?? "—"}</div>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "citas" && (
          <section className="perfil-section">
            <h3 className="perfil-section-title">Historial de citas</h3>

            {/* filtros */}
            <div className="perfil-grid" style={{ marginBottom: 12 }}>
              <div className="perfil-field">
                <span className="perfil-field-label">Desde</span>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>

              <div className="perfil-field">
                <span className="perfil-field-label">Hasta</span>
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>

              <div className="perfil-field" style={{ gridColumn: "1 / -1" }}>
                <span className="perfil-field-label">Estatus</span>
                <select value={estatus} onChange={(e) => setEstatus(e.target.value)}>
                  <option value="">(Todos)</option>
                  <option value="AgendadaPendPago">Agendada pendiente de pago</option>
                  <option value="PagadaPendAtender">Pagada pendiente por atender</option>
                  <option value="Atendida">Atendida</option>
                  <option value="CanceladaPaciente">Cancelada Paciente</option>
                  <option value="CanceladaFaltaPago">Cancelada Falta de pago</option>
                  <option value="CanceladaDoctor">Cancelada Doctor</option>
                  <option value="NoAcudio">No acudió</option>
                </select>
              </div>
            </div>

            {cargandoCitas && <p style={{ color: "#475569", marginTop: 0 }}>Cargando citas…</p>}

            <div className="perfil-table-wrap">
              <table className="perfil-table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Doctor</th>
                    <th>Especialidad</th>
                    <th>Consultorio</th>
                    <th>Estatus</th>
                    <th></th> {/* Cancelar */}
                    <th></th> {/* Pagar */}
                  </tr>
                </thead>
                <tbody>
                  {citas.map((c) => (
                    <tr key={c.folioCita}>
                      <td>{c.folioCita}</td>
                      <td>{c.fecha}</td>
                      <td>{c.hora}</td>
                      <td>{c.doctor}</td>
                      <td>{c.especialidad}</td>
                      <td>{c.consultorio}</td>
                      <td>
                        <span className={chipClass(c.estatus)}>{c.estatus}</span>
                      </td>
                      <td>
                        {c.puedeCancelar ? (
                          <button className="perfil-btn perfil-btn--danger" onClick={() => onCancelar(c.folioCita)}>
                            Cancelar
                          </button>
                        ) : (
                          <span style={{ opacity: 0.6 }}>—</span>
                        )}
                      </td>
                      <td>
                        {c.estatus === "AgendadaPendPago" ? (
                          <button
                            className="perfil-btn perfil-btn--primary"
                            disabled={pagandoId === c.folioCita}
                            onClick={() => onPagar(c.folioCita)}
                          >
                            {pagandoId === c.folioCita ? "Pagando…" : "Pagar"}
                          </button>
                        ) : (
                          <span style={{ opacity: 0.6 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {!cargandoCitas && citas.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: 16, color: "#475569" }}>
                        No hay citas con esos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "historial" && (
          <section className="perfil-section">
            <h3 className="perfil-section-title">Historial médico</h3>

            {!historialMedico ? (
              <p>Cargando…</p>
            ) : (
              <div className="perfil-grid">
                <div className="perfil-field">
                  <span className="perfil-field-label">Tipo de sangre</span>
                  <div className="perfil-field-value">{historialMedico.tipoSangre || "—"}</div>
                </div>

                <div className="perfil-field">
                  <span className="perfil-field-label">Peso</span>
                  <div className="perfil-field-value">
                    {historialMedico.peso != null ? `${historialMedico.peso} kg` : "—"}
                  </div>
                </div>

                <div className="perfil-field">
                  <span className="perfil-field-label">Estatura</span>
                  <div className="perfil-field-value">
                    {historialMedico.estatura != null ? `${historialMedico.estatura} m` : "—"}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "estatus" && (
          <section className="perfil-section">
            <h3 className="perfil-section-title">Estatus</h3>
            <p style={{ color: "#475569", marginTop: 0 }}>
              Resumen rápido basado en tus citas.
            </p>

            <EstatusResumen citas={citas} />
          </section>
        )}
      </div>
    </div>
  );
}

function EstatusResumen({ citas }: { citas: CitaPaciente[] }) {
  const conteo = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of citas) m.set(c.estatus, (m.get(c.estatus) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [citas]);

  if (!citas.length) {
    return <p style={{ color: "#475569" }}>No hay citas registradas.</p>;
  }

  return (
    <div className="perfil-grid">
      {conteo.map(([est, n]) => (
        <div key={est} className="perfil-field">
          <span className="perfil-field-label">{est}</span>
          <div className="perfil-field-value">{n}</div>
        </div>
      ))}
    </div>
  );
}
