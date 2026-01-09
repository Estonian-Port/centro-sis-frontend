import { TagVariant } from "@/components/ui/Tag";
import { EstadoCurso, EstadoPago, Estado, Rol } from "@/model/model";

export const rolToTagVariant = (rol: Rol): TagVariant => {
  switch (rol) {
    case Rol.ALUMNO:
      return 'rolAlumno';
    case Rol.PROFESOR:
      return 'rolProfesor';
    case Rol.ADMINISTRADOR:
      return 'rolAdmin';
    case Rol.OFICINA:
      return 'rolOficina';
    default:
      return 'default';
  }
};

export const estadoPagoToTagVariant = (
  estado: EstadoPago
): TagVariant => {
  switch (estado) {
    case EstadoPago.AL_DIA:
      return 'alDia';
    case EstadoPago.ATRASADO:
      return 'atrasado';
    case EstadoPago.MOROSO:
      return 'moroso';
    case EstadoPago.PENDIENTE:
      return 'pendiente';
    default:
      return 'default';
  }
};

export const estadoUsuarioToTagVariant = (
  estado: Estado
): TagVariant => {
  switch (estado) {
    case Estado.ACTIVO:
      return 'activo';
    case Estado.INACTIVO:
      return 'inactivo';
    case Estado.PENDIENTE:
      return 'pendiente';
    case Estado.BAJA:
      return 'baja';
    default:
      return 'default';
  }
};

export const estadoCursoToTagVariant = (
  estado: EstadoCurso
): TagVariant => {
  switch (estado) {
    case EstadoCurso.POR_COMENZAR:
      return 'inactivo';
    case EstadoCurso.EN_CURSO:
      return 'activo';
    case EstadoCurso.FINALIZADO:
      return 'finalizado';
    case EstadoCurso.PENDIENTE:
      return 'pendiente';
    default:
      return 'default';
  }
};