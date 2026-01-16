// helper/funciones.ts
import { Estado, EstadoCurso, EstadoPago, Rol } from "@/model/model";

// Mapeo de Rol a variante de Tag
export const rolToTagVariant = (rol: Rol): "primary" | "success" | "warning" | "danger" | "info" => {
  switch (rol) {
    case Rol.ALUMNO:
      return "primary";
    case Rol.PROFESOR:
      return "success";
    case Rol.ADMINISTRADOR:
      return "danger";
    case Rol.OFICINA:
      return "warning";
    default:
      return "info";
  }
};

// Mapeo de Estado de Usuario a variante de Tag
export const estadoUsuarioToTagVariant = (estado: Estado): "success" | "warning" | "danger" | "info" => {
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
export const estadoToTagVariant = (estado: Estado): "success" | "warning" | "danger" | "info" => {
  return estadoUsuarioToTagVariant(estado);
};

// Mapeo de Estado de Curso a variante de Tag
export const estadoCursoToTagVariant = (estado: EstadoCurso): "primary" | "success" | "warning" | "info" => {
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
export const estadoPagoToTagVariant = (estadoPago: EstadoPago): "success" | "warning" | "danger" | "info" => {
  switch (estadoPago) {
    case EstadoPago.AL_DIA:
      return "success";
    case EstadoPago.ATRASADO:
      return "warning";
    case EstadoPago.MOROSO:
      return "danger";
    case EstadoPago.PENDIENTE:
      return "info";
    default:
      return "info";
  }
};

export const formatDateToDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00'); // Forzar timezone local
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};