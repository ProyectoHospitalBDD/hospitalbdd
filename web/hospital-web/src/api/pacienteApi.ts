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

function normalizeError(e: unknown): never {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    const msg = (e.response?.data as any)?.message ?? e.message;
    throw new Error(`[API ${status ?? "?"}] ${msg}`);
  }
  throw e;
}

export type PerfilPaciente = {
  nombre: string;
  apPat: string;
  apMat?: string | null;
  
  nombreCompleto: string;
  curp: string;
  telefono: string | null;
  email: string | null;
};

// --- ACTUALIZADO: Agregamos curp al DTO de edición ---
export type UpdatePerfilDto = {
  nombre: string;
  apPat: string;
  apMat?: string | null;
  curp: string; // Nuevo campo
  telefono?: string | null;
  email?: string | null;
};

export type CitaPaciente = {
  folioCita: number;
  fecha: string;
  hora: string;
  doctor: string;
  especialidad: string;
  consultorio: number | string;
  estatus: string;
  puedeCancelar: boolean;
};

export type HistorialMedicoPaciente = {
  tipoSangre: string;
  peso: number | null;
  estatura: number | null;
};

export type AlergiaItem = {
  idAlerPade: number; 
  nombre: string;
  tipo: string;
};

export type MiAlergia = {
  idAlerPade: number;
  nombre: string;
  nombreNormalizado: string;
  tipo: string;
  severidad?: string;
  estado?: string;
  reaccion?: string;
  observaciones?: string;
};

export async function getMiPerfil(): Promise<PerfilPaciente> {
  try {
    const { data } = await api.get("/api/pacientes/me");
    return data;
  } catch (e) {
    normalizeError(e);
  }
}

export async function updateMiPerfil(dto: UpdatePerfilDto): Promise<{ message: string; requireRelogin: boolean }> {
  try {
    const { data } = await api.put("/api/pacientes/me", dto);
    return data; 
  } catch (e) {
    normalizeError(e);
  }
}

export async function getMisCitas(params: {
  desde?: string;
  hasta?: string;
  estatus?: string;
}): Promise<CitaPaciente[]> {
  try {
    const cleanParams = {
      desde: params.desde || undefined,
      hasta: params.hasta || undefined,
      estatus: params.estatus || undefined,
    };

    const { data } = await api.get("/api/pacientes/me/citas", { params: cleanParams });
    return data;
  } catch (e) {
    normalizeError(e);
  }
}

export async function getMiHistorialMedico(): Promise<HistorialMedicoPaciente> {
  try {
    const { data } = await api.get("/api/pacientes/me/historial-medico");
    return data;
  } catch (e) {
    normalizeError(e);
  }
}

export async function saveMiHistorialMedico(dto: HistorialMedicoPaciente): Promise<void> {
  try {
    await api.post("/api/pacientes/me/historial-medico", dto);
  } catch (e) {
    normalizeError(e);
  }
}

export async function getCatalogoAlergias(): Promise<AlergiaItem[]> {
  try {
    const { data } = await api.get("/api/pacientes/alergias/catalogo");
    return data;
  } catch (e) {
    normalizeError(e);
  }
}

export async function getMisAlergias(): Promise<MiAlergia[]> {
  try {
    const { data } = await api.get("/api/pacientes/me/alergias");
    return data;
  } catch (e) {
    normalizeError(e);
  }
}

export async function agregarAlergia(idAlerPade: number): Promise<void> {
  try {
    await api.post("/api/pacientes/me/alergias", { idAlerPade });
  } catch (e) {
    normalizeError(e);
  }
}

export async function eliminarAlergia(idAlerPade: number): Promise<void> {
  try {
    await api.delete(`/api/pacientes/me/alergias/${idAlerPade}`);
  } catch (e) {
    normalizeError(e);
  }
}

export async function cancelarCita(folioCita: number): Promise<void> {
  try {
    await api.post(`/api/citas/${folioCita}/cancelar/paciente`);
  } catch (e) {
    normalizeError(e);
  }
}

export async function pagarCita(id: number) {
  await api.post(`/api/citas/${id}/pagar`);
}