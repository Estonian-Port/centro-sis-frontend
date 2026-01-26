export enum Rol {
  ALUMNO = "ALUMNO",
  PROFESOR = "PROFESOR",
  ADMINISTRADOR = "ADMINISTRADOR",
  OFICINA = "OFICINA",
PORTERIA = "PORTERIA",
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
}

export enum EstadoPago {
  PENDIENTE = "PENDIENTE",
  AL_DIA = "AL DIA",
  ATRASADO = "ATRASADO",
  PAGO_COMPLETO = "PAGO COMPLETO",
}

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
  adultoResponsable?: AdultoResponsable;
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

export interface nuevoCursoAlquilerAdmin {
  id: number;
  nombre: string;
  montoAlquiler: number;
  cuotasAlquiler: number;
  profesoresId: number[];
  fechaInicio: string; // formato "YYYY-MM-DD"
  fechaFin: string; // formato "YYYY-MM-DD"
}

export interface nuevoCursoAlquilerProfesor {
  id: number;
  horarios: HorarioDto[];
  tiposPago: TipoPago[];
  recargo: number;
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
  tipoCurso: TipoCurso;
  montoAlquiler?: number;
  cuotasAlquiler?: number;
}

export interface CursoAlumno extends Curso {
  estadoPago: EstadoPago;
  tipoPagoElegido: TipoPago;
  fechaInscripcion: string;
  porcentajeAsistencia: number;
  beneficio: number;
  pagosRealizados: PagoDTO[];
  puntos: number;
}

export enum TipoCurso {
  ALQUILER = "ALQUILER",
  COMISION = "COMISION",
}

export interface Inscripcion {
  id: number;
  alumno: Alumno;
  curso: Curso;
  tipoPagoElegido: TipoPago;
  fechaInscripcion: string;
  pagosRealizados: PagoDTO[];
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

export interface Acceso {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellido: string;
  usuarioDni: string;
  fechaHora: string;
  tipoAcceso: "QR" | "MANUAL";
  alertaPagos?: AlertaPagos;  // ✅ NUEVO
}

export interface QRData {
  usuarioId: number;
  timestamp?: number;  // ✅ Opcional para QR permanente
  tipo: "PERMANENTE";
}

export interface EstadisticasAcceso {
  totalHoy: number;
  totalEstaSemana: number;
  totalEsteMes: number;
  promedioDiario: number;
}

export interface AlertaPagos {
  tieneAtrasos: boolean;
  cursosAtrasados: {
    cursoNombre: string;
    cuotasAtrasadas: number;
    deudaPendiente: number;
  }[];
  mensaje: string;
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
  cuotas: number;
}

export interface ProfesorLista {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
}

export interface NuevaInscripcion {
  tipoPagoSeleccionado: string;
  beneficio: number;
}

export interface UsuarioSimple {
  id: number;
  nombre: string;
  apellido: string;
}

export interface ParteAsistencia {
  id: number;
  fecha: string;
  totalAlumnos: number;
  totalPresentes: number;
  totalAusentes: number;
  presentes: UsuarioSimple[];
  ausentes: UsuarioSimple[];
  porcentajeAsistencia: number;
  tomadoPor: UsuarioSimple;
}

// model/pago.model.ts - Agregar al archivo model.ts existente

// =============================================
// Pago.types.ts - ACTUALIZADO
// =============================================

export enum TipoPagoConcepto {
  CURSO = "CURSO",
  ALQUILER = "ALQUILER",
  COMISION = "COMISION",
}

// ✅ DTO que viene del backend (flat, sin objetos anidados)
export interface PagoDTO {
  id: number;
  monto: number;
  fecha: string;
  fechaBaja?: string | null;
  observaciones?: string | null;
  tipo: TipoPagoConcepto;
  
  // Curso
  cursoId: number;
  cursoNombre: string;
  
