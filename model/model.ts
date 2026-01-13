export enum Rol {
  ALUMNO = "ALUMNO",
  PROFESOR = "PROFESOR",
  ADMINISTRADOR = "ADMINISTRADOR",
  OFICINA = "OFICINA",
}

export enum Estado {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  PENDIENTE = "PENDIENTE",
  BAJA = "BAJA",
}

export enum EstadoCurso {
  POR_COMENZAR = "POR_COMENZAR",
  EN_CURSO = "EN_CURSO",
  FINALIZADO = "FINALIZADO",
  PENDIENTE = "PENDIENTE",
}

export enum EstadoPago {
  PENDIENTE = "PENDIENTE",
  AL_DIA = "AL DIA",
  ATRASADO = "ATRASADO",
  MOROSO = "MOROSO",
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
  return estado
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

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
  fechaNacimiento: string;
  estado: Estado;
  primerLogin: boolean;
  listaRol: Rol[];
  ultimoIngreso?: string;
}

export interface UsuarioDetails extends Usuario {
  cursosInscriptos?: CursoAlumno[];
  cursosDictados?: Curso[];
  //pagos?: Pago[];
}

export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  fechaNacimiento: string;
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
  alumnosInscriptos: Alumno[];
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoCurso;
  estadoAlta : Estado;
  profesores: Usuario[];
  tiposPago: TipoPago[];
  inscripciones: Inscripcion[];
  recargoPorAtraso: number;
}

export interface CursoAlumno extends Curso {
  estadoPago: EstadoPago;
  tipoPagoElegido: PagoType;
}

export interface Inscripcion {
  id: number;
  alumno: Alumno;
  curso: Curso;
  tipoPagoElegido: TipoPago;
  fechaInscripcion: string;
  pagosRealizados: PagoCurso[];
  estadoPago: EstadoPago;
  beneficio: number;
  puntos: number;
  porcentajeAsistencia: number;
  estado : Estado;
}

export interface UpdatePerfilUsuario {
  nombre: string;
  apellido: string;
  dni: string;
  celular: string;
  email: string;
}

export interface UsuarioUpdatePassword {
  passwordActual: string;
  nuevoPassword: string;
  confirmacionPassword: string;
}

export interface CompleteProfileData {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  celular: number;
  fechaNacimiento: string;
  password: string;
  confirmPassword?: string;
  // Campos individuales para el formulario
  responsableNombre?: string;
  responsableApellido?: string;
  responsableDni?: string;
  responsableCelular?: string;
  responsableRelacion?: string;
  // Objeto que se envía al backend
  adultoResponsable?: AdultoResponsable;
}

export interface AdultoResponsable {
  nombre: string;
  apellido: string;
  dni: string;
  celular: number;
  relacion: string;
}

export interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
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

export interface NuevaInscripcion {
  tipoPagoSeleccionado: string;
  beneficio: number;
}

// model/pago.model.ts - Agregar al archivo model.ts existente

export enum TipoPagoConcepto {
  CURSO = "CURSO",           // Alumno paga inscripción
  ALQUILER = "ALQUILER",     // Profesor paga al instituto
  COMISION = "COMISION",     // Instituto paga a profesor
}

export interface PagoBase {
  id: number;
  monto: number;
  fecha: string;
  fechaBaja?: string | null;
  observaciones?: string | null;
  tipo: TipoPagoConcepto;
}

// Pago de Alumno por Curso
export interface PagoCurso extends PagoBase {
  tipo: TipoPagoConcepto.CURSO;
  inscripcion: {
    id: number;
    alumno: Usuario;
    curso: Curso;
    tipoPagoSeleccionado: TipoPago;
  };
  retraso: boolean;
  beneficioAplicado: number;
}

// Pago de Profesor al Instituto (Alquiler)
export interface PagoAlquiler extends PagoBase {
  tipo: TipoPagoConcepto.ALQUILER;
  curso: Curso;
  profesor: Usuario;
}

// Pago del Instituto a Profesor (Comisión)
export interface PagoComision extends PagoBase {
  tipo: TipoPagoConcepto.COMISION;
  curso: Curso;
  profesor: Usuario;
}

// Union type para todos los pagos
export type Pago = PagoCurso | PagoAlquiler | PagoComision;

// Helper para obtener info unificada de cualquier tipo de pago
export interface PagoDisplay {
  id: number;
  monto: number;
  fecha: string;
  concepto: TipoPagoConcepto;
  curso: string;
  usuarioPago: string;      // Quien pagó
  usuarioRecibe: string;    // Quien recibió
  medioPago?: string;        // NUEVO: Efectivo, Transferencia, Tarjeta
  retraso?: boolean;
  beneficio?: number;
  estaActivo: boolean;
}

// Función helper para convertir cualquier Pago a PagoDisplay
export function pagoToDisplay(pago: Pago): PagoDisplay {
  const estaActivo = !pago.fechaBaja;

  switch (pago.tipo) {
    case TipoPagoConcepto.CURSO:
      return {
        id: pago.id,
        monto: pago.monto,
        fecha: pago.fecha,
        concepto: TipoPagoConcepto.CURSO,
        curso: pago.inscripcion.curso.nombre,
        usuarioPago: `${pago.inscripcion.alumno.nombre} ${pago.inscripcion.alumno.apellido}`,
        usuarioRecibe: "Instituto",
        medioPago: "Efectivo", // Por defecto, debería venir del backend
        retraso: pago.retraso,
        beneficio: pago.beneficioAplicado,
        estaActivo,
      };

    case TipoPagoConcepto.ALQUILER:
      return {
        id: pago.id,
        monto: pago.monto,
        fecha: pago.fecha,
        concepto: TipoPagoConcepto.ALQUILER,
        curso: pago.curso.nombre,
        usuarioPago: `${pago.profesor.nombre} ${pago.profesor.apellido}`,
        usuarioRecibe: "Instituto",
        medioPago: "Transferencia",
        estaActivo,
      };

    case TipoPagoConcepto.COMISION:
      return {
        id: pago.id,
        monto: pago.monto,
        fecha: pago.fecha,
        concepto: TipoPagoConcepto.COMISION,
        curso: pago.curso.nombre,
        usuarioPago: "Instituto",
        usuarioRecibe: `${pago.profesor.nombre} ${pago.profesor.apellido}`,
        medioPago: "Transferencia",
        estaActivo,
      };
  }
}

// Helper para formatear concepto
export function formatConcepto(concepto: TipoPagoConcepto): string {
  const map: Record<TipoPagoConcepto, string> = {
    [TipoPagoConcepto.CURSO]: "Cursada",
    [TipoPagoConcepto.ALQUILER]: "Alquiler",
    [TipoPagoConcepto.COMISION]: "Comisión",
  };
  return map[concepto];
}