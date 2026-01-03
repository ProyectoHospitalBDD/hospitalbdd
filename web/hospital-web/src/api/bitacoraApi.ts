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

export type BitacoraRow = {
  idBitacora: number;
  fechaMovimiento: string;
  usuario: string;
  especialidad: string;
  nombrePaciente: string;
  diagnostico: string | null;
  consultorio: string;
  estatusConsulta: string;
  folioCita: number;
  fechaCita: string;
  horaCita: string;
  folioReceta: number | null;
  idPaciente: number;
  idDoctor: number;
};

export async function buscarBitacoraRecepcion(params: {
  texto?: string;
  desdeUtc?: string;
  hastaUtc?: string;
  estatus?: string;
  idPaciente?: number;
  idDoctor?: number;
}) {
  // axios ya serializa query params bien
  const res = await api.get<BitacoraRow[]>("/api/Bitacora/recepcion/buscar", { params });

  return res.data;
}