  // Usuario que PAGA
  usuarioPagaId?: number | null;
  usuarioPagaNombre?: string | null;
  usuarioPagaApellido?: string | null;
  
  // Usuario que RECIBE
  usuarioRecibeId?: number | null;
  usuarioRecibeNombre?: string | null;
  usuarioRecibeApellido?: string | null;
  
  // Específico de PagoCurso
  inscripcionId?: number | null;
  retraso?: boolean | null;
  beneficioAplicado?: number | null;
}

// ✅ Alias para mantener compatibilidad
export type Pago = PagoDTO;

// ✅ Helper para mostrar en UI (igual que antes pero adaptado)
export interface PagoDisplay {
  id: number;
  monto: number;
  fecha: string;
  concepto: TipoPagoConcepto;
  curso: string;
  usuarioPago: string;
  usuarioRecibe: string;
  retraso?: boolean;
  beneficio?: number;
  estaActivo: boolean;
}

// ✅ Función helper para convertir PagoDTO a PagoDisplay
export function pagoToDisplay(pago: PagoDTO): PagoDisplay {
  const estaActivo = !pago.fechaBaja;

  // Construir nombres completos
  const usuarioPaga = pago.usuarioPagaNombre 
    ? `${pago.usuarioPagaNombre} ${pago.usuarioPagaApellido || ''}`.trim()
    : "Instituto";
    
  const usuarioRecibe = pago.usuarioRecibeNombre
    ? `${pago.usuarioRecibeNombre} ${pago.usuarioRecibeApellido || ''}`.trim()
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

// ✅ Helper para formatear concepto (sin cambios)
export function formatConcepto(concepto: TipoPagoConcepto): string {
  const map: Record<TipoPagoConcepto, string> = {
    [TipoPagoConcepto.CURSO]: "Cursada",
    [TipoPagoConcepto.ALQUILER]: "Alquiler",
    [TipoPagoConcepto.COMISION]: "Comisión",
  };
  return map[concepto];
}

// ✅ Helper para obtener el color según el tipo
export function getConceptoColor(concepto: TipoPagoConcepto): string {
  const map: Record<TipoPagoConcepto, string> = {
    [TipoPagoConcepto.CURSO]: "#4CAF50",      // Verde
    [TipoPagoConcepto.ALQUILER]: "#FF9800",   // Naranja
    [TipoPagoConcepto.COMISION]: "#2196F3",   // Azul
  };
  return map[concepto];
}

export interface PagoPreviewRequest {
  inscripcionId: number;
  aplicarRecargo: boolean;
}

export interface PagoPreview {
  inscripcionId: number;
  alumnoNombre: string;
  cursoNombre: string;
  montoPorCuota: number;
  beneficio: number;
  descuento: number;
  recargoPorcentaje: number;
  recargo: number;
  montoFinal: number;
  aplicaRecargo: boolean;
  cuotasPagadas: number;
  cuotasTotales: number;
  cuotasEsperadas: number;
  cuotasAtrasadas: number;
  puedeRegistrar: boolean;
}

export interface RegistrarPagoCursoRequest {
  inscripcionId: number;
  aplicarRecargo: boolean;
}

export interface PagoFilters {
  page?: number;
  size?: number;
  search?: string;
  tipos?: TipoPagoConcepto[];
  meses?: number[];
}

// ✅ Preview types
export interface PagoAlquilerPreview {
  cursoId: number;
  cursoNombre: string;
  profesores: string[];
  montoPorCuota: number;
  totalCuotas: number;
  cuotasPagadas: number[];
  cuotasPendientes: number[];
  puedeRegistrar: boolean;
}

export interface PagoComisionPreview {
  cursoId: number;
  cursoNombre: string;
  profesorId: number;
  profesorNombre: string;
  porcentajeComision: number;
  fechaInicio: string;
  fechaFin: string;
  diasPeriodo: number;
  recaudacionPeriodo: number;
  montoComision: number;
  puedeRegistrar: boolean;
  mensajeError?: string;
}