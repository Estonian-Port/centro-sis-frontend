// services/pago.service.ts
import api from "@/helper/auth.interceptor";
import { Pago, PaginatedResponse, TipoPagoConcepto, PagoFilters, PagoAlquilerPreview, PagoComisionPreview, PagoMatriculaPreview, EstadoMatricula, ConfiguracionMatricula } from "@/model/model";

export const pagoService = {
  // ========================================
  // GET - PAGOS RECIBIDOS/REALIZADOS
  // ========================================
  
  getPagosRecibidos: async (
    usuarioId: number,
    rol: string,
    filters: PagoFilters,
  ): Promise<PaginatedResponse<Pago>> => {
    const { page = 0, size = 20, search, tipos, meses } = filters;
    
    const response = await api.get(`/pagos/recibidos/${usuarioId}`, {
      params: { 
        page, 
        size, 
        search,
        tipos: tipos && tipos.length > 0 ? tipos : undefined,
        meses: meses && meses.length > 0 ? meses : undefined,
        rolActivo: rol,
      },
    });
    
    return response.data;
  },

  getPagosRealizados: async (
    usuarioId: number,
    rol: string,
    filters: PagoFilters
  ): Promise<PaginatedResponse<Pago>> => {
    const { page = 0, size = 20, search, meses } = filters;
    
    const response = await api.get(`/pagos/realizados/${usuarioId}`, {
      params: { 
        page, 
        size, 
        search,
        meses: meses && meses.length > 0 ? meses : undefined,
        rolActivo: rol,
      },
    });
    
    return response.data;
  },

  // ========================================
  // PREVIEW - ALQUILER
  // ========================================
  
  calcularPreviewAlquiler: async (
    usuarioId: number,
    cursoId: number,
    profesorId: number
  ): Promise<PagoAlquilerPreview> => {
    const response = await api.post(
      `/pagos/alquiler/preview/${usuarioId}/${profesorId}`,
      { cursoId }
    );
    return response.data;
  },

  registrarPagoAlquiler: async (
    usuarioId: number,
    data: {
      cursoId: number;
      numeroCuota: number;
    }
  ): Promise<Pago> => {
    const response = await api.post(`/pagos/alquiler/${usuarioId}`, data);
    return response.data;
  },

  // ========================================
  // PREVIEW - COMISION
  // ========================================
  
  calcularPreviewComision: async (
    usuarioId: number,
    cursoId: number,
    profesorId: number
  ): Promise<PagoComisionPreview> => {
    const response = await api.post(
      `/pagos/comision/preview/${usuarioId}`,
      { cursoId, profesorId }
    );
    return response.data;
  },

  registrarPagoComision: async (
    usuarioId: number,
    data: {
      cursoId: number;
      profesorId: number;
    }
  ): Promise<Pago> => {
    const response = await api.post(`/pagos/comision/${usuarioId}`, data);
    return response.data;
  },

  // ========================================
  // PREVIEW - CURSO 
  // ========================================
  
  calcularPreviewPagoCurso: async (
    usuarioId: number,
    request: { inscripcionId: number; aplicarRecargo: boolean }
  ): Promise<any> => {
    const response = await api.post(
      `/pagos/curso/preview/${usuarioId}`,
      request
    );
    return response.data;
  },

  registrarPagoCurso: async (
    usuarioId: number,
    request: { inscripcionId: number; aplicarRecargo: boolean }
  ): Promise<any> => {
    const response = await api.post(`/pagos/curso/${usuarioId}`, request);
    return response.data;
  },

  // ========================================
  // MATRÍCULA (pago anual del alumno al instituto)
  // ========================================

  calcularPreviewMatricula: async (
    usuarioId: number,
    alumnoId: number,
    anio?: number
  ): Promise<PagoMatriculaPreview> => {
    const response = await api.post(
      `/pagos/matricula/preview/${usuarioId}`,
      { alumnoId, anio }
    );
    return response.data;
  },

  registrarPagoMatricula: async (
    usuarioId: number,
    data: { alumnoId: number; anio?: number }
  ): Promise<Pago> => {
    const response = await api.post(`/pagos/matricula/${usuarioId}`, data);
    return response.data;
  },

  getEstadoMatricula: async (
    alumnoId: number,
    anio?: number
  ): Promise<EstadoMatricula> => {
    const response = await api.get(`/pagos/matricula/estado/${alumnoId}`, {
      params: { anio },
    });
    return response.data;
  },

  getConfiguracionMatricula: async (
    anio?: number
  ): Promise<ConfiguracionMatricula> => {
    const response = await api.get(`/pagos/matricula/config`, {
      params: { anio },
    });
    return response.data;
  },

  setConfiguracionMatricula: async (
    usuarioId: number,
    data: { anio: number; monto: number }
  ): Promise<ConfiguracionMatricula> => {
    const response = await api.post(`/pagos/matricula/config/${usuarioId}`, data);
    return response.data;
  },

  // ========================================
  // ANULAR PAGO
  // ========================================
  
  anularPago: async (
    usuarioId: number,
    pagoId: number,
    motivo: string
  ): Promise<void> => {
    await api.post(`/pagos/${pagoId}/anular/${usuarioId}`, { motivo });
  },


getPagosPorCurso: async (cursoId: number): Promise<Pago[]> => {
  const response = await api.get(`/pagos/curso/${cursoId}`);
  return response.data;
},


};