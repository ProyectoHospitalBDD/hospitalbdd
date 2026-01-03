import axios from "axios";

export interface RegisterPayload {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
  correo: string;
  telPersonal: string;
  telCasa?: string | null;
  password: string;
}

export const register = async (data: RegisterPayload) => {
  const response = await axios.post("/api/auth/register", data);
  return response.data;
};


