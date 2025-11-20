import { http } from "./httpClient";

export interface DoctorListaDto {
  idDoctor: number;
  nombreMostrar: string;
  cedula: string;
}

export interface HorarioDisponibleDto {
  inicio: string; 
  fin: string;    
}

export async function listarDoctoresPorEspecialidad(especialidadId: number) {
  const res = await http.get<DoctorListaDto[]>("/api/Doctores", {
    params: { especialidadId },
  });
  return res.data;
}

export async function listarFechasDisponibles(doctorId: number) {
  const res = await http.get<string[]>(
    `/api/Doctores/${doctorId}/fechas-disponibles`
  );
  return res.data; // array de fechas ISO (solo fecha)
}

export async function listarHorariosDisponibles(doctorId: number, fecha: string) {
  const res = await http.get<HorarioDisponibleDto[]>(
    `/api/Doctores/${doctorId}/horarios-disponibles`,
    { params: { fecha } } // fecha tipo "2025-11-28"
  );
  return res.data;
}
