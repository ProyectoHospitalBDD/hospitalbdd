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

export async function crearReceta(dto: CrearRecetaDto): Promise<RecetaCreadaDto> {
  const res = await http.post<RecetaCreadaDto>("/api/Receta", dto);
  return res.data;
}