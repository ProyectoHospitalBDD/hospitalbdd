import { http } from "./httpClient";

export interface CobroItemDto {
  idReferencia: number;
  origen: "Cita" | "Farmacia";
  paciente: string;
  concepto: string;
  montoTotal: number;
  fecha: string;
  estatus: string;
  esPagado: boolean;
}

export async function getHistorialCaja(desde: string, hasta: string) {
  const params = new URLSearchParams();
  // Enviamos formato YYYY-MM-DD
  params.append("fechaInicio", desde);
  params.append("fechaFin", hasta);

  const res = await http.get<CobroItemDto[]>(`/api/Caja/historial?${params.toString()}`);
  return res.data;
}