import api from "@/helper/auth.interceptor";

export interface ReporteFinancieroMensual {
  mes: number;
  anio: number;
  resumen: ResumenFinanciero;
  detalleIngresos: DetalleIngresos;
  detalleEgresos: DetalleEgresos;
  movimientos: MovimientoFinanciero[];
  comparacionMesAnterior: ComparacionMensual | null;
}

export interface ResumenFinanciero {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  porcentajeCambioIngresos: number | null;
  porcentajeCambioEgresos: number | null;
  porcentajeCambioBalance: number | null;
}

export interface DetalleIngresos {
  pagosAlumnos: ConceptoFinanciero;
  alquileresProfesores: ConceptoFinanciero;
  total: number;
}

export interface DetalleEgresos {
  comisionesProfesores: ConceptoFinanciero;
  total: number;
}

export interface ConceptoFinanciero {
  concepto: string;
  cantidad: number;
  subtotal: number;
}

export interface MovimientoFinanciero {
  id: number;
  fecha: string;
  tipo: 'INGRESO' | 'EGRESO';
  categoria: 'PAGO_ALUMNO' | 'ALQUILER_PROFESOR' | 'COMISION_PROFESOR';
  concepto: string;
  monto: number;
  alumno: string | null;
  profesor: string | null;
  curso: string | null;
}

export interface ComparacionMensual {
  mesAnterior: number;
  anioAnterior: number;
  ingresosAnterior: number;
  egresosAnterior: number;
  balanceAnterior: number;
  diferenciaIngresos: number;
  diferenciaEgresos: number;
  diferenciaBalance: number;
  porcentajeIngresos: number;
  porcentajeEgresos: number;
  porcentajeBalance: number;
}

export interface ExportarReporteResponse {
  nombreArchivo: string;
  base64: string;
  mimeType: string;
}

class ReporteFinancieroService {
  
  /**
   * Obtener reporte financiero mensual
   */
  obtenerReporteMensual = async (
    usuarioId: number,
    mes: number,
    anio: number
  ): Promise<ReporteFinancieroMensual> => {
    const response = await api.get(
      `/reportes/financiero/${usuarioId}`,
      { params: { mes, anio } }
    );
    return response.data;
  };

  /**
   * Exportar reporte a Excel
   */
  exportarReporte = async (
    usuarioId: number,
    mes: number,
    anio: number
  ): Promise<ExportarReporteResponse> => {
    const response = await api.get(
      `/reportes/financiero/${usuarioId}/exportar`,
      { params: { mes, anio } }
    );
    return response.data;
  };
}

export const reporteFinancieroService = new ReporteFinancieroService();