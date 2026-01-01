import { http } from "./httpClient";

// Interfaces para el envío (Payload)
export interface DetalleCompraPayload {
  idMedicamento?: number | null;
  idServicio?: number | null;
  cantidad: number;
  precioUnitario: number;
}

export interface CrearCompraPayload {
  idPaciente?: number | null;
  nombreClienteInvitado?: string | null;
  correoContacto?: string;
  totalGeneral: number;
  detalles: DetalleCompraPayload[];
}

export interface CompraExitosaResponse {
    idCompra: number;
    mensaje: string;
}

export async function registrarCompra(payload: CrearCompraPayload) {
  // Ajuste: Tipamos el retorno para saber que viene un idCompra
  const res = await http.post<CompraExitosaResponse>("/api/CompraApi", payload);
  return res.data;
}