// util/calcularCuotas.ts - ✅ VERSIÓN REFACTORIZADA: MESES CALENDARIO

/**
 * ✅ CRITERIO DE CÁLCULO DE CUOTAS (MESES CALENDARIO):
 * - Se cobra el mes de inicio, el mes de fin y todos los meses intermedios.
 * - No importa el día del mes (ej. del 20 de Enero al 3 de Marzo = 3 cuotas).
 * - Se basa puramente en la posición del mes en el calendario.
 */
export function calcularCuotas(
  fechaInicio: Date | string | null,
  fechaFin: Date | string | null
): number {
  if (!fechaInicio || !fechaFin) return 0;

  // Convertir a objeto Date para extraer año y mes
  const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

  // Validar que la fecha de fin no sea anterior al inicio (en términos de mes/año)
  if (fin < inicio && 
      (fin.getFullYear() < inicio.getFullYear() || 
      (fin.getFullYear() === inicio.getFullYear() && fin.getMonth() < inicio.getMonth()))) {
    return 0;
  }

  // Cálculo: (AñoFin * 12 + MesFin) - (AñoInicio * 12 + MesInicio)
  // Nota: getMonth() devuelve 0-11, lo cual funciona perfecto para esta resta
  const mesesDiferencia = (fin.getFullYear() * 12 + fin.getMonth()) - 
                          (inicio.getFullYear() * 12 + inicio.getMonth());

  // Sumamos 1 para incluir el mes inicial
  const totalCuotas = mesesDiferencia + 1;

  return Math.max(1, totalCuotas); // Mínimo 1 cuota si el curso existe
}

/**
 * ✅ Formatea la duración del curso en texto legible basado en meses calendario
 */
export function calcularDuracionEnTexto(
  fechaInicio: Date | string,
  fechaFin: Date | string
): string {
  const cuotas = calcularCuotas(fechaInicio, fechaFin);
  
  if (cuotas <= 0) return "0 meses";
  if (cuotas === 1) return "1 mes (mes corriente)";
  
  return `${cuotas} meses (período calendario)`;
}

/**
 * ✅ Obtiene información completa sobre el cálculo de cuotas
 * Mantenemos la firma por compatibilidad con tus componentes de UI
 */
export function obtenerInfoCuotas(
  fechaInicio: Date | string | null,
  fechaFin: Date | string | null
) {
  if (!fechaInicio || !fechaFin) {
    return {
      cuotas: 0,
      mesesCalendario: 0,
      duracionTexto: "Sin definir",
      tieneCuotaAdicional: false,
    };
  }

  const cuotas = calcularCuotas(fechaInicio, fechaFin);

  return {
    cuotas: cuotas,
    mesesCalendario: cuotas,
    duracionTexto: calcularDuracionEnTexto(fechaInicio, fechaFin),
    // Estas propiedades quedan por compatibilidad, pero ya no aplican lógica de "días"
    tieneCuotaAdicional: false,
    diasTotales: 0 
  };
}

/**
 * ✅ Verifica si se cobra cuota adicional
 * Con la nueva lógica de meses calendario, ya no existe el concepto de "día 15"
 */
export function tieneCuotaAdicional(): boolean {
  return false;
}

/**
 * ✅ Helper para calcular días totales si todavía lo necesitas para alguna UI
 */
export function calcularDiasTotales(
  fechaInicio: Date | string,
  fechaFin: Date | string
): number {
  const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

  const diferenciaMs = fin.getTime() - inicio.getTime();
  return Math.max(0, Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)) + 1);
}