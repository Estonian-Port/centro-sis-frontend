// services/acceso.service.ts
import api from "@/helper/auth.interceptor";
import { Access, PaginatedResponse, Rol } from "@/model/model";

export interface AccesoFilters {
  page?: number;
  size?: number;
  search?: string;
  roles?: Rol[];
  meses?: number[];
}

export const accesoService = {
  // ========================================
  // GET - MIS ACCESOS
  // ========================================
  
  /**
   * Obtener mis accesos (usuario actual)
   */
  getMisAccesos: async (
    usuarioId: number,
    filters: { page?: number; size?: number; meses?: number[] }
  ): Promise<PaginatedResponse<Access>> => {
    const { page = 0, size = 20, meses } = filters;
    
    const response = await api.get(`/accesos/mis-accesos/${usuarioId}`, {
      params: {
        page,
        size,
        meses: meses && meses.length > 0 ? meses : undefined,
      },
    });
    
    return response.data;
  },

  // ========================================
  // GET - TODOS LOS ACCESOS
  // ========================================
  
  /**
   * Obtener todos los accesos con filtros (Admin/Oficina)
   */
  getTodosAccesos: async (
    usuarioId: number,
    filters: AccesoFilters
  ): Promise<PaginatedResponse<Access>> => {
    const { page = 0, size = 20, search, roles, meses } = filters;
    
    const response = await api.get(`/accesos/todos/${usuarioId}`, {
      params: {
        page,
        size,
        search,
        roles: roles && roles.length > 0 ? roles : undefined,
        meses: meses && meses.length > 0 ? meses : undefined,
      },
    });
    
    return response.data;
  },

  // ========================================
  // POST - REGISTRAR ACCESO MANUAL
  // ========================================
  
  /**
   * Registrar acceso manualmente (Admin/Oficina)
   */
  registrarAccesoManual: async (
    adminId: number,
    usuarioId: number
  ): Promise<Access> => {
    const response = await api.post(`/accesos/manual/${adminId}`, {
      usuarioId,
    });
    return response.data;
  },

  // ========================================
  // POST - REGISTRAR ACCESO QR (futuro)
  // ========================================
  
  /**
   * Registrar acceso por QR
   */
  registrarAccesoQR: async (usuarioId: number): Promise<Access> => {
    const response = await api.post(`/accesos/qr/${usuarioId}`);
    return response.data;
  },
};