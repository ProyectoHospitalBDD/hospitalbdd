import { http } from "./httpClient";

export interface CreateCitaRequest {
  pacienteId: number;
  doctorId: number;
  fechaInicioUtc: string; // ISO string
  duracionMin: number;
}

export interface CitaResponse {
  idCita: number;
  idPaciente: number;
  idDoctor: number;
  estatusCita: string;
  fechaHoraInicio: string;
  duracionMin: number;
  fechaHoraFin: string;
  costo: number;
  venceEn: string | null;
}

export async function crearCita(data: CreateCitaRequest) {
  const res = await http.post<CitaResponse>("/api/Citas", data);
  return res.data;
}
