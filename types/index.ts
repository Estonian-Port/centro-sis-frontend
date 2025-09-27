export interface User {
  id: number;
  email: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  roles: Role[];
  estado: 'ALTA' | 'BAJA';
  cursosActivos?: Course[];
  cursosDadosDeBaja?: Course[];
  beneficios?: string[];
  firstLogin?: boolean;
}

export interface Role {
  id: number;
  nombre: 'ALUMNO' | 'PROFESOR' | 'ADMINISTRADOR';
}

export interface Course {
  id: number;
  nombre: string;
  dias: string[];
  horario: string;
  profesor?: User;
  arancel: number;
  tipoPago: 'MENSUAL' | 'POR_MESES' | 'PAGO_UNICO';
  estado: 'ALTA' | 'BAJA';
  alumnos?: User[];
  alumnosActivos?: User[];
  alumnosDadosDeBaja?: User[];
}

export interface Payment {
  id: number;
  curso: Course;
  alumno: User;
  monto: number;
  tipo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO';
  fecha: string;
  recargo?: number;
  beneficios?: string[];
}

export interface Access {
  id: number;
  usuario: User;
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA';
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