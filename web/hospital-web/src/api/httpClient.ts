import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:5020",
});


http.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
