import "./RecetaM.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth/AuthContext";
import { listarMedicamentos, type MedicamentoListaDto } from "../../api/medicamentosApi";
import { getPacienteInfo, type PacienteInfo } from "../../api/doctorApi";


interface Elemento {
  id: number;
  nombre: string;
  precio: number;
}

//Cambios

export default function Receta() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { citaId, pacienteId } = location.state || {};

    // Estados para los textareas
    const [diagnostico, setDiagnostico] = useState("");
    const [observaciones, setObservaciones] = useState(""); 

    // Estados para medicamentos
    const [medicamentosDisponibles, setMedicamentosDisponibles] = useState<MedicamentoListaDto[]>([]);
    const [loadingMedicamentos, setLoadingMedicamentos] = useState(false);

    // Estado para paciente
    const [paciente, setPaciente] = useState<PacienteInfo | null>(null);
    const [loadingPaciente, setLoadingPaciente] = useState(false);

    // Lista de prueba
  const elementosDisponibles: Elemento[] = medicamentosDisponibles.map(m => ({
    id: m.idMedicamento,
    nombre: m.descripcion,
    precio: m.precio
  }));

  // Cargar medicamentos al montar el componente
  useEffect(() => {
    const cargarMedicamentos = async () => {
      setLoadingMedicamentos(true);
      try {
        const meds = await listarMedicamentos();
        setMedicamentosDisponibles(meds);
      } catch (error) {
        console.error("Error cargando medicamentos:", error);
      } finally {
        setLoadingMedicamentos(false);
      }
    };
    cargarMedicamentos();
  }, []);

  // Cargar paciente si viene de una cita
  useEffect(() => {
    if (pacienteId) {
      const cargarPaciente = async () => {
        setLoadingPaciente(true);
        try {
          const pac = await getPacienteInfo(pacienteId);
          setPaciente(pac);
        } catch (error) {
          console.error("Error cargando paciente:", error);
        } finally {
          setLoadingPaciente(false);
        }
      };
      cargarPaciente();
    }
  }, [pacienteId]);

  const [lista, setLista] = useState<Elemento[]>([]);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Elemento | null>(null);

  const añadirElemento = () => {
    if (seleccionado) {
      setLista([...lista, seleccionado]);
      setSeleccionado(null); // resetea la selección
      setMostrarSelector(false); // oculta el selector después de añadir
    }
  };




    return(
        <div className="page">
            <div className="carta">
                <h2 className="titulo">Generar Receta Médica (próximamente)</h2>
                <div className="texto">Esta funcionalidad estará disponible cuendo termine de pelearme con la base de datos muchas gracias</div>
                <div className="caja">
                    <div className="caja-campo">
                        <label className="etiqueta">Número de receta</label>
                        {/* Valor estático de ejemplo */}
                        <div className="perfil-field-value">REC-20240601-001</div>
                    </div>
                    <div className="caja-campo">
                        <label className="etiqueta">Nombre del paciente</label>
                        <div className="perfil-field-value">
                          {loadingPaciente ? "Cargando..." : paciente?.nombreCompleto || "Error"}
                        </div> 
                    </div>

                    <div className="caja-campo">
                         {/* Fecha de emisión actual */}
                        <label className="etiqueta">Fecha de emision</label>
                        <div className="perfil-field-value">{new Date().toLocaleDateString('es-ES')}</div>
                    </div>
                    <div className="caja-campo">
                        <label className="etiqueta">Doctor</label>
                        <div className="perfil-field-value">{user?.nombreCompleto}</div>
                    </div>
                </div>

                <label className="titulo-seccion">Diagnóstico</label>
                <textarea 
                    className="area-texto" 
                    placeholder="Escriba el diagnostico"
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                ></textarea>
                <div>
                <label className="titulo-seccion">Medicamentos</label>

                <div className="caja">
                   
                    <div className="caja-campo">
                        {/* Lista final */}
                        <ul>
                        {lista.map((item, i) => (
                            <li key={i} className="perfil-field-value">
                                {item.nombre} - ${item.precio}
                            </li>
                        ))}
                        </ul>
                    </div>

                         <div className="caja-campo">
                        {/* Lista para añadir los medicamentos a la receta*/}

                        {/*Botón inicial */}
                        {!mostrarSelector && (
                        <button onClick={() => setMostrarSelector(true)}>
                            Agregar elemento
                        </button>
                        )}

                        {/*Selector de opciones */}
                        {mostrarSelector && (
                        <div className="caja">
                            {loadingMedicamentos ? (
                                <p>Cargando medicamentos...</p>
                            ) : (
                                <>
                                    <select
                                    value={seleccionado?.id ?? ""}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        const el = elementosDisponibles.find((item) => item.id === id) || null;
                                    setSeleccionado(el);
                                    }}
                                    >
                                        <option value="">-- Seleccionar medicamentos --</option>
                                        {elementosDisponibles.map((el) => (
                                            <option key={el.id} value={el.id}>
                                            {el.nombre} - ${el.precio}
                                            </option>
                                        ))}
                                    </select>

                                    {/*Botón habilitado solo si hay selección */}
                                    <button
                                    onClick={añadirElemento}
                                    disabled={!seleccionado}
                                     className="boton">
                                        Añadir a la lista
                                    </button>
                                </>
                            )}
                        </div>
                        )}
                    </div>

                </div>

                


            
                </div>
                 <label className="titulo-seccion">Observaciones</label>
                <textarea 
                    className="area-texto" 
                    placeholder="Observaciones sobre el paciente"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                ></textarea>

                <button className="boton" disabled>Generar Receta (próximamente)</button>
            </div>
        </div>        
    )

}   

{/*
{/* Receta médica protegida /}
        <Route
          path="/receta"
          element={
            <PrivateRoute>
              <Receta />
            </PrivateRoute>
          }
        />
*/}
