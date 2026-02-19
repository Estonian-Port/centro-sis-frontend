import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";

export const API_BASE_URL = __DEV__
  ? //'http://192.168.100.130:8080' // Seba
    "http://192.168.0.100:8080" // Gabi
  : "http://localhost:8080"; // Localhost
//: //'http://172.20.10.2:8080'
//'https://api.centrosis.tenri.com.ar'; // Producción

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// ✅ INTERCEPTOR DE REQUEST (ya lo tenías)
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

// ✅ NUEVO: INTERCEPTOR DE RESPONSE (extrae mensajes del backend)
api.interceptors.response.use(
  // Respuestas exitosas (2xx) pasan directamente
  (response) => response,
  
  // Errores se procesan aquí
  (error: AxiosError<any>) => {
    // Estructura del error mejorada
    const enhancedError = {
      message: 'Error desconocido',
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    if (error.response) {
      // ✅ El servidor respondió con un código de error (4xx, 5xx)
      
      // Caso 1: Backend envía CustomResponse con mensaje
      if (error.response.data?.message) {
        enhancedError.message = error.response.data.message;
      }
      // Caso 2: Backend envía solo un string
      else if (typeof error.response.data === 'string') {
        enhancedError.message = error.response.data;
      }
      // Caso 3: Spring Boot error estándar
      else if (error.response.data?.error) {
        enhancedError.message = error.response.data.error;
      }
      // Caso 4: Mensaje genérico según status
      else {
        switch (error.response.status) {
          case 400:
            enhancedError.message = 'Datos inválidos';
            break;
          case 401:
            enhancedError.message = 'No autorizado';
            break;
          case 403:
            enhancedError.message = 'Acceso denegado';
            break;
          case 404:
            enhancedError.message = 'Recurso no encontrado';
            break;
          case 409:
            enhancedError.message = 'Conflicto - El recurso ya existe';
            break;
          case 500:
            enhancedError.message = 'Error del servidor';
            break;
          default:
            enhancedError.message = `Error ${error.response.status}`;
        }
      }
    } else if (error.request) {
      // ✅ La petición se hizo pero no hubo respuesta (timeout, red caída)
      enhancedError.message = 'Sin conexión al servidor';
    } else {
      // ✅ Error al configurar la petición
      enhancedError.message = error.message || 'Error al realizar la petición';
    }

    return Promise.reject(enhancedError);
  }
);

export const getErrorMessage = (error: any): string => {

  // Caso 1: Es un string directo
  if (typeof error === 'string') return error;
  
  // Caso 2: Axios response con data.message (lo más común con CustomResponse)
  if (error?.response?.data?.message) return error.response.data.message;
  
  // Caso 3: Axios response con data.error
  if (error?.response?.data?.error) return error.response.data.error;
  
  // Caso 4: Response data es string directo
  if (typeof error?.response?.data === 'string') return error.response.data;
  
  // Caso 5: AxiosError con mensaje pero SIN response
  // Ejemplo: "Request failed with status code 403"
  if (error?.message && error?.message.includes('status code')) {
    const match = error.message.match(/status code (\d+)/);
    if (match) {
      const statusCode = match[1];
      switch (statusCode) {
        case '400': 
          return 'Solicitud inválida. Verificá los datos ingresados.';
        case '401': 
          return 'No autorizado. Iniciá sesión nuevamente.';
        case '403': 
          return 'Acceso denegado. No tenés permisos para esta acción.';
        case '404': 
          return 'Recurso no encontrado.';
        case '409': 
          return 'El recurso ya existe en el sistema.';
        case '500': 
          return 'Error interno del servidor. Intentá nuevamente más tarde.';
        default: 
          return `Error del servidor (código ${statusCode})`;
      }
    }
  }
  
  // Caso 6: Mensaje genérico de Axios
  if (error?.message) return error.message;
  
  // Caso 7: StatusText de response
  if (error?.response?.statusText) return error.response.statusText;
  
  return 'Ocurrió un error inesperado';
};

export default api;