import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, CartItem } from './CartContext';
import { registrarCompra, CrearCompraPayload, DetalleCompraPayload } from '../../api/compraApi';
import { getMiPerfil } from '../../api/pacienteApi'; 
import './Carrito.css';

export default function Carrito() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [procesando, setProcesando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estado del formulario de envío
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    direccion: "",
    telefono: ""
  });

  // Intentar cargar datos del usuario al montar el componente
  useEffect(() => {
    const cargarDatosUsuario = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          // 1. Intentamos obtener datos completos del perfil
          // Si tienes getMiPerfil implementado, esto llenará el nombre y correo
          const perfil = await getMiPerfil();
          if (perfil) {
            setFormData(prev => ({
              ...prev,
              nombre: perfil.nombreCompleto || "",
              email: perfil.email || "",
              telefono: perfil.telefono || ""
            }));
          }
        } catch (error) {
          console.warn("No se pudo cargar perfil completo, usando datos del token si es posible.");
          // Fallback: Decodificar token si falla la API
          obtenerDatosDelToken(token);
        }
      }
    };
    cargarDatosUsuario();
  }, []);

  const obtenerDatosDelToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        
        // Intentar rescatar nombre/email de los claims estándar
        const nombre = payload.unique_name || payload.name || "";
        const email = payload.email || "";
        
        if (nombre || email) {
            setFormData(prev => ({ ...prev, nombre, email }));
        }
    } catch (e) { console.error(e); }
  };

  const getUserIdFromToken = (): number | null => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        const id = payload.nameid || payload.idUsuario || payload.sub;
        return id ? parseInt(id, 10) : null;
    } catch { return null; }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- GENERACIÓN DE TICKET ---
  const imprimirTicket = (idTicket: number, items: CartItem[], totalPagar: number, datosCliente: typeof formData) => {
    const fecha = new Date().toLocaleString('es-MX');
    
    let html = `
      <html>
        <head>
          <title>Ticket de Compra #${idTicket}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; margin: 20px; color: #333; }
            .ticket-container { max-width: 400px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
            h1 { text-align: center; font-size: 1.2rem; margin-bottom: 5px; color: #27ae60; }
            p.info { text-align: center; font-size: 0.85rem; margin: 2px 0; }
            hr { border: 0.5px dashed #ccc; margin: 15px 0; }
            .section-title { font-weight: bold; margin-top: 10px; font-size: 0.9rem; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.85rem; }
            th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; }
            td { padding: 5px 0; vertical-align: top; }
            .text-right { text-align: right; }
            .total-section { margin-top: 20px; font-size: 1.1rem; font-weight: bold; text-align: right; }
            .footer { text-align: center; margin-top: 30px; font-size: 0.75rem; color: #666; }
            @media print { .no-print { display: none; } .ticket-container { border: none; } }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <h1>Farmacia Hospitalaria</h1>
            <p class="info">Blvd. Salud #123, Ciudad</p>
            <p class="info">Tel: (555) 123-4567</p>
            <hr/>
            
            <p class="info" style="text-align: left;"><strong>Folio:</strong> #${idTicket}</p>
            <p class="info" style="text-align: left;"><strong>Fecha:</strong> ${fecha}</p>
            <hr/>
            
            <div style="font-size: 0.85rem; margin-bottom: 10px;">
                <strong>Datos del Cliente:</strong><br/>
                ${datosCliente.nombre}<br/>
                ${datosCliente.email}<br/>
                ${datosCliente.telefono ? `Tel: ${datosCliente.telefono}` : ''}
            </div>

            ${datosCliente.direccion ? `
            <div style="font-size: 0.85rem; margin-bottom: 15px; background: #f9f9f9; padding: 5px;">
                <strong>Dirección de Envío:</strong><br/>
                ${datosCliente.direccion}
            </div>` : ''}
            
            <table>
              <thead>
                <tr>
                  <th style="width: 15%;">Cant.</th>
                  <th style="width: 55%;">Producto</th>
                  <th class="text-right" style="width: 30%;">Importe</th>
                </tr>
              </thead>
              <tbody>`;

    items.forEach(item => {
        html += `
                <tr>
                  <td>${item.cantidad}</td>
                  <td>
                    ${item.nombre}<br/>
                    <small style="color: #666; font-size: 0.7rem;">(${item.origen})</small>
                  </td>
                  <td class="text-right">$${(item.precio * item.cantidad).toFixed(2)}</td>
                </tr>`;
    });

    html += `
              </tbody>
            </table>
            <div class="total-section">Total: $${totalPagar.toFixed(2)}</div>
            <div class="footer">
              <p>¡Gracias por su compra!</p>
              <p>El tiempo estimado de entrega es de 24 a 48 horas.</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </div>
        </body>
      </html>`;

    const ventana = window.open('', '_blank');
    if (ventana) { ventana.document.write(html); ventana.document.close(); }
    else { alert("Habilita ventanas emergentes para ver el ticket."); }
  };

  const confirmarCompraFinal = async (e: React.FormEvent) => {
    e.preventDefault(); // Evitar recarga
    setProcesando(true);

    try {
        const realIdPaciente = getUserIdFromToken();
        
        const detallesPayload: DetalleCompraPayload[] = cart.map(item => ({
            idMedicamento: item.origen === 'Medicamento' ? item.idProducto : null,
            idServicio: item.origen === 'Servicio' ? item.idProducto : null,
            cantidad: item.cantidad,
            precioUnitario: item.precio
        }));

        const compraData: CrearCompraPayload = {
            idPaciente: realIdPaciente,
            // Usamos el nombre del formulario. Si está logueado, igual sirve guardarlo como referencia histórica
            nombreClienteInvitado: formData.nombre || "Cliente Anónimo",
            correoContacto: formData.email || "Sin correo",
            totalGeneral: total,
            detalles: detallesPayload
        };

        const respuesta = await registrarCompra(compraData);
        
        // Imprimir ticket con los datos del formulario (incluida la dirección)
        imprimirTicket(respuesta.idCompra, cart, total, formData);

        alert(`¡Pedido #${respuesta.idCompra} confirmado!`);
        clearCart();
        setMostrarFormulario(false);
        navigate('/tienda');

    } catch (error: any) {
        console.error("Error:", error);
        const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        alert("Error al procesar: " + msg);
    } finally {
        setProcesando(false);
    }
  };

  if (cart.length === 0) {
    return (
        <div className="carrito-page empty">
            <h2>Tu carrito está vacío 🛒</h2>
            <button className="save-button" onClick={() => navigate('/tienda')} style={{maxWidth: '200px'}}>Ir a la Tienda</button>
        </div>
    );
  }

  return (
    <div className="carrito-page">
      <header className="top-app-bar">
         <div className="navigation-icon" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
         </div>
         <h1>Mi Carrito</h1>
      </header>

      <div className="carrito-container">
        <div className="carrito-items-list">
            {cart.map(item => (
                <div key={`${item.origen}-${item.idProducto}`} className="carrito-item">
                    <div className="cart-img">
                         {item.imagenUrl ? <img src={item.imagenUrl} alt={item.nombre} /> : 
                            <span>{item.origen === 'Medicamento' ? '💊' : '🩺'}</span>}
                    </div>
                    <div className="cart-info">
                        <h3>{item.nombre}</h3>
                        <p className="cart-price">${item.precio.toFixed(2)}</p>
                    </div>
                    <div className="cart-controls">
                        <button onClick={() => updateQuantity(item.idProducto, item.cantidad - 1)}>-</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.idProducto, item.cantidad + 1)}>+</button>
                    </div>
                    <div className="cart-subtotal">${(item.precio * item.cantidad).toFixed(2)}</div>
                    <button className="cart-remove" onClick={() => removeFromCart(item.idProducto)}>✕</button>
                </div>
            ))}
        </div>

        <div className="carrito-summary">
            <h3>Resumen</h3>
            <div className="summary-row"><span>Total Productos:</span> <span>{cart.reduce((a, b) => a + b.cantidad, 0)}</span></div>
            <div className="summary-row total"><span>Total a Pagar:</span> <span>${total.toFixed(2)}</span></div>
            
            <button className="save-button btn-checkout" onClick={() => setMostrarFormulario(true)}>
                Confirmar Pedido
            </button>
        </div>
      </div>

      {/* --- MODAL DE DATOS DE ENVÍO --- */}
      {mostrarFormulario && (
        <div className="checkout-modal-backdrop">
            <div className="checkout-modal">
                <h2>Datos de Envío</h2>
                <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'20px'}}>Por favor confirma tus datos para la entrega.</p>
                
                <form onSubmit={confirmarCompraFinal} className="checkout-form">
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input 
                            type="text" name="nombre" required 
                            value={formData.nombre} onChange={handleInputChange} 
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" name="email" required 
                            value={formData.email} onChange={handleInputChange} 
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Teléfono</label>
                        <input 
                            type="tel" name="telefono"
                            value={formData.telefono} onChange={handleInputChange} 
                            placeholder="55 1234 5678"
                        />
                    </div>
                    <div className="form-group">
                        <label>Dirección de Entrega</label>
                        <textarea 
                            name="direccion" required rows={3}
                            value={formData.direccion} onChange={handleInputChange} 
                            placeholder="Calle, Número, Colonia, Ciudad, C.P."
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={() => setMostrarFormulario(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="confirm-btn" disabled={procesando}>
                            {procesando ? "Procesando..." : "Finalizar Compra"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}