import {
  Estado,
  EstadoCurso,
  EstadoPago,
  PagoDisplay,
  PagoDTO,
  Rol,
  TipoPagoConcepto,
} from "@/model/model";

// Mapeo de Rol a variante de Tag
export const rolToTagVariant = (
  rol: Rol,
): "primary" | "success" | "warning" | "danger" | "info" => {
  switch (rol) {
    case Rol.ALUMNO:
      return "primary";
    case Rol.PROFESOR:
      return "success";
    case Rol.ADMINISTRADOR:
      return "danger";
    case Rol.OFICINA:
      return "warning";
    case Rol.PORTERIA:
      return "info";
    default:
      return "info";
  }
};

// Mapeo de Estado de Usuario a variante de Tag
export const estadoUsuarioToTagVariant = (
  estado: Estado,
): "success" | "warning" | "danger" | "info" => {
  switch (estado) {
    case Estado.ACTIVO:
      return "success";
    case Estado.INACTIVO:
      return "info";
    case Estado.PENDIENTE:
      return "warning";
    case Estado.BAJA:
      return "danger";
    default:
      return "info";
  }
};

// Mapeo de Estado (general) a variante de Tag
export const estadoToTagVariant = (
  estado: Estado,
): "success" | "warning" | "danger" | "info" => {
  return estadoUsuarioToTagVariant(estado);
};

// Mapeo de Estado de Curso a variante de Tag
export const estadoCursoToTagVariant = (
  estado: EstadoCurso,
): "primary" | "success" | "warning" | "info" => {
  switch (estado) {
    case EstadoCurso.POR_COMENZAR:
      return "primary";
    case EstadoCurso.EN_CURSO:
      return "success";
    case EstadoCurso.FINALIZADO:
      return "info";
    default:
      return "info";
  }
};

// Mapeo de Estado de Pago a variante de Tag
export const estadoPagoToTagVariant = (
  estadoPago: EstadoPago,
): "success" | "warning" | "danger" | "info" => {
  switch (estadoPago) {
    case EstadoPago.AL_DIA:
      return "success";
    case EstadoPago.ATRASADO:
      return "danger";
    case EstadoPago.PENDIENTE:
      return "info";
    case EstadoPago.PAGO_COMPLETO:
      return "success";
    default:
      return "info";
  }
};

export const formatDateToDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00"); // Forzar timezone local
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getRolLabel = (rol: Rol): string => {
  switch (rol) {
    case "ADMINISTRADOR":
      return "Administrador";
    case "OFICINA":
      return "Oficina";
    case "PROFESOR":
      return "Profesor";
    case "ALUMNO":
      return "Alumno";
    case "PORTERIA":
      return "Portería";
    default:
      return rol;
  }
};

const getRolIcon = (rol: Rol): string => {
  switch (rol) {
    case "ADMINISTRADOR":
      return "shield-checkmark";
    case "OFICINA":
      return "briefcase";
    case "PROFESOR":
      return "school";
    case "ALUMNO":
      return "person";
    case "PORTERIA":
      return "key";
    default:
      return "person";
  }
};

const getRolColor = (rol: Rol): string => {
  switch (rol) {
    case "ADMINISTRADOR":
      return "#ef4444";
    case "OFICINA":
      return "#3b82f6";
    case "PROFESOR":
      return "#10b981";
    case "ALUMNO":
      return "#f59e0b";
    case "PORTERIA":
      return "#8b5cf6";
    default:
      return "#6b7280";
  }
};

export const formatEstadoPago = (estado?: string) => {
  if (!estado) return "-";
  const map: Record<string, string> = {
    PENDIENTE: "PENDIENTE",
    AL_DIA: "AL DÍA",
    ATRASADO: "ATRASADO",
    PAGO_COMPLETO: "PAGO COMPLETO",
  };
  if (map[estado]) return map[estado];
  return estado
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatEstadoCurso = (estado?: string) => {
  if (!estado) return "-";
  const map: Record<string, string> = {
    FINALIZADO: "FINALIZADO",
    EN_CURSO: "EN CURSO",
    POR_COMENZAR: "POR COMENZAR",
  };
  if (map[estado]) return map[estado];
  return estado
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Función helper para convertir PagoDTO a PagoDisplay
export function pagoToDisplay(pago: PagoDTO): PagoDisplay {
  const estaActivo = !pago.fechaBaja;

  // Construir nombres completos
  const usuarioPaga = pago.usuarioPagaNombre
    ? `${pago.usuarioPagaNombre} ${pago.usuarioPagaApellido || ""}`.trim()
    : "Instituto";

  const usuarioRecibe = pago.usuarioRecibeNombre
    ? `${pago.usuarioRecibeNombre} ${pago.usuarioRecibeApellido || ""}`.trim()
    : "Instituto";

  return {
    id: pago.id,
    monto: pago.monto,
    fecha: pago.fecha,
    concepto: pago.tipo,
    curso: pago.cursoNombre,
    usuarioPago: usuarioPaga,
    usuarioRecibe: usuarioRecibe,
    retraso: pago.retraso ?? undefined,
    beneficio: pago.beneficioAplicado ?? undefined,
    estaActivo,
  };
}

// Helper para formatear concepto (sin cambios)
export function formatConcepto(concepto: TipoPagoConcepto): string {
  const map: Record<TipoPagoConcepto, string> = {
    [TipoPagoConcepto.CURSO]: "Cursada",
    [TipoPagoConcepto.ALQUILER]: "Alquiler",
    [TipoPagoConcepto.COMISION]: "Comisión",
  };
  return map[concepto];
}
