import { http } from "./httpClient";

// Interfaz exacta al DTO de C#
export interface MedicamentoDto {
  idMedicamento: number;
  descripcion: string;
  tipo: string;
  capacidad: string;
  precio: number;
  stock: number;
  caducidad: string; // ISO Date String
}

// GET: /api/Medicamentos
export async function listarMedicamentos() {
  const res = await http.get<MedicamentoDto[]>("/api/Medicamentos");
  return res.data;
}

// PUT: /api/Medicamentos/{id}/stock
export async function actualizarStockMedicamento(id: number, nuevoStock: number) {
  const res = await http.put(`/api/Medicamentos/${id}/stock`, {
    stock: nuevoStock
  });
  return res.data;
}