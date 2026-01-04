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
  
  // Estado para filtrado local en el select
  const [busqueda, setBusqueda] = useState("");

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
      // Traemos todos los pendientes. Si fueran miles, usaríamos paginación/búsqueda backend.
      const data = await getEmpleadosSinHorario();
      setListaCandidatos(data);
    } catch (e: any) {
      setError("Error cargando lista de empleados.");
    } finally {
      setLoadingCarga(false);
    }
  }

  // Filtrado local para el select
  const candidatosFiltrados = listaCandidatos.filter(emp => 
    busqueda === "" || 
    emp.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.curp.toLowerCase().includes(busqueda.toLowerCase())
  );

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
      
      // Limpiamos formulario
      setSelectedId("");
      setPatron("");
      setTurno("");
      setBusqueda(""); // Limpiar búsqueda
      
      // Recargamos la lista (el empleado asignado desaparecerá)
      await cargarCandidatos();

    } catch (e: any) {
      const msg = e?.response?.data?.message || "Error al asignar horario.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="recep-emp-list"> 
      
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
              
              {/* Buscador auxiliar */}
              <input 
                type="text" 
                placeholder="🔍 Buscar por nombre o CURP..."
                className="recep-emp-list__input"
                style={{ marginBottom: '5px', fontSize: '13px' }}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <select 
                className="recep-emp-list__select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
                size={5} // Mostrar como lista desplegada para ver más opciones
                style={{ height: '120px', overflowY: 'auto' }}
              >
                {candidatosFiltrados.length === 0 ? (
                    <option value="" disabled>No se encontraron coincidencias</option>
                ) : (
                    candidatosFiltrados.map((emp) => (
                      <option key={emp.idUsuario} value={emp.idUsuario} style={{ padding: '5px' }}>
                        {emp.nombreCompleto} ({emp.tipoUsuario}) — CURP: {emp.curp}
                      </option>
                    ))
                )}
              </select>
              <div style={{ fontSize: '11px', color: '#666', textAlign: 'right' }}>
                  {selectedId ? "✅ Empleado seleccionado" : "👆 Haz clic en un empleado de la lista"}
              </div>
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