import "./RecetaM.css";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth/AuthContext";
import { listarMedicamentos, type MedicamentoListaDto } from "../../api/medicamentosApi";
import { getPacienteInfo, type PacienteInfo } from "../../api/doctorApi";
import { listarServicios, type ServicioDto } from "../../api/servicios";
import { crearReceta, type CrearRecetaDto } from "../../api/recetasApi";


interface MedicamentoEnReceta {
  idMedicamento: number;
  descripcion: string;
  precio: number;
  cantidad: number;
  indicaciones: string;
}

interface ServicioEnReceta {
  idServicio: number;
  descripcion: string;
  precio: number;
  indicaciones: string;
}

export default function Receta() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { citaId, pacienteId } = location.state || {};

    // Estados para los textareas
    const [diagnostico, setDiagnostico] = useState("");
    const [observaciones, setObservaciones] = useState(""); 

    // Estados para medicamentos
    const [medicamentosDisponibles, setMedicamentosDisponibles] = useState<MedicamentoListaDto[]>([]);
    const [loadingMedicamentos, setLoadingMedicamentos] = useState(false);

    // Estados para servicios
    const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioDto[]>([]);
    const [loadingServicios, setLoadingServicios] = useState(false);

    // Estado para generar receta
    const [generandoReceta, setGenerandoReceta] = useState(false);

    // Estado para paciente
    const [paciente, setPaciente] = useState<PacienteInfo | null>(null);
    const [loadingPaciente, setLoadingPaciente] = useState(false);

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

  // Cargar servicios al montar el componente
  useEffect(() => {
    const cargarServicios = async () => {
      setLoadingServicios(true);
      try {
        const servs = await listarServicios();
        setServiciosDisponibles(servs);
      } catch (error) {
        console.error("Error cargando servicios:", error);
      } finally {
        setLoadingServicios(false);
      }
    };
    cargarServicios();
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

  const [lista, setLista] = useState<MedicamentoEnReceta[]>([]);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [seleccionado, setSeleccionado] = useState<MedicamentoListaDto | null>(null);
  const [busquedaMedicamento, setBusquedaMedicamento] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const [mostrarSercios , setMostrarServicios] = useState(false);

  // Estados para servicios
  const [listaServicios, setListaServicios] = useState<ServicioEnReceta[]>([]);
  const [mostrarSelectorServicios, setMostrarSelectorServicios] = useState(false);
  const [seleccionadoServicio, setSeleccionadoServicio] = useState<ServicioDto | null>(null);
  const [busquedaServicio, setBusquedaServicio] = useState("");
  const [mostrarListaServicios, setMostrarListaServicios] = useState(false);

  const añadirElemento = () => {
    if (seleccionado) {
      const nuevo: MedicamentoEnReceta = {
        idMedicamento: seleccionado.idMedicamento,
        descripcion: seleccionado.descripcion,
        precio: seleccionado.precio,
        cantidad: 1,
        indicaciones: ""
      };
      setLista([...lista, nuevo]);
      setSeleccionado(null); // resetea la selección
      setMostrarSelector(false); // oculta el selector después de añadir
      setBusquedaMedicamento(""); // limpiar búsqueda
      setMostrarLista(false); // ocultar lista
    }
  };

  const añadirServicio = () => {
    if (seleccionadoServicio) {
      const nuevo: ServicioEnReceta = {
        idServicio: seleccionadoServicio.idServicio,
        descripcion: seleccionadoServicio.descripcion,
        precio: seleccionadoServicio.precio,
        indicaciones: ""
      };
      setListaServicios([...listaServicios, nuevo]);
      setSeleccionadoServicio(null);
      setMostrarSelectorServicios(false);
      setBusquedaServicio("");
      setMostrarListaServicios(false);
    }
  };

  const cancelarSeleccionServicio = () => {
    setSeleccionadoServicio(null);
    setMostrarSelectorServicios(false);
    setBusquedaServicio("");
    setMostrarListaServicios(false);
  };

  const cancelarSeleccionMedicamento = () => {
    setSeleccionado(null);
    setMostrarSelector(false);
    setBusquedaMedicamento("");
    setMostrarLista(false);
  };

  const generarReceta = async () => {
    if (!citaId) {
      alert("No hay cita asociada");
      return;
    }

    setGenerandoReceta(true);
    try {
      const dto: CrearRecetaDto = {
        idCita: citaId,
        fechaReceta: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        diagnostico: diagnostico || undefined,
        observaciones: observaciones || undefined,
        medicamentos: lista.map(m => ({
          idMedicamento: m.idMedicamento,
          indicaciones: m.indicaciones,
          cantidad: m.cantidad
        })),
        servicios: listaServicios.map(s => ({
          idServicio: s.idServicio,
          indicaciones: s.indicaciones
        }))
      };

      const result = await crearReceta(dto);
      alert(`Receta generada con ID: ${result.idRecetaGenerado}`);
      
      // Preparar datos para el comprobante
      const datosReceta = {
        idReceta: result.idRecetaGenerado,
        paciente: paciente?.nombreCompleto || "Paciente",
        doctor: user?.nombreCompleto || "Doctor",
        fecha: new Date().toLocaleDateString('es-ES'),
        diagnostico: diagnostico || undefined,
        observaciones: observaciones || undefined,
        medicamentos: lista.map(m => ({
          descripcion: m.descripcion,
          precio: m.precio,
          cantidad: m.cantidad,
          indicaciones: m.indicaciones
        })),
        servicios: listaServicios.map(s => ({
          descripcion: s.descripcion,
          precio: s.precio,
          indicaciones: s.indicaciones
        }))
      };
      
      // Navegar al comprobante
      navigate('/comprobante-receta', { state: { datosReceta } });
    } catch (error) {
      console.error("Error generando receta:", error);
      alert("Error al generar la receta");
    } finally {
      setGenerandoReceta(false);
    }
  };

  // Filtrar medicamentos por búsqueda
  const medicamentosFiltrados = useMemo(() => {
    if (!busquedaMedicamento.trim()) return [];
    return medicamentosDisponibles.filter(m =>
      m.descripcion.toLowerCase().includes(busquedaMedicamento.toLowerCase())
    ).slice(0, 10); // limitar a 10 resultados
  }, [medicamentosDisponibles, busquedaMedicamento]);

  // Filtrar servicios por búsqueda
  const serviciosFiltrados = useMemo(() => {
    if (!busquedaServicio.trim()) return [];
    return serviciosDisponibles.filter(s =>
      s.descripcion.toLowerCase().includes(busquedaServicio.toLowerCase())
    ).slice(0, 10); // limitar a 10 resultados
  }, [serviciosDisponibles, busquedaServicio]);




    return(
        <div className="page">
            <div className="carta">
                <h2 className="titulo">Generar Receta Médica (próximamente)</h2>
                <div className="texto">Esta funcionalidad estará disponible cuendo termine de pelearme con la base de datos muchas gracias</div>
                <div className="caja">
                    <div className="caja-campo">
                        <label className="etiqueta">Número de cita</label>
                        <div className="perfil-field-value">{citaId}</div>
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
                <div className="espacio">
                <label className="titulo-seccion">Medicamentos</label>

                <div className="caja">
                   
                    <div className="caja-campo">
                        {/* Lista final */}
                        {lista.map((item, i) => (
                            <div key={i} className="perfil-field-value" style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
                                <div>{item.descripcion} - ${item.precio}</div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                    <label>
                                        Cantidad:
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={(e) => {
                                                const nuevaLista = [...lista];
                                                nuevaLista[i].cantidad = parseInt(e.target.value) || 1;
                                                setLista(nuevaLista);
                                            }}
                                            style={{ width: '60px', marginLeft: '5px' }}
                                        />
                                    </label>
                                    <label>
                                        Indicaciones:
                                        <textarea
                                            value={item.indicaciones}
                                            onChange={(e) => {
                                                const nuevaLista = [...lista];
                                                nuevaLista[i].indicaciones = e.target.value;
                                                setLista(nuevaLista);
                                            }}
                                            style={{ width: '200px', marginLeft: '5px' }}
                                            rows={2}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                         <div className="caja-campo">
                        {/* Lista para añadir los medicamentos a la receta*/}

                        {/*Botón inicial */}
                        {!mostrarSelector && (
                        <button onClick={() => setMostrarSelector(true)} className="boton2">
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
                                    <input
                                    type="text"
                                    placeholder="Buscar medicamento..."
                                    value={busquedaMedicamento}
                                    onChange={(e) => {
                                      setBusquedaMedicamento(e.target.value);
                                      setMostrarLista(true);
                                    }}
                                    className="buscador-medicamentos"
                                    />
                                    

                                    {/*Botones para agregar y cancelar */}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                        onClick={añadirElemento}
                                        disabled={!seleccionado}
                                         className="boton">
                                            Añadir a la receta
                                        </button>
                                        <button
                                        onClick={cancelarSeleccionMedicamento}
                                        className="boton2">
                                            Cancelar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        )}

                        {mostrarLista && medicamentosFiltrados.length > 0 && (
                                    <ul className="lista">
                                        {medicamentosFiltrados.map((m) => (
                                        <li 
                                            className="lista-medicamentos"
                                          key={m.idMedicamento} 
                                          onClick={() => {
                                            setSeleccionado(m);
                                            setBusquedaMedicamento(m.descripcion);
                                            setMostrarLista(false);
                                          }}
                                        >
                                            {m.descripcion} - ${m.precio}
                                        </li>
                                        ))}
                                    </ul>
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
                <div className="espacio">
                  <label className="titulo-seccion">Servicios</label>
                <div className="caja">
                    <div className="caja-campo">
                        {/* Lista final de servicios */}
                        {listaServicios.map((item, i) => (
                            <div key={i} className="perfil-field-value" style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
                                <div>{item.descripcion} - ${item.precio}</div>
                                <div style={{ marginTop: '5px' }}>
                                    <label>
                                        Indicaciones:
                                        <textarea
                                            value={item.indicaciones}
                                            onChange={(e) => {
                                                const nuevaLista = [...listaServicios];
                                                nuevaLista[i].indicaciones = e.target.value;
                                                setListaServicios(nuevaLista);
                                            }}
                                            style={{ width: '100%', marginLeft: '5px' }}
                                            rows={2}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="caja-campo">
                        {/* Selector de servicios */}
                        {mostrarSelectorServicios && (
                        <div className="caja">
                            {loadingServicios ? (
                                <p>Cargando servicios...</p>
                            ) : (
                                <>
                                    <input
                                    type="text"
                                    placeholder="Buscar servicio..."
                                    value={busquedaServicio}
                                    onChange={(e) => {
                                      setBusquedaServicio(e.target.value);
                                      setMostrarListaServicios(true);
                                    }}
                                    className="buscador-medicamentos"
                                    />
                                    
                                    {/* Botones para agregar y cancelar */}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                        onClick={añadirServicio}
                                        disabled={!seleccionadoServicio}
                                        className="boton">
                                            Agregar Servicio
                                        </button>
                                        <button
                                        onClick={cancelarSeleccionServicio}
                                        className="boton2">
                                            Cancelar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        )}

                        {mostrarListaServicios && serviciosFiltrados.length > 0 && (
                                    <ul className="lista">
                                        {serviciosFiltrados.map((s) => (
                                        <li 
                                            className="lista-medicamentos"
                                          key={s.idServicio} 
                                          onClick={() => {
                                            setSeleccionadoServicio(s);
                                            setBusquedaServicio(s.descripcion);
                                            setMostrarListaServicios(false);
                                          }}
                                        >
                                            {s.descripcion} - ${s.precio}
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                    </div>
                </div>
                <button className="boton" onClick={() => setMostrarSelectorServicios(true)}>Añadir Servicio</button>
                </div>

                <button className="boton" onClick={generarReceta} disabled={generandoReceta}>
                    {generandoReceta ? "Generando..." : "Generar Receta"}
                </button>
            </div>
        </div>        
    )

}   


