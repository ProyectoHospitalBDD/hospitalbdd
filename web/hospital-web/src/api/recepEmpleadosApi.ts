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

export type TipoEmpleado = "Doctor" | "Recepcionista" | "Enfermera" | "Farmaceutico";

export type CreateEmpleadoDto = {
  tipoUsuario: TipoEmpleado;

  nombre: string;
  apPat: string;
  apMat?: string | null;
  curp: string;

  correoPersonal: string;
  telPersonal?: string | null;
  telCasa?: string | null;

  salario: number;
  estatus: boolean;
  password: string;

  // Solo Doctor
  cedula?: string | null;
  idEspecialidad?: number | null;
  idConsultorio?: number | null;
};

export type CreateEmpleadoResponseDto = {
  idUsuario: number;
};

export async function crearEmpleado(dto: CreateEmpleadoDto) {
  const r = await api.post<CreateEmpleadoResponseDto>("/api/recep/empleados", dto);
  return r.data;
}

export type EspecialidadItem = {
  idEspecialidad: number;
  nombreEsp: string;
  costo: number;
};

export type ConsultorioItem = {
  idConsultorio: number;
  numero: string;
  idEdificio: number;
  numPisos?: number | null;
  edificioLabel?: string | null;
};

export async function getEspecialidades() {
  const r = await api.get<EspecialidadItem[]>("/api/catalogos/especialidades");
  return r.data;
}

export async function getConsultorios() {
  const r = await api.get<ConsultorioItem[]>("/api/catalogos/consultorios");
  return r.data;
}

export type EmpleadoListItem = {
  idUsuario: number;
  tipoUsuario: TipoEmpleado | string;

  nombre: string;
  apPat: string;
  apMat?: string | null;
  curp: string;

  correoPersonal?: string | null;
  telPersonal?: string | null;
  telCasa?: string | null;

  estatus: boolean;
  salario: number;

  // doctor extra (pueden venir null)
  cedula?: string | null;
  idEspecialidad?: number | null;
  idConsultorio?: number | null;
};

export async function listarEmpleados(params?: {
  tipoUsuario?: string;
  estatus?: boolean;
  texto?: string;
}) {
  const r = await api.get<EmpleadoListItem[]>("/api/recep/empleados", { params });
  return r.data;
}

export async function cambiarEstatusEmpleado(idUsuario: number, estatus: boolean) {
  await api.patch(`/api/recep/empleados/${idUsuario}/estatus`, { estatus });
}
