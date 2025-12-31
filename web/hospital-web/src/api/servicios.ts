import { http } from "./httpClient";

export interface ServicioDto {
  idServicio: number;
  descripcion: string;
  tipo: string;
  precio: number;
  stock: number | null; 
}

export async function listarServicios() {
  const res = await http.get<ServicioDto[]>("/api/Servicios");
  return res.data;
}

export async function actualizarStockServicio(id: number, nuevoStock: number) {
  const res = await http.put(`/api/Servicios/${id}/stock`, {
    stock: nuevoStock
  });
  return res.data;
}