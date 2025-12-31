import React, { useState, useEffect } from "react";
import "./CobroTicket.css";

// Definimos la estructura de un Ticket pendiente
interface ConceptoCobro {
  descripcion: string;
  monto: number;
}

interface TicketPaciente {
  id: number;
  pacienteNombre: string;
  fecha: string;
  conceptos: ConceptoCobro[]; // Lista de lo que se va a cobrar (Consulta, Medicinas, etc.)
  estatus: "Pendiente" | "Pagado";
}

// --- DATOS MOCK (Simulación de la Base de Datos) ---
const MOCK_TICKETS: TicketPaciente[] = [
  {
    id: 101,
    pacienteNombre: "Juan Pérez",
    fecha: "2023-10-27",
    estatus: "Pendiente",
    conceptos: [
      { descripcion: "Consulta General", monto: 500 },
      { descripcion: "Paracetamol 500mg (Caja)", monto: 50 },
      { descripcion: "Amoxicilina 500mg", monto: 120 },
    ],
  },
  {
    id: 102,
    pacienteNombre: "María Rodríguez",
    fecha: "2023-10-27",
    estatus: "Pendiente",
    conceptos: [
      { descripcion: "Consulta Especialidad (Dermatología)", monto: 800 },
    ],
  },
  {
    id: 103,
    pacienteNombre: "Carlos López",
    fecha: "2023-10-27",
    estatus: "Pagado",
    conceptos: [
      { descripcion: "Curación herida menor", monto: 300 },
      { descripcion: "Gasas y Material", monto: 150 },
    ],
  },
];

export function CobroTicket() {
  const [tickets, setTickets] = useState<TicketPaciente[]>([]);

  // Cargar datos (simulado)
  useEffect(() => {
    setTickets(MOCK_TICKETS);
  }, []);

  // Función para calcular el total de un ticket específico
  const calcularTotal = (conceptos: ConceptoCobro[]) => {
    return conceptos.reduce((acc, item) => acc + item.monto, 0);
  };

  // Función simulada para imprimir
  const handleImprimirTicket = (id: number, nombre: string) => {
    // Aquí iría la lógica de generación de PDF real (jsPDF, etc.)
    alert(`🖨️ Generando PDF para el paciente: ${nombre} (Ticket #${id})`);
  };

  return (
    <div className="cobro-app">
      <div className="cobro-header-container">
        <h2 className="cobro-titulo">Caja y Farmacia</h2>
        <p className="cobro-subtitulo">Gestión de cobros pendientes del día</p>
      </div>

      <div className="cobro-grid">
        {tickets.map((ticket) => {
          const totalTicket = calcularTotal(ticket.conceptos);
          const esPendiente = ticket.estatus === "Pendiente";

          return (
            <div key={ticket.id} className={`cobro-card ${esPendiente ? "pendiente" : "pagado"}`}>
              {/* Encabezado de la Tarjeta */}
              <div className="card-header">
                <div>
                  <span className="folio">Folio: #{ticket.id}</span>
                  <h3 className="paciente-nombre">{ticket.pacienteNombre}</h3>
                  <span className="fecha-ticket">{ticket.fecha}</span>
                </div>
                <div className={`badge ${esPendiente ? "badge-yellow" : "badge-green"}`}>
                  {ticket.estatus}
                </div>
              </div>

              {/* Lista de Conceptos */}
              <div className="card-body">
                <p className="seccion-titulo">Detalles del cobro:</p>
                <ul className="conceptos-lista">
                  {ticket.conceptos.map((item, index) => (
                    <li key={index} className="concepto-item">
                      <span>{item.descripcion}</span>
                      <span className="precio">${item.monto.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total y Acciones */}
              <div className="card-footer">
                <div className="total-row">
                  <span>Total a Pagar:</span>
                  <span className="monto-total">${totalTicket.toFixed(2)}</span>
                </div>

                <div className="acciones-row">
                  {esPendiente ? (
                    <button 
                      className="btn-cobrar"
                      onClick={() => handleImprimirTicket(ticket.id, ticket.pacienteNombre)}
                    >
                      💰 Cobrar e Imprimir Ticket
                    </button>
                  ) : (
                    <button 
                      className="btn-reimprimir"
                      onClick={() => handleImprimirTicket(ticket.id, ticket.pacienteNombre)}
                    >
                      📄 Reimprimir Comprobante
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CobroTicket;