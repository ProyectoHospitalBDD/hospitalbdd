import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecepEmpleadosListPage.css"; 

import {
  getEmpleadosSinHorario,
  asignarHorario,
  type EmpleadoSinHorarioItem
} from "../../../api/recepEmpleadosApi"; 

export default function AsignarHorario() {
  const nav = useNavigate();

  // Estados del Formulario
  const [listaCandidatos, setListaCandidatos] = useState<EmpleadoSinHorarioItem[]>([]);
  const [loadingCarga, setLoadingCarga] = useState(true);

  // Valores seleccionados
  const [selectedId, setSelectedId] = useState<string>("");
  const [patron, setPatron] = useState<"LMV" | "MJS" | "">("");
  const [turno, setTurno] = useState<"Matutino" | "Vespertino" | "">("");

  // Estados de UI
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 1. Cargar empleados disponibles al entrar
  useEffect(() => {
    cargarCandidatos();
  }, []);

  async function cargarCandidatos() {
    try {
      setLoadingCarga(true);
      const data = await getEmpleadosSinHorario();
      setListaCandidatos(data);
    } catch (e: any) {
      setError("Error cargando lista de empleados.");
    } finally {
      setLoadingCarga(false);
    }
  }

  // 2. Manejar el Guardar
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedId || !patron || !turno) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setSubmitting(true);
    try {
      await asignarHorario(Number(selectedId), patron, turno);
      setSuccess(true);
      
      // Limpiamos formulario y recargamos la lista (el empleado asignado desaparecerá)
      setSelectedId("");
      setPatron("");
      setTurno("");
      await cargarCandidatos();

      // Opcional: Redirigir después de unos segundos
      // setTimeout(() => nav("/recep/empleados"), 2000); 

    } catch (e: any) {
      const msg = e?.response?.data?.message || "Error al asignar horario.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="recep-emp-list"> {/* Reusando contenedor */}
      
      {/* HEADER */}
      <div className="recep-emp-list__hero">
        <div>
          <h1>Asignar Horario</h1>
          <p>Define los turnos laborales para empleados nuevos.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => nav(-1)}>
          Regresar
        </button>
      </div>

      {/* FEEDBACK */}
      {error && <div className="recep-emp-list__error">{error}</div>}
      {success && (
        <div className="recep-emp-list__ok">
          ¡Horario asignado correctamente! El empleado ya tiene su agenda lista.
        </div>
      )}

      {/* CARD FORMULARIO */}
      <div className="recep-emp-list__card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        {loadingCarga ? (
          <p>Cargando empleados disponibles...</p>
        ) : listaCandidatos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h3>¡Todo listo!</h3>
            <p>No hay empleados activos pendientes de horario.</p>
            <button className="btn btn-ok" onClick={() => nav("/recep/empleados")}>
              Ir a la lista de empleados
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* 1. SELECCIONAR EMPLEADO */}
            <div className="recep-emp-list__field">
              <label style={{ fontSize: "14px" }}>1. Selecciona al Empleado</label>
              <select 
                className="recep-emp-list__select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
              >
                <option value="">-- Selecciona un empleado --</option>
                {listaCandidatos.map((emp) => (
                  <option key={emp.idUsuario} value={emp.idUsuario}>
                    {emp.nombreCompleto} ({emp.tipoUsuario})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. SELECCIONAR DÍAS */}
            <div className="recep-emp-list__field">
              <label style={{ fontSize: "14px" }}>2. Días Laborales</label>
              <div style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="patron" 
                    value="LMV" 
                    checked={patron === "LMV"} 
                    onChange={() => setPatron("LMV")} 
                  />
                  <span>Lunes, Miércoles y Viernes</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="patron" 
                    value="MJS" 
                    checked={patron === "MJS"} 
                    onChange={() => setPatron("MJS")} 
                  />
                  <span>Martes, Jueves y Sábado</span>
                </label>
              </div>
            </div>

            {/* 3. SELECCIONAR TURNO */}
            <div className="recep-emp-list__field">
              <label style={{ fontSize: "14px" }}>3. Turno</label>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "10px", 
                marginTop: "5px" 
              }}>
                <div 
                  onClick={() => setTurno("Matutino")}
                  style={{
                    border: turno === "Matutino" ? "2px solid #2e6cff" : "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "10px",
                    cursor: "pointer",
                    background: turno === "Matutino" ? "rgba(46,108,255,0.05)" : "#fff"
                  }}
                >
                  <strong>☀️ Matutino</strong>
                  <div style={{ fontSize: "12px", color: "#666" }}>07:00 - 13:00</div>
                  <div style={{ fontSize: "11px", color: "#999" }}>Comida: 10:00 - 11:00</div>
                </div>

                <div 
                  onClick={() => setTurno("Vespertino")}
                  style={{
                    border: turno === "Vespertino" ? "2px solid #2e6cff" : "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "10px",
                    cursor: "pointer",
                    background: turno === "Vespertino" ? "rgba(46,108,255,0.05)" : "#fff"
                  }}
                >
                  <strong>🌙 Vespertino</strong>
                  <div style={{ fontSize: "12px", color: "#666" }}>13:00 - 19:00</div>
                  <div style={{ fontSize: "11px", color: "#999" }}>Comida: 15:00 - 16:00</div>
                </div>
              </div>
            </div>

            {/* BOTÓN SUBMIT */}
            <div style={{ marginTop: "10px" }}>
              <button 
                type="submit" 
                className="btn btn-ok" 
                style={{ width: "100%", padding: "14px", fontSize: "16px" }}
                disabled={submitting}
              >
                {submitting ? "Guardando..." : "Asignar Horario"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}