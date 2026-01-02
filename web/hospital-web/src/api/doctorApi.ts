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

export type PerfilDoctor = {
  idUsuario: number;
  nombreCompleto: string;
  curp: string;
  estatusEmpleado: boolean;
  salario: number;
  cedula: string;
  especialidad: string;
  consultorio: number;
};

export async function getMiPerfilDoctor(): Promise<PerfilDoctor> {
  const { data } = await api.get("/api/doctores/me");
  return data;
}

export type HorarioDoctor = {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
};

export async function getMiHorarioDoctor(): Promise<HorarioDoctor[]> {
  const { data } = await api.get("/api/doctores/me/horario");
  return data;
}

export type CitaDoctor = {
  idCita: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estatus: string;
  idPaciente: number;
  paciente: string;
};

export async function getMisCitasDoctor(params: {
  desde: string;
  hasta: string;
}): Promise<CitaDoctor[]> {
  const { data } = await api.get("/api/doctores/me/citas", { params });
  return data;
}

export async function solicitarCancelacionCita(idCita: number): Promise<void> {
  await api.post(`/api/citas/${idCita}/cancelacion/solicitar`);
}


export type PacienteInfo = {
  idUsuario: number;
  nombreCompleto: string;
  curp: string;
  fechaNacimiento?: string;
};

export async function getPacienteInfo(idPaciente: number): Promise<PacienteInfo> {
  const { data } = await api.get<PacienteInfo>(`/api/doctores/paciente/${idPaciente}`);
  return data;
}

export type HistorialMedicoPaciente = {
  tipoSangre: string;
  peso: number | null;
  estatura: number | null;
};

export async function getHistorialMedicoPaciente(
  idPaciente: number
): Promise<HistorialMedicoPaciente> {
  const { data } = await api.get<HistorialMedicoPaciente>(
    `/api/doctores/pacientes/${idPaciente}/historial-medico`
  );
  return data;
}
