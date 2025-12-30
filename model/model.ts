export enum Rol {
  ALUMNO = 'ALUMNO',
  PROFESOR = 'PROFESOR',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  BAJA = 'BAJA',
}

export enum EstadoCurso {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  FINALIZADO = 'FINALIZADO',
}

export enum TipoPago {
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  ANUAL = 'ANUAL'
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  AL_DIA = 'AL DIA',
  ATRASADO = 'ATRASADO',
  MOROSO = 'MOROSO'
}

export const formatEstadoPago = (estado?: string) => {
  if (!estado) return "-";
  const map: Record<string, string> = {
    PENDIENTE: "PENDIENTE",
    AL_DIA: "AL DÍA",
    ATRASADO: "ATRASADO",
    MOROSO: "MOROSO",
  };
  if (map[estado]) return map[estado];
  return estado.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

export enum TipoAcceso {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA'
}

export enum PaymentType {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  TARJETA = 'TARJETA'
}

export enum Beneficio {
  PAGO_TOTAL = 'PAGO TOTAL',
  SEMESTRAL = 'SEMESTRAL',
  FAMILIA = 'FAMILIA'
}

// Interace inicial, creada por la IA
export interface Usuario {
  id: number;
  email: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  listaRol: Rol[];
  estado: EstadoUsuario;
  cursosActivos?: Curso[];
  cursosDadosDeBaja?: Curso[];
  beneficios?: string[];
  primerLogin?: boolean;
}

// Interface para usar en la lista de usuarios de la vista de administracion
export interface UsuarioAdministracion {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  estado: EstadoUsuario;
  primerLogin: boolean;
  listaRol: Rol[];
}

/*
// Interace inicial, creada por la IA
export interface Curso {
  id: number;
  nombre: string;
  dias: string[];
  horario: string;
  profesor?: Usuario;
  arancel: number;
  tipoPago: TipoPago;
  estado: EstadoUsuario;
  alumnos?: Usuario[];
  alumnosActivos?: Usuario[];
  alumnosDadosDeBaja?: Usuario[];
}
*/

export interface Curso {
  id: number;
  nombre: string;
  horarios: Horario[];
  arancel: number;
  tiposPago: TipoPago[];
  profesores: string[];
}

export interface CursoAlumno extends Curso {
  beneficios: Beneficio[];
  estadoPago: EstadoPago;
}

export interface CursoProfesor {
  id: number;
  nombre: string;
  horarios: Horario[];
  alumnosInscriptos: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoCurso;
}

// Interface para usar en la lista de cursos de la vista de administracion
export interface CursoAdministracion {
  id: number;
  nombre: string;
  horarios: Horario[];
  arancel: number;
  tiposPago: TipoPago[];
  profesores: string[];
}

export interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface Pago {
  id: number;
  curso: Curso;
  alumno: Usuario;
  monto: number;
  tipo: PaymentType;
  fecha: string;
  recargo?: number;
  beneficios?: string[];
}

export interface Access {
  id: number;
  usuario: Usuario;
  fecha: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface Estadistica {
  alumnosActivos: number;
  cursos: number;
  profesores: number;
  ingresosMensuales: number;
}