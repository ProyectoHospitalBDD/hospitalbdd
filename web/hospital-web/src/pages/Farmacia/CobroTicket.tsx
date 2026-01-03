import React, { useState, useEffect } from "react";
import { getHistorialCaja, CobroItemDto } from "../../api/caja";
import "./CobroTicket.css";

// --- ÍCONOS SVG NATIVOS ---
const PrinterIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const UserIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const ChevronRightIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const ArrowLeftIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

interface PacienteResumen {
    nombre: string;
    total: number;
    movimientos: CobroItemDto[];
}

export default function CobroTicket() {
  const [items, setItems] = useState<CobroItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para la navegación (Vista General o Detalle Paciente)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteResumen | null>(null);

  // Filtros
  const today = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(today);
  
  // Filtro de tipo visual
  const [filtroTipo, setFiltroTipo] = useState<"Todos" | "Cita" | "Farmacia">("Todos");

  useEffect(() => {
    cargarDatos();
    setPacienteSeleccionado(null); // Reset al cambiar fecha
  }, [fecha]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const datos = await getHistorialCaja(fecha, fecha);
      setItems(datos);
    } catch (error) {
      console.error("Error al cargar caja:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado
  const itemsFiltrados = items.filter(item => {
    if (filtroTipo === "Todos") return true;
    if (filtroTipo === "Farmacia") return item.origen.includes("Farmacia"); // Incluye "Farmacia" y "Farmacia Web"
    return item.origen === filtroTipo;
  });

  // 1. Agrupar movimientos por Paciente
  const pacientesAgrupados = React.useMemo(() => {
    const grupos: Record<string, PacienteResumen> = {};
    
    itemsFiltrados.forEach(item => {
        if (!grupos[item.paciente]) {
            grupos[item.paciente] = { nombre: item.paciente, total: 0, movimientos: [] };
        }
        grupos[item.paciente].movimientos.push(item);
        if (item.esPagado) {
            grupos[item.paciente].total += item.montoTotal;
        }
    });

    return Object.values(grupos).sort((a, b) => b.total - a.total); // Ordenar por quien pagó más
  }, [itemsFiltrados]);

  const totalDia = itemsFiltrados
    .filter(i => i.esPagado)
    .reduce((acc, curr) => acc + curr.montoTotal, 0);


  // --- GENERAR TICKET FINAL (PDF) ---
  const imprimirTicketFinal = (paciente: PacienteResumen) => {
    const fechaImpresion = new Date().toLocaleString('es-MX');
    
    let filasHtml = '';
    paciente.movimientos.forEach(mov => {
        if(mov.esPagado) {
            filasHtml += `
                <tr>
                    <td>${mov.origen} #${mov.idReferencia}</td>
                    <td>${mov.concepto}</td>
                    <td class="text-right">$${mov.montoTotal.toFixed(2)}</td>
                </tr>
            `;
        }
    });

    const html = `
      <html>
        <head>
          <title>Ticket Final - ${paciente.nombre}</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 20px; color: #000; max-width: 350px; }
            .center { text-align: center; }
            h2 { margin: 5px 0; text-transform: uppercase; font-size: 1.1rem; color: #27ae60; }
            p { margin: 2px 0; font-size: 0.85rem; }
            hr { border: 0.5px dashed #000; margin: 10px 0; }
            table { width: 100%; font-size: 0.85rem; border-collapse: collapse; margin-top: 10px; }
            td { padding: 4px 0; vertical-align: top; }
            .text-right { text-align: right; }
            .total-section { margin-top: 15px; font-size: 1.1rem; font-weight: bold; text-align: right; border-top: 1px dashed #333; padding-top: 5px; color: #27ae60; }
            .footer { margin-top: 20px; font-size: 0.75rem; text-align: center; color: #666; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="center">
            <h2>Hospital PoliMed</h2>
            <p>Comprobante de Pago Consolidado</p>
            <p>Blvd. Salud #123, Ciudad</p>
          </div>
          <hr/>
          <p><strong>Fecha:</strong> ${fechaImpresion}</p>
          <p><strong>Paciente:</strong> ${paciente.nombre}</p>
          <hr/>
          
          <table>
            <tbody>
                ${filasHtml}
            </tbody>
          </table>
          
          <div class="total-section">
            Total Pagado: $${paciente.total.toFixed(2)}
          </div>
          
          <hr/>
          <div class="footer">
            <p>¡Gracias por su preferencia!</p>
            <p>Conserve este ticket para futuras aclaraciones.</p>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) { win.document.write(html); win.document.close(); }
  };

  return (
    <div className="cobro-app">
      <div className="cobro-header-container">
        <h2 className="cobro-titulo">Caja General</h2>
        <p className="cobro-subtitulo">Control de Ingresos por Paciente</p>
      </div>

      {/* Barra Superior (Fecha y Total General) */}
      <div className="filtros-container">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {pacienteSeleccionado && (
                <button onClick={() => setPacienteSeleccionado(null)} className="btn-back">
                    <ArrowLeftIcon /> Volver
                </button>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{fontWeight: 'bold', fontSize:'0.8rem', color:'#666'}}>Fecha:</label>
                <input 
                    type="date" 
                    value={fecha} 
                    onChange={(e) => setFecha(e.target.value)} 
                    className="fecha-input"
                />
            </div>

             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{fontWeight: 'bold', fontSize:'0.8rem', color:'#666'}}>Filtrar:</label>
                <select 
                    value={filtroTipo} 
                    onChange={(e) => setFiltroTipo(e.target.value as any)}
                    className="fecha-input"
                    style={{minWidth: '150px'}}
                >
                    <option value="Todos">Todos</option>
                    <option value="Cita">Solo Citas</option>
                    <option value="Farmacia">Solo Farmacia</option>
                </select>
            </div>
        </div>

        <div className="total-general-box">
            <span>Venta Total del Día</span>
            <strong>${totalDia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loader"></div> Cargando...</div>
      ) : (
        <>
            {/* VISTA 1: LISTA DE PACIENTES */}
            {!pacienteSeleccionado && (
                <div className="pacientes-list">
                    {pacientesAgrupados.length === 0 && (
                        <div className="empty-state">No hay movimientos para esta fecha.</div>
                    )}

                    {pacientesAgrupados.map((p, idx) => (
                        <div key={idx} className="paciente-card" onClick={() => setPacienteSeleccionado(p)}>
                            <div className="paciente-icon">
                                <UserIcon />
                            </div>
                            <div className="paciente-info">
                                <h3>{p.nombre}</h3>
                                <p>{p.movimientos.length} movimientos registrados</p>
                            </div>
                            <div className="paciente-total">
                                ${p.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="paciente-arrow">
                                <ChevronRightIcon />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* VISTA 2: DETALLE DEL PACIENTE SELECCIONADO */}
            {pacienteSeleccionado && (
                <div className="detalle-paciente-container">
                    <div className="detalle-header">
                        <h3>Movimientos de: <span style={{color:'#2c3e50'}}>{pacienteSeleccionado.nombre}</span></h3>
                        <button className="btn-cobrar" onClick={() => imprimirTicketFinal(pacienteSeleccionado)}>
                            <div style={{marginRight:8, display:'flex'}}><PrinterIcon /></div> Imprimir Ticket Final
                        </button>
                    </div>

                    <div className="cobro-grid">
                        {pacienteSeleccionado.movimientos.map((item) => (
                            <div key={`${item.origen}-${item.idReferencia}`} className={`cobro-card ${!item.esPagado ? "pendiente" : "pagado"}`}>
                                <div className="card-header">
                                    <div>
                                        <span className="folio">#{item.idReferencia} • {item.origen.toUpperCase()}</span>
                                        <span className="fecha-ticket">
                                            {new Date(item.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <div className={`badge ${!item.esPagado ? "badge-yellow" : "badge-green"}`}>
                                        {item.estatus}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <p style={{fontSize:'1rem', fontWeight:500}}>{item.concepto}</p>
                                </div>
                                <div className="card-footer">
                                    <span className="monto-total">${item.montoTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
}