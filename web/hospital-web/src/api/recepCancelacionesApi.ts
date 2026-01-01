import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export type CancelacionPendiente = {
  idCita: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  costo: number;
  idPaciente: number;
  pacienteNombre: string;
  idDoctor: number;
  doctorNombre: string;
};

export type CitaRecepRow = {
  idCita: number;
  estatusCita: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  costo: number;
  idPaciente: number;
  pacienteNombre: string;
  idDoctor: number;
  doctorNombre: string;
};

export async function getPendientesCancelacionDoctor() {
  const r = await api.get<CancelacionPendiente[]>("/api/citas/cancelacion/pendientes");
  return r.data;
}

export async function confirmarCancelacionDoctor(idCita: number) {
  await api.post(`/api/citas/${idCita}/cancelacion/confirmar`, {});
}

export async function rechazarCancelacionDoctor(idCita: number) {
  await api.post(`/api/citas/${idCita}/cancelacion/rechazar`, {});
}

export async function buscarCitasRecepcion(params: {
  texto?: string;
  desdeUtc?: string;
  hastaUtc?: string;
  estatus?: string;
}) {
  const r = await api.get<CitaRecepRow[]>("/api/citas/recepcion/buscar", { params });
  return r.data;
}

export async function cancelarCitaPorRecepcion(idCita: number) {
  await api.post(`/api/citas/${idCita}/cancelar/recepcion`, {});
}