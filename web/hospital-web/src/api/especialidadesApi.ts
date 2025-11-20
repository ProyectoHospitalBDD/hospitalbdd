import { http } from "./httpClient";

export interface EspecialidadDto {
  idEspecialidad: number;       
  nombre: string;  
  costo : number;
}

export async function listarEspecialidades() {
  const res = await http.get<EspecialidadDto[]>("/api/Especialidades");
  return res.data;
}
