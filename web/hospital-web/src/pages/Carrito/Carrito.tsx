import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, CartItem } from './CartContext';
import { registrarCompra, CrearCompraPayload, DetalleCompraPayload } from '../../api/compraApi';
import './Carrito.css';

export default function Carrito() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);

  // --- NUEVA FUNCIÓN: Obtener ID del usuario logueado desde el Token ---
  const getUserIdFromToken = (): number | null => {
    const token = localStorage.getItem("authToken");
    if (!token) return null; // Si no hay token, es un invitado (null)

    try {
        // Decodificamos la parte del payload del JWT (la segunda parte)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        
        // Buscamos el ID en los campos estándar de .NET Identity
        // nameid: suele ser el ID numérico en tu configuración
        // unique_name: suele ser el correo o usuario
        const id = payload.nameid || 
                   payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                   payload.sub || 
                   payload.idUsuario; // Por si tienes un claim personalizado

        return id ? parseInt(id, 10) : null;
    } catch (error) {
        console.error("Error al leer el token:", error);
        return null;
    }
  };

  // --- FUNCIÓN PARA GENERAR EL HTML DEL TICKET (Estilo PDF/Impresión) ---
  const imprimirTicket = (idTicket: number, items: CartItem[], totalPagar: number) => {
    const fecha = new Date().toLocaleString('es-MX');
    const usuarioId = getUserIdFromToken(); // Intentamos obtener info para el ticket
    
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
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.85rem; }
            th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; }
            td { padding: 5px 0; vertical-align: top; }
            .text-right { text-align: right; }
            
            .total-section { margin-top: 20px; font-size: 1.1rem; font-weight: bold; text-align: right; }
            .footer { text-align: center; margin-top: 30px; font-size: 0.75rem; color: #666; }
            
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
              .ticket-container { border: none; }
            }
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
            <p class="info" style="text-align: left;"><strong>Cliente ID:</strong> ${usuarioId || 'Invitado'}</p>
            <hr/>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 10%;">Cant.</th>
                  <th style="width: 60%;">Concepto</th>
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
            
            <hr/>
            
            <div class="total-section">
              Total: $${totalPagar.toFixed(2)}
            </div>
            
            <div class="footer">
              <p>¡Gracias por su compra!</p>
              <p>Conserve este ticket para cualquier aclaración.</p>
            </div>
            
            <script>
                // Auto-imprimir al cargar
                window.onload = function() { window.print(); }
            </script>
          </div>
        </body>
      </html>
    `;

    // Abrir una nueva ventana (o pestaña) con el HTML generado
    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
        ventanaImpresion.document.write(html);
        ventanaImpresion.document.close(); // Necesario para que el navegador termine de cargar y ejecute el print
    } else {
        alert("Por favor habilita las ventanas emergentes para imprimir el ticket.");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcesando(true);

    try {
        // 1. Obtener ID real del usuario
        const realIdPaciente = getUserIdFromToken();

        // 2. Mapear los items del carrito al formato que espera el Backend
        const detallesPayload: DetalleCompraPayload[] = cart.map(item => ({
            idMedicamento: item.origen === 'Medicamento' ? item.idProducto : null,
            idServicio: item.origen === 'Servicio' ? item.idProducto : null,
            cantidad: item.cantidad,
            precioUnitario: item.precio
        }));

        // 3. Construir el objeto de compra completo con el ID dinámico
        const compraData: CrearCompraPayload = {
            idPaciente: realIdPaciente, // <--- AQUÍ ESTÁ LA CORRECCIÓN CLAVE
            nombreClienteInvitado: realIdPaciente ? null : "Cliente Invitado", // Si no hay ID, es invitado
            correoContacto: "cliente@email.com",
            totalGeneral: total,
            detalles: detallesPayload
        };

        // 4. Enviar al servidor
        const respuesta = await registrarCompra(compraData);
        
        // 5. Éxito
        // Generar Ticket PDF
        imprimirTicket(respuesta.idCompra, cart, total);

        alert(`¡Pedido #${respuesta.idCompra} realizado con éxito! Revisa la ventana de impresión.`);
        
        clearCart();
        navigate('/tienda');

    } catch (error: any) {
        console.error("Error en la compra:", error);
        // Intentar mostrar el mensaje específico del backend (ej: "Stock insuficiente")
        const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        alert("Hubo un error al procesar tu pedido. " + msg);
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
                        <small style={{color:'#888'}}>{item.origen}</small>
                    </div>
                    <div className="cart-controls">
                        <button onClick={() => updateQuantity(item.idProducto, item.cantidad - 1)}>-</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.idProducto, item.cantidad + 1)}>+</button>
                    </div>
                    <div className="cart-subtotal">
                        ${(item.precio * item.cantidad).toFixed(2)}
                    </div>
                    <button className="cart-remove" onClick={() => removeFromCart(item.idProducto)}>✕</button>
                </div>
            ))}
        </div>

        <div className="carrito-summary">
            <h3>Resumen</h3>
            <div className="summary-row"><span>Total Productos:</span> <span>{cart.reduce((a, b) => a + b.cantidad, 0)}</span></div>
            <div className="summary-row total"><span>Total a Pagar:</span> <span>${total.toFixed(2)}</span></div>
            
            <button className="save-button btn-checkout" onClick={handleCheckout} disabled={procesando}>
                {procesando ? "Procesando..." : "Confirmar Pedido"}
            </button>
        </div>
      </div>
    </div>
  );
}