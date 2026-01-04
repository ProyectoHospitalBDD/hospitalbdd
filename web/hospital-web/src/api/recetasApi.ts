import { http } from "./httpClient";

export interface MedicamentoRecetaDto {
  idMedicamento: number;
  indicaciones?: string;
  cantidad: number;
}

export interface ServicioRecetaDto {
  idServicio: number;
  indicaciones?: string;
}

export interface CrearRecetaDto {
  idCita: number;
  fechaReceta: string; // formato ISO
  diagnostico?: string;
  observaciones?: string;
  medicamentos: MedicamentoRecetaDto[];
  servicios: ServicioRecetaDto[];
}

export interface RecetaCreadaDto {
  idRecetaGenerado: number;
}

export interface Medicamento {
  idMedicamento: number;
  nombre?: string;          // 👈 nuevo campo
  indicaciones?: string;
  cantidad: number;
}

export interface Servicio {
  idServicio: number;
  nombre?: string;          // 👈 nuevo campo
  indicaciones?: string;
}

export interface Receta {
  idReceta: number;
  idCita: number;
  fechaReceta: string;
  diagnostico?: string;
  observaciones?: string;
  medicamentos: Medicamento[];
  servicios: Servicio[];
}

export async function obtenerReceta(citaId: number): Promise<Receta> {
  const res = await http.get<Receta>(`/api/Receta/${citaId}`);
  return res.data;
}

export async function crearReceta(dto: CrearRecetaDto): Promise<RecetaCreadaDto> {
  const res = await http.post<RecetaCreadaDto>("/api/Receta", dto);
  return res.data;
}

