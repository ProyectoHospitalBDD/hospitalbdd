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

export type PerfilRecepcionista = {
  idUsuario: number;
  nombreCompleto: string;
  curp: string;
  estatusEmpleado: boolean;
  salario: number;
  tipoEmpleado: string;
};

export async function getMiPerfilRecepcionista(): Promise<PerfilRecepcionista> {
  const { data } = await api.get("/api/recepcionistas/me");
  return data;
}

export type HorarioRecepcionista = {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
};

export async function getMiHorarioRecepcionista(): Promise<HorarioRecepcionista[]> {
  const { data } = await api.get("/api/recepcionistas/me/horario");
  return data;
}