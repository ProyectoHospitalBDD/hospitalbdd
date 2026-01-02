import { http } from "./httpClient";

export interface MedicamentoListaDto {
  idMedicamento: number;
  descripcion: string;
  tipo: string;
  capacidad: string;
  precio: number;
  stock: number;
  caducidad: string; // formato ISO
  idFarmacia?: number;
}

export async function listarMedicamentos(): Promise<MedicamentoListaDto[]> {
  const res = await http.get<MedicamentoListaDto[]>("/api/Medicamentos");
  return res.data;
}