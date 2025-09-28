import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { User, Role, Course } from '../types';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8080/api';
const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_MODE === 'true';

// ---------------- Axios instance ----------------
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ---------------- Token storage ----------------
export const tokenStorage = {
  async setToken(token: string) {
    if (Platform.OS === 'web') {
      sessionStorage.setItem('token', token);
    } else {
      await SecureStore.setItemAsync('token', token);
    }
  },
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') return sessionStorage.getItem('token');
    return await SecureStore.getItemAsync('token');
  },
  async removeToken() {
    if (Platform.OS === 'web') sessionStorage.removeItem('token');
    else await SecureStore.deleteItemAsync('token');
  },
};

// ---------------- Axios interceptors ----------------
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.removeToken();
      // Aquí podrías agregar lógica para redirigir al login si usas React Navigation}
    }
    return Promise.reject(error);
  }
);

// ---------------- Mock API ----------------
export const mockApi: {
  users: User[];
  courses: Course[];
  login: (
    email: string,
    password: string
  ) => Promise<{ token: string; user: User }>;
  getUsers: (params?: any) => Promise<any>;
  getCourses: (params?: any) => Promise<any>;
} = {
  courses: [
    {
      id: 1,
      nombre: 'Matemáticas Básicas',
      dias: ['Lunes', 'Miércoles', 'Viernes'],
      horario: '14:00-16:00',
      arancel: 15000,
      tipoPago: 'MENSUAL',
      estado: 'ALTA',
      profesor: {
        id: 2,
        nombre: 'María',
        apellido: 'García',
        email: '',
        roles: [],
        estado: 'ALTA',
      },
    },
    {
      id: 2,
      nombre: 'Física Avanzada',
      dias: ['Martes', 'Jueves'],
      horario: '16:00-18:00',
      arancel: 20000,
      tipoPago: 'MENSUAL',
      estado: 'ALTA',
      profesor: {
        id: 2,
        nombre: 'María',
        apellido: 'García',
        email: '',
        roles: [],
        estado: 'ALTA',
      },
    },
  ],

  users: [
    {
      id: 1,
      email: 'alumno@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      telefono: '1234567890',
      roles: [{ id: 1, nombre: 'ALUMNO' as const }],
      estado: 'ALTA',
      beneficios: ['Pago total', 'Familiar'],
      firstLogin: false,
      cursosActivos: [], // Aquí podrías asignar courses si quieres
      cursosDadosDeBaja: [],
    },
    {
      id: 2,
      email: 'profesor@test.com',
      nombre: 'María',
      apellido: 'García',
      dni: '87654321',
      telefono: '0987654321',
      roles: [{ id: 2, nombre: 'PROFESOR' as const }],
      estado: 'ALTA',
      firstLogin: false,
      cursosActivos: [],
      cursosDadosDeBaja: [],
    },
    {
      id: 3,
      email: 'admin@test.com',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      dni: '11111111',
      telefono: '1111111111',
      roles: [{ id: 3, nombre: 'ADMINISTRADOR' as const }],
      estado: 'ALTA',
      firstLogin: false,
      cursosActivos: [],
      cursosDadosDeBaja: [],
    },
  ],

  login: async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula delay

    const user = mockApi.users.find((u) => u.email === email);
    if (!user || password !== '123456')
      throw new Error('Credenciales inválidas');

    return { token: 'mock-jwt-token-' + Date.now(), user };
  },

  getUsers: async (params: any = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredUsers = [...mockApi.users];
    if (params.role)
      filteredUsers = filteredUsers.filter((u) =>
        u.roles.some((r) => r.nombre === params.role)
      );
    if (params.q)
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.nombre?.toLowerCase().includes(params.q.toLowerCase()) ||
          u.apellido?.toLowerCase().includes(params.q.toLowerCase()) ||
          u.dni?.includes(params.q)
      );

    return {
      content: filteredUsers,
      totalElements: filteredUsers.length,
      totalPages: 1,
      page: 0,
      size: 10,
    };
  },

  getCourses: async (params: any = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      content: mockApi.courses,
      totalElements: mockApi.courses.length,
      totalPages: 1,
      page: 0,
      size: 10,
    };
  },
};

export default MOCK_MODE ? mockApi : api;
