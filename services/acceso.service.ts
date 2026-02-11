// services/acceso.service.ts
import api from "@/helper/auth.interceptor";
import { Acceso, EstadisticasAcceso, PaginatedResponse, QRData, Rol } from "@/model/model";

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
  ): Promise<PaginatedResponse<Acceso>> => {
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
  ): Promise<PaginatedResponse<Acceso>> => {
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
  ): Promise<Acceso> => {
    const response = await api.post(`/accesos/manual/${adminId}`, {
      usuarioId,
    });
    return response.data;
  },

  // ========================================
  // POST - REGISTRAR ACCESO QR (futuro)
  // ========================================
  
  registrarAccesoQR: async (
    porteriaId: number,
    qrData: QRData
  ): Promise<Acceso> => {
    const response = await api.post(
      `/accesos/registrar-qr/${porteriaId}`,
      {
        usuarioId: qrData.usuarioId,
      }
    );
    return response.data;
  },

    /**
   * Obtener accesos recientes
   */
  getAccesosRecientes: async (): Promise<Acceso[]> => {
    const response = await api.get("/accesos/recientes");
    return response.data;
  },

  /**
   * Obtener accesos de un usuario
   */
  getAccesosPorUsuario: async (
    usuarioId: number,
    dias: number = 30
  ): Promise<Acceso[]> => {
    const response = await api.get(`/accesos/usuario/${usuarioId}`, {
      params: { dias },
    });
    return response.data;
  },

    /**
   * Obtener estadísticas de accesos
   */
  getEstadisticas: async (dias: number = 30): Promise<EstadisticasAcceso> => {
    const response = await api.get("/accesos/estadisticas", {
      params: { dias },
    });
    return response.data;
  },
};