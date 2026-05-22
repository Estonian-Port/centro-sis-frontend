import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { Platform } from "react-native";

export const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || '';

  if (__DEV__ && Platform.OS !== 'web' && envUrl.includes('localhost')) {
    return envUrl;
  }

  return envUrl;
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const enhancedError = {
      message: 'Ocurrió un error inesperado',
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 403) {
        enhancedError.message = 'Servidor en mantenimiento, aguarde y pruebe nuevamente';
      } 
      else if (status === 401) {
        if (data && typeof data === 'object' && data.error) {
          enhancedError.message = data.error;
        } else if (typeof data === 'string') {
          enhancedError.message = data;
        } else {
          enhancedError.message = 'Usuario o password incorrectos';
        }
      } 
      else if (data?.message) {
        enhancedError.message = data.message;
      } 
      else if (data?.error) {
        enhancedError.message = data.error;
      } 
      else if (typeof data === 'string') {
        enhancedError.message = data;
      } 
      else {
        switch (status) {
          case 400:
            enhancedError.message = 'Datos inválidos';
            break;
          case 404:
            enhancedError.message = 'Recurso no encontrado';
            break;
          case 409:
            enhancedError.message = 'Conflicto - El recurso ya existe';
            break;
          case 500:
            enhancedError.message = 'Error interno del servidor';
            break;
          default:
            enhancedError.message = `Error ${status}`;
        }
      }
    } else if (error.request) {
      enhancedError.message = 'Sin conexión al servidor';
    } else {
      enhancedError.message = error.message || 'Error al realizar la petición';
    }

    return Promise.reject(enhancedError);
  }
);

export const getErrorMessage = (error: any): string => {
  if (!error) return 'Ocurrió un error inesperado';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  
  if (error?.response?.status === 403) {
    return 'Servidor en mantenimiento, aguarde y pruebe nuevamente';
  }
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data === 'string') return error.response.data;

  return 'Ocurrió un error inesperado';
};

export default api;