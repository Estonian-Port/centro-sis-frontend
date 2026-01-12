import api from "@/helper/auth.interceptor";
import { Pago, PaginatedResponse } from "@/model/model";

export interface PagoFilters {
  page?: number;
  size?: number;
  search?: string;
  tipo?: "recibidos" | "realizados";
}

export const pagoService = {
  // Obtener pagos recibidos (según rol)
  getPagosRecibidos: async (
    filters: PagoFilters
  ): Promise<PaginatedResponse<Pago>> => {
    const { page = 0, size = 20, search } = filters;
    const response = await api.get("/pagos/recibidos", {
      params: { page, size, search },
    });
    return response.data;
  },

  // Obtener pagos realizados (según rol)
  getPagosRealizados: async (
    filters: PagoFilters
  ): Promise<PaginatedResponse<Pago>> => {
    const { page = 0, size = 20, search } = filters;
    const response = await api.get("/pagos/realizados", {
      params: { page, size, search },
    });
    return response.data;
  },

  // Registrar pago de curso (alumno)
  registrarPagoCurso: async (data: {
    inscripcionId: number;
    monto: number;
    retraso: boolean;
    beneficioAplicado: number;
  }): Promise<Pago> => {
    const response = await api.post("/pagos/curso", data);
    return response.data;
  },

  // Registrar pago de alquiler (profesor)
  registrarPagoAlquiler: async (data: {
    cursoId: number;
    profesorId: number;
    monto: number;
  }): Promise<Pago> => {
    const response = await api.post("/pagos/alquiler", data);
    return response.data;
  },

  // Registrar pago de comisión (instituto → profesor)
  registrarPagoComision: async (data: {
    cursoId: number;
    profesorId: number;
    monto: number;
  }): Promise<Pago> => {
    const response = await api.post("/pagos/comision", data);
    return response.data;
  },

  // Anular pago (admin)
  anularPago: async (pagoId: number, motivo: string): Promise<void> => {
    await api.post(`/pagos/${pagoId}/anular`, { motivo });
  },
};