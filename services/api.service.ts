import axios from "axios";
import { authManager } from './authManager.service';
import { tokenStorage } from './token.service';

const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor: Agregar token a cada petición
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Manejar expiración de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.removeToken();
      authManager.triggerLogout();
    }
    return Promise.reject(error);
  }
);
