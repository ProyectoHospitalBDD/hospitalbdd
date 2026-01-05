import { http } from "./httpClient";

// --- INTERFACES ---

export interface DetalleTicketPayload {
  idMedicamento?: number | null;
  idServicio?: number | null;
  cantidad: number;
  precioUnitario: number;
}

export interface CrearTicketPayload {
  idUsuarioPaciente?: number | null;
  nombreClienteInvitado?: string | null;
  correoContacto?: string | null;
  idFarmacia: number;
  totalGeneral: number;
  metodoPago?: string | null;
  detalles: DetalleTicketPayload[];
}

export interface TicketExitosoResponse {
  idTicket: number;
  mensaje: string;
  totalCalculado?: number;
}

export interface PacienteLookupDto {
  idUsuarioPaciente: number;
  nombreCompleto: string;
  curp: string;
  email?: string | null;
  telefono?: string | null;
}

// --- FUNCIONES API ---

/**
 * Registra un ticket físico (Venta Mostrador)
 */
export async function registrarTicketFisico(payload: CrearTicketPayload) {
  const res = await http.post<TicketExitosoResponse>("/api/TicketFisicoApi", payload);
  return res.data;
}

/**
 * Busca un paciente específico por coincidencia exacta (CURP, Email o ID)
 */
export async function buscarPacienteCaja(params: { curp?: string; email?: string; id?: number }) {
  const res = await http.get<PacienteLookupDto>("/api/TicketFisicoApi/buscar-paciente", { params });
  return res.data;
}

/**
 * Búsqueda predictiva (Autocomplete)
 * Busca coincidencias parciales de Nombre o CURP mientras se escribe.
 */
export async function buscarPacientesPredictivo(termino: string) {
  if (!termino || termino.length < 3) return [];

  try {
    const res = await http.get<PacienteLookupDto[]>('/api/TicketFisicoApi/buscar-predictivo', { 
        params: { q: termino } 
    });
    return res.data || [];
  } catch (error) {
    console.warn("Error en búsqueda predictiva", error);
    return [];
  }
}