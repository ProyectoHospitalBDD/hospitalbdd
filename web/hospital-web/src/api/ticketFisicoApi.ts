import { http } from "./httpClient";


export interface DetalleTicketPayload {
idMedicamento?: number | null;
idServicio?: number | null;
cantidad: number;
precioUnitario: number;
}


export interface CrearTicketPayload {
idPaciente?: number | null;
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
}


export async function registrarTicketFisico(payload: CrearTicketPayload) {
const res = await http.post<TicketExitosoResponse>("/api/TicketFisicoApi", payload);
return res.data;
}


export interface PacienteLookupDto {
idPaciente: number;
nombreCompleto: string;
curp: string;
email?: string | null;
telefono?: string | null;
}


export async function buscarPacienteCaja(params: { curp?: string; email?: string; id?: number }) {
const res = await http.get<PacienteLookupDto>("/api/TicketFisicoApi/buscar-paciente", { params });
return res.data;
}