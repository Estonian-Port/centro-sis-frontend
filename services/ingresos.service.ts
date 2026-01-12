import api from "@/helper/auth.interceptor";
import { Access, PaginatedResponse } from "@/model/model";

export interface IngresoFilters {
  page?: number;
  size?: number;
  search?: string;
  roles?: string[]; // ALUMNO, PROFESOR, etc
}

export const ingresoService = {
  // Obtener mis ingresos (usuario actual)
  getMisIngresos: async (
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<Access>> => {
    const response = await api.get("/ingresos/mis-ingresos", {
      params: { page, size },
    });
    return response.data;
  },

  // Obtener todos los ingresos (admin)
  getTodosIngresos: async (
    filters: IngresoFilters
  ): Promise<PaginatedResponse<Access>> => {
    const { page = 0, size = 20, search, roles } = filters;
    const response = await api.get("/ingresos", {
      params: {
        page,
        size,
        search,
        roles: roles?.join(","),
      },
    });
    return response.data;
  },

  // Registrar ingreso manual (admin)
  registrarIngresoManual: async (usuarioId: number): Promise<Access> => {
    const response = await api.post(`/ingresos/manual/${usuarioId}`);
    return response.data;
  },

  // Buscar usuarios para ingreso manual (admin)
  buscarUsuarios: async (query: string): Promise<any[]> => {
    if (query.length < 2) return [];
    const response = await api.get("/usuarios/search", {
      params: { q: query },
    });
    return response.data.data || response.data;
  },
};