import { TagVariant } from "@/components/ui/Tag";
import { EstadoCurso, EstadoPago, EstadoUsuario, Rol } from "@/model/model";

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
  estado: EstadoUsuario
): TagVariant => {
  switch (estado) {
    case EstadoUsuario.ACTIVO:
      return 'activo';
    case EstadoUsuario.INACTIVO:
      return 'inactivo';
    case EstadoUsuario.PENDIENTE:
      return 'pendiente';
    case EstadoUsuario.BAJA:
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