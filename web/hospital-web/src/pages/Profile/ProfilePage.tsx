import "./ProfilePage.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth/AuthContext"; // Asegúrate de tener este hook o ajusta la importación

import {
  getMiPerfil,
  updateMiPerfil, // Importamos la nueva función
  getMisCitas,
  getMiHistorialMedico,
  saveMiHistorialMedico,
  getCatalogoAlergias,
  getMisAlergias,
  agregarAlergia,
  eliminarAlergia,
  cancelarCita,
  pagarCita,
  type PerfilPaciente,
  type UpdatePerfilDto, // Importamos el DTO
  type CitaPaciente,
  type HistorialMedicoPaciente,
  type AlergiaItem,
  type MiAlergia
} from "../../api/pacienteApi";

type TabKey = "datos" | "citas" | "historial" | "alergias" | "estatus";

function chipClass(estatus: string) {
  const e = (estatus ?? "").toLowerCase();
  if (e.includes("atendida") || e.includes("pagada")) return "perfil-chip perfil-chip--ok";
  if (e.includes("pend")) return "perfil-chip perfil-chip--warn";
  if (e.includes("cancel") || e.includes("no acud")) return "perfil-chip perfil-chip--bad";
  return "perfil-chip";
}

export default function PerfilPage() {
  const nav = useNavigate();
  // Si no tienes useAuth implementado, puedes comentar esta línea y manejar localStorage manualmente en guardarPerfil
  const { logout } = useAuth(); 

  const [tab, setTab] = useState<TabKey>("datos");

  // --- DATOS PERSONALES ---
  const [perfil, setPerfil] = useState<PerfilPaciente | null>(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [formPerfil, setFormPerfil] = useState<UpdatePerfilDto>({
      nombre: "", apPat: "", apMat: "", curp: "", telefono: "", email: ""
  });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  // ------------------------

  // --- HISTORIAL MÉDICO ---
  const [historialMedico, setHistorialMedico] = useState<HistorialMedicoPaciente | null>(null);
  const [editandoHistorial, setEditandoHistorial] = useState(false);
  const [formHistorial, setFormHistorial] = useState<HistorialMedicoPaciente>({
    tipoSangre: "", peso: null, estatura: null
  });
  const [guardandoHistorial, setGuardandoHistorial] = useState(false);
  // ------------------------

  // --- ALERGIAS ---
  const [catalogoAlergias, setCatalogoAlergias] = useState<AlergiaItem[]>([]);
  const [misAlergias, setMisAlergias] = useState<MiAlergia[]>([]);
  const [selectedAlergia, setSelectedAlergia] = useState<string>(""); 
  const [agregandoAlergia, setAgregandoAlergia] = useState(false);
  // ----------------

  // --- CITAS ---
  const [citas, setCitas] = useState<CitaPaciente[]>([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [estatus, setEstatus] = useState<string>("");
  const [desde, setDesde] = useState<string>(""); 
  const [hasta, setHasta] = useState<string>("");
  const [pagandoId, setPagandoId] = useState<number | null>(null);
  // -------------

  // 1. Carga inicial (Perfil y Historial)
  useEffect(() => {
    (async () => {
      const p = await getMiPerfil();
      setPerfil(p);

      const hm = await getMiHistorialMedico();
      setHistorialMedico(hm || { tipoSangre: "", peso: null, estatura: null });
    })();
  }, []);

  // 2. Carga de Alergias (Lazy load al cambiar tab)
  useEffect(() => {
    if (tab === "alergias") {
        cargarDatosAlergias();
    }
  }, [tab]);

  async function cargarDatosAlergias() {
      try {
          const [cat, mis] = await Promise.all([getCatalogoAlergias(), getMisAlergias()]);
          setCatalogoAlergias(cat || []);
          setMisAlergias(mis || []);
      } catch (e) {
          console.error("Error cargando alergias", e);
      }
  }

  // 3. Carga de Citas (Reactiva a filtros)
  useEffect(() => {
    (async () => {
      setCargandoCitas(true);
      try {
        const c = await getMisCitas({ desde: desde || undefined, hasta: hasta || undefined, estatus: estatus || undefined });
        setCitas(c);
      } finally {
        setCargandoCitas(false);
      }
    })();
  }, [desde, hasta, estatus]);

  // ==========================================
  // HANDLERS: PERFIL (DATOS) - INTEGRADO
  // ==========================================
  const iniciarEdicionPerfil = () => {
      if (!perfil) return;
      setFormPerfil({
          nombre: perfil.nombre,
          apPat: perfil.apPat,
          apMat: perfil.apMat,
          curp: perfil.curp,
          telefono: perfil.telefono,
          email: perfil.email
      });
      setEditandoPerfil(true);
  };

  const guardarPerfil = async (e: React.FormEvent) => {
      e.preventDefault();
      setGuardandoPerfil(true);
      try {
          const resp = await updateMiPerfil(formPerfil);
          
          if (resp.requireRelogin) {
              alert(resp.message);
              // Forzar logout si cambió el correo
              if (logout) logout(); 
              else {
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("userRole");
              }
              nav("/login");
              return;
          }

          // Actualizar estado local si no requiere login
          setPerfil(prev => prev ? { 
              ...prev, 
              ...formPerfil,
              nombreCompleto: `${formPerfil.nombre} ${formPerfil.apPat} ${formPerfil.apMat ?? ""}`.trim()
          } : null);
          
          setEditandoPerfil(false);
          alert(resp.message);

      } catch (e: any) {
          alert(e.message || "Error al actualizar perfil.");
      } finally {
          setGuardandoPerfil(false);
      }
  };

  // ==========================================
  // HANDLERS: CITAS
  // ==========================================
  const onCancelar = async (folioCita: number) => {
    await cancelarCita(folioCita);
    const c = await getMisCitas({ desde: desde || undefined, hasta: hasta || undefined, estatus: estatus || undefined });
    setCitas(c);
  };

  const onPagar = async (folioCita: number) => {
    setPagandoId(folioCita);
    try {
      await pagarCita(folioCita);
      const c = await getMisCitas({ desde: desde || undefined, hasta: hasta || undefined, estatus: estatus || undefined });
      setCitas(c);
    } catch (err) {
      alert("Error al pagar");
    } finally {
      setPagandoId(null);
    }
  };

  // ==========================================
  // HANDLERS: HISTORIAL MÉDICO
  // ==========================================
  const iniciarEdicionHistorial = () => {
    setFormHistorial({
      tipoSangre: historialMedico?.tipoSangre || "",
      peso: historialMedico?.peso || null,
      estatura: historialMedico?.estatura || null
    });
    setEditandoHistorial(true);
  };

  const guardarHistorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoHistorial(true);
    try {
        await saveMiHistorialMedico(formHistorial);
        setHistorialMedico(formHistorial);
        setEditandoHistorial(false);
        alert("Historial actualizado.");
    } catch (error) {
        alert("Error al guardar.");
    } finally {
        setGuardandoHistorial(false);
    }
  };

  // ==========================================
  // HANDLERS: ALERGIAS
  // ==========================================
  const handleAgregarAlergia = async () => {
      if (!selectedAlergia) return;
      setAgregandoAlergia(true);
      try {
          await agregarAlergia(Number(selectedAlergia));
          await cargarDatosAlergias();
          setSelectedAlergia("");
      } catch (e: any) {
          alert(e.message || "Error al agregar alergia");
      } finally {
          setAgregandoAlergia(false);
      }
  };

  const handleEliminarAlergia = async (id: number) => {
      if(!confirm("¿Quitar este registro?")) return;
      try {
          await eliminarAlergia(id);
          await cargarDatosAlergias();
      } catch(e: any) {
          alert("Error al eliminar");
      }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  function prioridadEstatus(estatus: string) {
    switch (estatus) {
      case "PagadaPendAtender": return 0;
      case "AgendadaPendPago": return 1;
      default: return 2;
    }
  }
  function tsCita(c: CitaPaciente) {
    const isoLocal = `${c.fecha}T${c.hora}:00`;
    const t = new Date(isoLocal).getTime();
    return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER;
  }
  const citasOrdenadas = useMemo(() => {
    const arr = [...citas];
    arr.sort((a, b) => {
      const pa = prioridadEstatus(a.estatus);
      const pb = prioridadEstatus(b.estatus);
      if (pa !== pb) return pa - pb;
      return tsCita(a) - tsCita(b);
    });
    return arr;
  }, [citas]);


  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <h2 className="perfil-title">Mi perfil</h2>
        <p className="perfil-subtitle">
          Gestiona tu información personal, médica y tus citas.
        </p>

        <div className="perfil-tabs">
          <button className={`perfil-tab ${tab === "datos" ? "perfil-tab--active" : ""}`} onClick={() => setTab("datos")}>Datos</button>
          <button className={`perfil-tab ${tab === "citas" ? "perfil-tab--active" : ""}`} onClick={() => setTab("citas")}>Citas</button>
          <button className={`perfil-tab ${tab === "historial" ? "perfil-tab--active" : ""}`} onClick={() => setTab("historial")}>Historial médico</button>
          <button className={`perfil-tab ${tab === "alergias" ? "perfil-tab--active" : ""}`} onClick={() => setTab("alergias")}>Alergias</button>
          <button className={`perfil-tab ${tab === "estatus" ? "perfil-tab--active" : ""}`} onClick={() => setTab("estatus")}>Estatus</button>
        </div>

        {/* --- TAB DATOS (CON EDICIÓN INTEGRADA) --- */}
        {tab === "datos" && (
          <section className="perfil-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="perfil-section-title">Datos personales</h3>
                {!editandoPerfil && (
                    <button 
                        className="perfil-btn" 
                        style={{ border: '1px solid #0ea5e9', color: '#0ea5e9', fontWeight: 700 }}
                        onClick={iniciarEdicionPerfil}
                    >
                        ✏️ Editar Datos
                    </button>
                )}
            </div>

            {!perfil ? <p>Cargando...</p> : editandoPerfil ? (
                // --- FORMULARIO EDICIÓN PERFIL ---
                <form onSubmit={guardarPerfil} className="perfil-grid" style={{ marginTop: '10px' }}>
                    <div className="perfil-field">
                        <span className="perfil-field-label">Nombre</span>
                        <input className="recep-emp-list__input" style={{ width: '100%', padding: '5px' }} value={formPerfil.nombre} onChange={e => setFormPerfil({...formPerfil, nombre: e.target.value})} required />
                    </div>
                    <div className="perfil-field">
                        <span className="perfil-field-label">Apellido Paterno</span>
                        <input className="recep-emp-list__input" style={{ width: '100%', padding: '5px' }} value={formPerfil.apPat} onChange={e => setFormPerfil({...formPerfil, apPat: e.target.value})} required />
                    </div>
                    <div className="perfil-field">
                        <span className="perfil-field-label">Apellido Materno</span>
                        <input className="recep-emp-list__input" style={{ width: '100%', padding: '5px' }} value={formPerfil.apMat || ""} onChange={e => setFormPerfil({...formPerfil, apMat: e.target.value})} />
                    </div>
                    {/* Campo CURP */}
                    <div className="perfil-field">
                        <span className="perfil-field-label">CURP</span>
                        <input className="recep-emp-list__input" style={{ width: '100%', padding: '5px' }} value={formPerfil.curp} onChange={e => setFormPerfil({...formPerfil, curp: e.target.value})} required maxLength={18} />
                    </div>
                    <div className="perfil-field">
                        <span className="perfil-field-label">Teléfono</span>
                        <input className="recep-emp-list__input" style={{ width: '100%', padding: '5px' }} value={formPerfil.telefono || ""} onChange={e => setFormPerfil({...formPerfil, telefono: e.target.value})} />
                    </div>
                    <div className="perfil-field" style={{ gridColumn: '1 / -1' }}>
                        <span className="perfil-field-label" style={{ color: '#e11d48' }}>Correo Electrónico (Requiere re-login si cambia)</span>
                        <input type="email" className="recep-emp-list__input" style={{ width: '100%', padding: '5px', borderColor: '#e11d48' }} value={formPerfil.email || ""} onChange={e => setFormPerfil({...formPerfil, email: e.target.value})} required />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="perfil-btn perfil-btn--primary" disabled={guardandoPerfil}>{guardandoPerfil ? "Guardando..." : "Guardar Cambios"}</button>
                        <button type="button" className="perfil-btn perfil-btn--danger" onClick={() => setEditandoPerfil(false)} disabled={guardandoPerfil}>Cancelar</button>
                    </div>
                </form>
            ) : (
              // --- VISTA LECTURA DATOS ---
              <div className="perfil-grid">
                <div className="perfil-field"><span className="perfil-field-label">Nombre Completo</span><div className="perfil-field-value">{perfil.nombreCompleto}</div></div>
                <div className="perfil-field"><span className="perfil-field-label">CURP</span><div className="perfil-field-value">{perfil.curp}</div></div>
                <div className="perfil-field"><span className="perfil-field-label">Teléfono</span><div className="perfil-field-value">{perfil.telefono ?? "—"}</div></div>
                <div className="perfil-field"><span className="perfil-field-label">Email</span><div className="perfil-field-value">{perfil.email ?? "—"}</div></div>
              </div>
            )}
          </section>
        )}

        {/* --- TAB CITAS --- */}
        {tab === "citas" && (
          <section className="perfil-section">
            <h3 className="perfil-section-title">Historial de citas</h3>
            <div className="perfil-grid" style={{ marginBottom: 12 }}>
              <div className="perfil-field"><span className="perfil-field-label">Desde</span><input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
              <div className="perfil-field"><span className="perfil-field-label">Hasta</span><input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></div>
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
            {cargandoCitas && <p style={{ color: "#475569" }}>Cargando...</p>}
            <div className="perfil-table-wrap">
              <table className="perfil-table">
                <thead>
                  <tr>
                    <th>Folio</th><th>Fecha</th><th>Hora</th><th>Doctor</th><th>Especialidad</th><th>Consultorio</th><th>Estatus</th><th></th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {citasOrdenadas.map((c) => (
                    <tr key={c.folioCita}>
                      <td>{c.folioCita}</td><td>{c.fecha}</td><td>{c.hora}</td><td>{c.doctor}</td><td>{c.especialidad}</td><td>{c.consultorio}</td>
                      <td><span className={chipClass(c.estatus)}>{c.estatus}</span></td>
                      <td>{c.puedeCancelar ? <button className="perfil-btn perfil-btn--danger" onClick={() => onCancelar(c.folioCita)}>Cancelar</button> : <span style={{opacity:0.6}}>—</span>}</td>
                      <td>{c.estatus === "AgendadaPendPago" ? <button className="perfil-btn perfil-btn--primary" disabled={pagandoId === c.folioCita} onClick={() => onPagar(c.folioCita)}>{pagandoId === c.folioCita ? "..." : "Pagar"}</button> : <span style={{opacity:0.6}}>—</span>}</td>
                    </tr>
                  ))}
                  {!cargandoCitas && citas.length === 0 && <tr><td colSpan={9} style={{ padding: 16 }}>No hay citas.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- TAB HISTORIAL --- */}
        {tab === "historial" && (
          <section className="perfil-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="perfil-section-title">Historial médico</h3>
                {!editandoHistorial && <button className="perfil-btn" style={{ border: '1px solid #0ea5e9', color: '#0ea5e9', fontWeight: 700 }} onClick={iniciarEdicionHistorial}>✏️ Editar / Crear Datos</button>}
            </div>
            {!historialMedico && !editandoHistorial ? <p>Cargando...</p> : editandoHistorial ? (
              <form onSubmit={guardarHistorial} className="perfil-grid" style={{ marginTop: '10px' }}>
                  <div className="perfil-field">
                    <span className="perfil-field-label">Tipo de sangre</span>
                    <select className="recep-emp-list__input" style={{ width: '100%', padding: '5px' }} value={formHistorial.tipoSangre} onChange={e => setFormHistorial({...formHistorial, tipoSangre: e.target.value})}>
                        <option value="">-- Seleccionar --</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(ts => <option key={ts} value={ts}>{ts}</option>)}
                    </select>
                  </div>
                  <div className="perfil-field"><span className="perfil-field-label">Peso (kg)</span><input type="number" step="0.1" style={{ width: '100%', padding: '5px' }} value={formHistorial.peso || ""} onChange={e => setFormHistorial({...formHistorial, peso: parseFloat(e.target.value)})} /></div>
                  <div className="perfil-field"><span className="perfil-field-label">Estatura (m)</span><input type="number" step="0.01" style={{ width: '100%', padding: '5px' }} value={formHistorial.estatura || ""} onChange={e => setFormHistorial({...formHistorial, estatura: parseFloat(e.target.value)})} /></div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" className="perfil-btn perfil-btn--primary" disabled={guardandoHistorial}>{guardandoHistorial ? "Guardando..." : "Guardar"}</button>
                      <button type="button" className="perfil-btn perfil-btn--danger" onClick={() => setEditandoHistorial(false)} disabled={guardandoHistorial}>Cancelar</button>
                  </div>
              </form>
            ) : (
              <div className="perfil-grid">
                <div className="perfil-field"><span className="perfil-field-label">Tipo de sangre</span><div className="perfil-field-value">{historialMedico?.tipoSangre || "—"}</div></div>
                <div className="perfil-field"><span className="perfil-field-label">Peso</span><div className="perfil-field-value">{historialMedico?.peso ? `${historialMedico.peso} kg` : "—"}</div></div>
                <div className="perfil-field"><span className="perfil-field-label">Estatura</span><div className="perfil-field-value">{historialMedico?.estatura ? `${historialMedico.estatura} m` : "—"}</div></div>
              </div>
            )}
          </section>
        )}

        {/* --- TAB ALERGIAS --- */}
        {tab === "alergias" && (
            <section className="perfil-section">
                <h3 className="perfil-section-title">Mis Alergias y Padecimientos</h3>
                <div className="perfil-field" style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <span className="perfil-field-label" style={{ marginBottom: '8px' }}>Agregar nuevo:</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }} value={selectedAlergia} onChange={(e) => setSelectedAlergia(e.target.value)}>
                            <option value="">-- Selecciona --</option>
                            {catalogoAlergias.map(a => <option key={a.idAlerPade} value={a.idAlerPade}>{a.nombre} ({a.tipo})</option>)}
                        </select>
                        <button className="perfil-btn perfil-btn--primary" disabled={!selectedAlergia || agregandoAlergia} onClick={handleAgregarAlergia}>{agregandoAlergia ? "..." : "Agregar"}</button>
                    </div>
                </div>
                {misAlergias.length === 0 ? <p style={{ color: "#64748b" }}>No tienes registros.</p> : (
                    <div className="perfil-grid">
                        {misAlergias.map(ma => (
                            <div key={ma.idAlerPade} className="perfil-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span className="perfil-field-label" style={{color: ma.tipo === 'Alergia' ? '#ef4444' : '#f59e0b'}}>{ma.tipo}</span>
                                    <div className="perfil-field-value">{ma.nombre}</div>
                                </div>
                                <button className="perfil-btn perfil-btn--danger" onClick={() => handleEliminarAlergia(ma.idAlerPade)}>Eliminar</button>
                            </div>
                        ))}
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

  if (!citas.length) return <p style={{ color: "#475569" }}>No hay citas.</p>;

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