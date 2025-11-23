// src/api/authApi.ts
import { http } from "./httpClient";

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  idUsuario: number;
  nombreCompleto: string;
  rol: string;
  token: string;
}

export async function login(data: LoginRequest) {
  const res = await http.post<LoginResponse>("/api/Auth/login", data);
  return res.data;
}
