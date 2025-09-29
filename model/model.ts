export enum Role {
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

export interface User {
  id: number;
  email: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  roles: Role[];
  estado: EstadoUsuario;
  cursosActivos?: Course[];
  cursosDadosDeBaja?: Course[];
  beneficios?: string[];
  firstLogin?: boolean;
}

export interface Course {
  id: number;
  nombre: string;
  dias: string[];
  horario: string;
  profesor?: User;
  arancel: number;
  tipoPago: TipoPago;
  estado: EstadoUsuario;
  alumnos?: User[];
  alumnosActivos?: User[];
  alumnosDadosDeBaja?: User[];
}

export interface Payment {
  id: number;
  curso: Course;
  alumno: User;
  monto: number;
  tipo: PaymentType;
  fecha: string;
  recargo?: number;
  beneficios?: string[];
}

export interface Access {
  id: number;
  usuario: User;
  fecha: string;
  tipo: TipoAcceso;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}