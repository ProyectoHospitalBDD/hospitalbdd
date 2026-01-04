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

export type PerfilFarmaceutico = {
  idUsuario: number;
  nombreCompleto: string;
  curp: string;
  estatusEmpleado: boolean;
  salario: number;
  tipoEmpleado: string;
};

export async function getMiPerfilFarmaceutico(): Promise<PerfilFarmaceutico> {
  const { data } = await api.get("/api/farmaceuticos/me");
  return data;
}

export type HorarioFarmaceutico = {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
};

export async function getMiHorarioFarmaceutico(): Promise<HorarioFarmaceutico[]> {
  const { data } = await api.get("/api/farmaceuticos/me/horario");
  return data;
}