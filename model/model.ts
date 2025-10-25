export enum Rol {
  ALUMNO = 'ALUMNO',
  PROFESOR = 'PROFESOR',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

export enum EstadoUsuario {
  ALTA = 'ALTA',
  BAJA = 'BAJA',
  SUSPENDIDO = 'SUSPENDIDO'
}

export enum TipoPago {
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  ANUAL = 'ANUAL'
}

export enum TipoAcceso {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA'
}

export enum PaymentType {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  TARJETA = 'TARJETA'
}

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