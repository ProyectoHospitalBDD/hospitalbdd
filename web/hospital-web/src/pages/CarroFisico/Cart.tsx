import React, { useState, useEffect } from 'react';
import { listarTodoElInventario, ProductoFarmaciaDto } from '../../api/farmaciaApi';
// Asegúrate de que esta ruta coincida con donde guardaste el nuevo api que hiciste
import { registrarTicketFisico, buscarPacienteCaja, CrearTicketPayload, PacienteLookupDto } from '../../api/ticketFisicoApi';
import { useCartFisico, getCartKeyFisico, CartFisicoItem } from './CartContextFisico';
import './Cart.css';

// Íconos SVG para no depender de librerías
const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconMinus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export default function PuntoVenta() {
    const { cart, addToCart, removeFromCart, updateQuantity, total, clearCart } = useCartFisico();
    
    // Estados de Inventario
    const [inventario, setInventario] = useState<ProductoFarmaciaDto[]>([]);
    const [busquedaProd, setBusquedaProd] = useState("");
    const [loadingInv, setLoadingInv] = useState(false);

    // Estados de Formulario de Cliente
    const [esPacienteRegistrado, setEsPacienteRegistrado] = useState(true);
    const [busquedaPaciente, setBusquedaPaciente] = useState(""); // Input para buscar
    const [pacienteEncontrado, setPacienteEncontrado] = useState<PacienteLookupDto | null>(null);
    const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
    const [nombreClienteGeneral, setNombreClienteGeneral] = useState("");
    const [procesandoVenta, setProcesandoVenta] = useState(false);


    const limpiar = (s?: string | null) => {
    const t = (s ?? "").trim();
    return t.length ? t : null;
    };

    // Cargar inventario al inicio
    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoadingInv(true);
        try {
            const data = await listarTodoElInventario();
            setInventario(data);
        } catch (error) {
            console.error("Error inventario", error);
        } finally {
            setLoadingInv(false);
        }
    };

    // --- BÚSQUEDA DE PACIENTE ---
    const handleBuscarPaciente = async () => {
        if (!busquedaPaciente) return;
        setErrorBusqueda(null);
        setPacienteEncontrado(null);
        
        try {
            const esNumero = !isNaN(Number(busquedaPaciente));
            const params: any = {};
            
            if (esNumero) params.id = Number(busquedaPaciente);
            else if (busquedaPaciente.includes('@')) params.email = busquedaPaciente;
            else params.curp = busquedaPaciente;

            console.log("Enviando búsqueda:", params); // Debug frontend
            const paciente = await buscarPacienteCaja(params);
            
            if (paciente) {
                console.log("Paciente encontrado:", paciente);
                setPacienteEncontrado(paciente);
            }
        } catch (err: any) {
            console.error("Error búsqueda:", err);
            // Mostrar mensaje real del backend si existe (ej: "El usuario existe pero no es paciente")
            let msg = "Paciente no encontrado. Verifique datos.";
            
            if (err.response) {
                // Si el servidor respondió con un error (404, 400, etc.)
                if (err.response.status === 404) {
                    msg = typeof err.response.data === 'string' ? err.response.data : "No se encontró ningún paciente con esos datos.";
                } else if (err.response.data) {
                     msg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
                }
            } else if (err.message) {
                msg = err.message;
            }
            
            setErrorBusqueda(msg);
        }
    };

    // --- PROCESAR VENTA ---
    const handleCobrar = async () => {
        if (cart.length === 0) return alert("El carrito está vacío.");
        if (esPacienteRegistrado && !pacienteEncontrado) return alert("Por favor busque y seleccione un paciente.");
        if (!esPacienteRegistrado && !nombreClienteGeneral.trim()) return alert("Ingrese el nombre del cliente.");

        setProcesandoVenta(true);

        try {
            
            const payload = {
            idFarmacia: 1,
            totalGeneral: total,
            idUsuarioPaciente: esPacienteRegistrado ? pacienteEncontrado!.idUsuarioPaciente : null,
            nombreClienteInvitado: esPacienteRegistrado ? null : limpiar(nombreClienteGeneral),
            correoContacto: null,
            metodoPago: "Efectivo",
            detalles: cart.map(item => ({
                idMedicamento: item.origen === "Medicamento" ? item.idProducto : null,
                idServicio: item.origen === "Servicio" ? item.idProducto : null,
                cantidad: item.cantidad,
                precioUnitario: item.precio,
            })),
            };

            console.log("payload armado:", payload);

            const res = await registrarTicketFisico(payload);
            
            imprimirTicketFisico(res.idTicket, cart, total, esPacienteRegistrado ? pacienteEncontrado?.nombreCompleto : nombreClienteGeneral);
            
            alert(`✅ Venta Exitosa. Ticket #${res.idTicket}`);
            clearCart();
            setPacienteEncontrado(null);
            setBusquedaPaciente("");
            setNombreClienteGeneral("");

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)) : "Error al procesar ticket.";
            alert("Error: " + msg);
        } finally {
            setProcesandoVenta(false);
        }
    };

    // --- IMPRESIÓN (Formato Ticket Térmico) ---
    const imprimirTicketFisico = (folio: number, items: CartFisicoItem[], totalPagar: number, clienteNombre?: string) => {
        const fecha = new Date().toLocaleString('es-MX');
        let itemsHtml = items.map(i => `
            <tr>
                <td style="padding:2px 0;">${i.cantidad}</td>
                <td style="padding:2px 0;">${i.nombre} <small>(${i.origen[0]})</small></td>
                <td style="text-align:right;">$${(i.precio * i.cantidad).toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
            <html>
            <head><style>
                body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0; color: #000; }
                .header, .footer { text-align: center; }
                hr { border: 0.5px dashed #000; margin: 5px 0; }
                table { width: 100%; font-size: 12px; }
                .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 10px; }
            </style></head>
            <body>
                <div class="header">
                    <h3>HOSPITAL POLIMED</h3>
                    <p>FARMACIA CENTRAL</p>
                    <p>${fecha}</p>
                    <p>Folio: <strong>#${folio}</strong></p>
                </div>
                <hr/>
                <p>Cliente: ${clienteNombre || 'Mostrador'}</p>
                <hr/>
                <table>
                    <thead><tr><th align="left">Cant</th><th align="left">Desc</th><th align="right">Imp</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <hr/>
                <div class="total">TOTAL: $${totalPagar.toFixed(2)}</div>
                <hr/>
                <div class="footer"><p>¡Gracias por su compra!</p></div>
                <script>window.onload = () => window.print();</script>
            </body></html>
        `;
        const win = window.open('', '_blank', 'width=350,height=500');
        if (win) { win.document.write(html); win.document.close(); }
    };

    // Filtros de UI
    const productosFiltrados = inventario.filter(p => 
        p.nombre.toLowerCase().includes(busquedaProd.toLowerCase()) || 
        p.tipo.toLowerCase().includes(busquedaProd.toLowerCase())
    );

    return (
        <div className="pos-container">
            {/* --- SECCIÓN IZQUIERDA: CATÁLOGO --- */}
            <div className="pos-catalog">
                <div className="pos-header-search">
                    <div className="search-bar">
                        <IconSearch />
                        <input 
                            type="text" 
                            placeholder="Buscar producto (F3)..." 
                            value={busquedaProd}
                            onChange={e => setBusquedaProd(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                
                <div className="catalog-grid">
                    {loadingInv ? <p>Cargando productos...</p> : productosFiltrados.map(prod => (
                        <div key={`${prod.origen}-${prod.idProducto}`} className="product-card" onClick={() => addToCart(prod, 1, "")}>
                            <div className="prod-icon">{prod.origen === 'Medicamento' ? '💊' : '🩺'}</div>
                            <div className="prod-info">
                                <h4>{prod.nombre}</h4>
                                <span className="prod-meta">{prod.tipo}</span>
                                <span className="prod-price">${prod.precio.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- SECCIÓN DERECHA: TICKET Y COBRO --- */}
            <div className="pos-ticket-sidebar">
                <div className="ticket-title">Venta en Curso</div>
                
                {/* FORMULARIO DE CLIENTE */}
                <div className="client-form-box">
                    <div className="client-toggle">
                        <button 
                            className={esPacienteRegistrado ? "active" : ""} 
                            onClick={() => {
                                setEsPacienteRegistrado(true);
                                setNombreClienteGeneral("");
                                }}
                        >Paciente Registrado</button>
                        <button 
                            className={!esPacienteRegistrado ? "active" : ""} 
                            onClick={() => {
                                setEsPacienteRegistrado(false);
                                setPacienteEncontrado(null);
                                setBusquedaPaciente("");
                                }
                            }
                        >Venta Mostrador</button>
                    </div>

                    <div className="client-input-area">
                        {esPacienteRegistrado ? (
                            <>
                                <div className="search-group">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar ID, CURP o Email"
                                        value={busquedaPaciente}
                                        onChange={e => setBusquedaPaciente(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleBuscarPaciente()}
                                    />
                                    <button onClick={handleBuscarPaciente}><IconSearch/></button>
                                </div>
                                {errorBusqueda && <small className="error-msg">{errorBusqueda}</small>}
                                {pacienteEncontrado && (
                                    <div className="paciente-found">
                                        <IconCheck/> 
                                        <div>
                                            <strong>{pacienteEncontrado.nombreCompleto}</strong><br/>
                                            <span style={{fontSize:'0.75rem'}}>ID: {pacienteEncontrado.idUsuarioPaciente} | {pacienteEncontrado.curp}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <input 
                                type="text" 
                                className="general-input"
                                placeholder="Nombre del Cliente"
                                value={nombreClienteGeneral}
                                onChange={e => setNombreClienteGeneral(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                {/* LISTA DE ITEMS */}
                <div className="cart-items-list">
                    {cart.length === 0 ? (
                        <div className="empty-state">Ticket vacío</div>
                    ) : cart.map(item => (
                        <div key={getCartKeyFisico(item)} className="ticket-row">
                            <div className="row-info">
                                <span className="row-name">{item.nombre}</span>
                                <span className="row-unit">${item.precio}</span>
                            </div>
                            <div className="row-controls">
                                <button onClick={() => updateQuantity(getCartKeyFisico(item), item.cantidad - 1)}><IconMinus/></button>
                                <span>{item.cantidad}</span>
                                <button onClick={() => updateQuantity(getCartKeyFisico(item), item.cantidad + 1)}><IconPlus/></button>
                            </div>
                            <div className="row-total">${(item.precio * item.cantidad).toFixed(2)}</div>
                            <button className="row-del" onClick={() => removeFromCart(getCartKeyFisico(item))}><IconTrash/></button>
                        </div>
                    ))}
                </div>

                {/* TOTALES Y PAGO */}
                <div className="ticket-summary">
                    <div className="summary-line total">
                        <span>TOTAL</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button 
                        className="btn-pay" 
                        onClick={handleCobrar}
                        disabled={procesandoVenta || cart.length === 0}
                    >
                        {procesandoVenta ? "Procesando..." : "COBRAR TICKET"}
                    </button>
                </div>
            </div>
        </div>
    );
}