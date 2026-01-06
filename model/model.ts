export enum Rol {
  ALUMNO = 'ALUMNO',
  PROFESOR = 'PROFESOR',
  ADMINISTRADOR = 'ADMINISTRADOR',
  OFICINA = 'OFICINA'
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  BAJA = 'BAJA',
}

export enum EstadoCurso {
  POR_COMENZAR = 'POR_COMENZAR',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  PENDIENTE = 'PENDIENTE',
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

export interface NuevoUsuario {
  email: string;
  roles: string[];
}

export interface Usuario {
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

export interface UsuarioDetails extends Usuario {
  cursosInscriptos?: CursoAlumno[];
  cursosDictados?: Curso[];
  //pagos?: Pago[];
}

export interface nuevoCursoAlquiler {
  id: number;
  nombre: string;
  montoAlquiler: number;
  profesoresId: number[];
  fechaInicio: string; // formato "YYYY-MM-DD"
  fechaFin: string; // formato "YYYY-MM-DD"
}

export interface nuevoCursoComision {
  id: number;
  nombre: string;
  horarios: HorarioDto[];
  tipoPago: TipoPago[];
  recargo: number | null;
  comisionProfesor: number | null;
  profesoresId: number[];
  fechaInicio: string; // formato "YYYY-MM-DD"
  fechaFin: string; // formato "YYYY-MM-DD"
}

export interface Curso {
  id: number;
  nombre: string;
  horarios: Horario[];
  alumnosInscriptos: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoCurso;
  profesores: string[];
  tiposPago: TipoPago[];
}

export interface CursoAlumno extends Curso {
  estadoPago: EstadoPago;
  tipoPagoElegido: PagoType;
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

// Enums y tipos
export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum PagoType {
  MENSUAL = "MENSUAL",
  TOTAL = "TOTAL",
  // Comentados para uso futuro
  // TRIMESTRAL = "TRIMESTRAL",
  // SEMESTRAL = "SEMESTRAL",
  // ANUAL = "ANUAL",
}

export interface HorarioDto {
  dia: DayOfWeek;
  horaInicio: string; // formato "HH:mm"
  horaFin: string; // formato "HH:mm"
}

export interface TipoPago {
  tipo: PagoType;
  monto: number;
}

export interface ProfesorLista {
  id: number;
  nombre: string;
  apellido: string;
}