// util/calcularCuotas.ts - ✅ VERSIÓN UNIFICADA FINAL

/**
 * ✅ CRITERIO DE CÁLCULO DE CUOTAS:
 * - Se cobra 1 cuota por cada mes (30 días)
 * - Si hay más de 15 días adicionales, se cobra cuota extra
 * - INCLUYE el día final en el cálculo
 * 
 * Ejemplos con 1 Enero a 1 Febrero:
 * - Días totales: 32 (incluye ambos días)
 * - 32 días = 1 mes + 2 días → 1 cuota
 * 
 * Ejemplos con 1 Enero a 16 Febrero:
 * - Días totales: 47 (incluye ambos días)
 * - 47 días = 1 mes + 17 días → 2 cuotas ✅ (más de 15 días extra)
 */
export function calcularCuotas(
  fechaInicio: Date | string | null,
  fechaFin: Date | string | null
): number {
  if (!fechaInicio || !fechaFin) return 0;

  // Convertir a Date si es string
  const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

  // ✅ CALCULAR DÍAS INCLUYENDO DÍA FINAL
  const diferenciaMs = fin.getTime() - inicio.getTime();
  const diasTotales = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;

  // Validar que fechaFin sea mayor o igual que fechaInicio
  if (diasTotales <= 0) return 0;

  // Calcular meses completos (cada 30 días)
  const mesesCompletos = Math.floor(diasTotales / 30);
  
  // Calcular días restantes después de los meses completos
  const diasRestantes = diasTotales % 30;

  // ✅ Si hay más de 15 días restantes, se cobra una cuota adicional
  const cuotasAdicionales = diasRestantes > 15 ? 1 : 0;

  const totalCuotas = mesesCompletos + cuotasAdicionales;

  return Math.max(1, totalCuotas); // Mínimo 1 cuota
}

/**
 * ✅ Formatea la duración del curso en texto legible
 * INCLUYE el día final en el cálculo
 */
export function calcularDuracionEnTexto(
  fechaInicio: Date | string,
  fechaFin: Date | string
): string {
  const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

  // ✅ MISMO CÁLCULO QUE calcularCuotas (incluye día final)
  const diferenciaMs = fin.getTime() - inicio.getTime();
  const diasTotales = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;

  // Calcular meses y días (usando 30 días por mes)
  const meses = Math.floor(diasTotales / 30);
  const dias = diasTotales % 30;

  if (meses === 0) {
    return `${diasTotales} ${diasTotales === 1 ? "día" : "días"}`;
  } else if (dias === 0) {
    return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  } else {
    return `${meses} ${meses === 1 ? "mes" : "meses"} y ${dias} ${dias === 1 ? "día" : "días"}`;
  }
}

/**
 * ✅ Verifica si se está cobrando una cuota adicional por los días extras
 */
export function tieneCuotaAdicional(
  fechaInicio: Date | string,
  fechaFin: Date | string
): boolean {
  const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

  // ✅ MISMO CÁLCULO (incluye día final)
  const diferenciaMs = fin.getTime() - inicio.getTime();
  const diasTotales = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;
  const diasRestantes = diasTotales % 30;
  
  return diasRestantes > 15;
}

/**
 * ✅ Obtiene información completa sobre el cálculo de cuotas
 * Útil para debugging y mostrar detalles al usuario
 */
export function obtenerInfoCuotas(
  fechaInicio: Date | string | null,
  fechaFin: Date | string | null
) {
  if (!fechaInicio || !fechaFin) {
    return {
      cuotas: 0,
      diasTotales: 0,
      mesesCompletos: 0,
      diasRestantes: 0,
      tieneCuotaAdicional: false,
      duracionTexto: "",
    };
  }

  const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

  // ✅ MISMO CÁLCULO EN TODOS LADOS
  const diferenciaMs = fin.getTime() - inicio.getTime();
  const diasTotales = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;
  const mesesCompletos = Math.floor(diasTotales / 30);
  const diasRestantes = diasTotales % 30;
  const cuotasAdicionales = diasRestantes > 15 ? 1 : 0;

  return {
    cuotas: Math.max(1, mesesCompletos + cuotasAdicionales),
    diasTotales,
    mesesCompletos,
    diasRestantes,
    tieneCuotaAdicional: diasRestantes > 15,
    duracionTexto: calcularDuracionEnTexto(inicio, fin),
  };
}

/**
 * ✅ Helper para obtener solo los días totales (con día final incluido)
 * Útil cuando solo necesitas el número de días
 */
export function calcularDiasTotales(
  fechaInicio: Date | string,
  fechaFin: Date | string
): number {
  const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

  const diferenciaMs = fin.getTime() - inicio.getTime();
  return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;
}