import {
  AuthResponse,
  Course,
  EstadoUsuario,
  PaginatedResponse,
  Role,
  TipoPago,
  User
} from '@/model/model';

const mockUsers: User[] = [
  {
    id: 1,
    email: 'alumno@test.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    telefono: '1234567890',
    roles: [ Role.ALUMNO ],
    estado: EstadoUsuario.ALTA,
    beneficios: ['Pago total', 'Familiar'],
    firstLogin: true,
    cursosActivos: [],
    cursosDadosDeBaja: [],
  },
  {
    id: 2,
    email: 'profesor@test.com',
    nombre: 'María',
    apellido: 'García',
    dni: '87654321',
    telefono: '0987654321',
    roles: [ Role.PROFESOR ],
    estado: EstadoUsuario.ALTA,
    firstLogin: false,
    cursosActivos: [],
    cursosDadosDeBaja: [],
  },
  {
    id: 3,
    email: 'admin@test.com',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    dni: '11111111',
    telefono: '1111111111',
    roles: [ Role.ADMINISTRADOR ],
    estado: EstadoUsuario.ALTA,
    firstLogin: false,
    cursosActivos: [],
    cursosDadosDeBaja: [],
  },
  {
    id: 4,
    email: 'profesoralumno@test.com',
    nombre: 'Pedro',
    apellido: 'López',
    dni: '22222222',
    telefono: '2222222222',
    roles: [Role.ALUMNO, Role.PROFESOR],
    estado: EstadoUsuario.ALTA,
    firstLogin: false,
    cursosActivos: [],
    cursosDadosDeBaja: [],
  },
  {
    id: 5,
    email: 'completo@test.com',
    nombre: 'Ana',
    apellido: 'Martínez',
    dni: '33333333',
    telefono: '3333333333',
    roles: [ Role.ALUMNO, Role.PROFESOR, Role.ADMINISTRADOR ],
    estado: EstadoUsuario.ALTA,
    beneficios: ['Hermano'],
    firstLogin: true,
    cursosActivos: [],
    cursosDadosDeBaja: [],
  },
];

const mockCourses: Course[] = [
  {
    id: 1,
    nombre: 'Clase de Idioma Japones T',
    dias: ['Lunes', 'Miércoles', 'Viernes'],
    horario: '14:00-16:00',
    arancel: 15000,
    tipoPago: TipoPago.MENSUAL,
    estado: EstadoUsuario.ALTA,
    profesor: mockUsers[1], // María García
  },
  {
    id: 2,
    nombre: 'Taekwondo',
    dias: ['Martes', 'Jueves'],
    horario: '16:00-18:00',
    arancel: 20000,
    tipoPago: TipoPago.MENSUAL,
    estado: EstadoUsuario.ALTA,
    profesor: mockUsers[1], // María García
  },
  {
    id: 3,
    nombre: 'Kendo - Aido',
    dias: ['Lunes', 'Miércoles'],
    horario: '10:00-12:00',
    arancel: 18000,
    tipoPago: TipoPago.TRIMESTRAL,
    estado: EstadoUsuario.ALTA,
    profesor: mockUsers[3], // Pedro López
  },
];

export const apiMock = {
  // Auth
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = mockUsers.find((u) => u.email === email);
    if (!user || password !== '123456') {
      throw new Error('Credenciales inválidas');
    }

    return {
      token: 'mock-jwt-token-' + Date.now(),
      user
    };
  },

  // Users
  getUsers: async (params: any = {}): Promise<PaginatedResponse<User>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredUsers = [...mockUsers];
    
    if (params.role) {
      filteredUsers = filteredUsers.filter((u) =>
        u.roles.some((r) => r === params.role)
      );
    }
    
    if (params.estado) {
      filteredUsers = filteredUsers.filter((u) => u.estado === params.estado);
    }
    
    if (params.q) {
      const query = params.q.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.nombre?.toLowerCase().includes(query) ||
          u.apellido?.toLowerCase().includes(query) ||
          u.dni?.includes(params.q) ||
          u.email?.toLowerCase().includes(query)
      );
    }

    const page = params.page || 0;
    const size = params.size || 10;
    const start = page * size;
    const end = start + size;
    const paginatedUsers = filteredUsers.slice(start, end);

    return {
      content: paginatedUsers,
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / size),
      page,
      size,
    };
  },

  getUser: async (id: number): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('Usuario no encontrado');
    
    return user;
  },

  // Courses
  getCourses: async (params: any = {}): Promise<PaginatedResponse<Course>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let filteredCourses = [...mockCourses];
    
    if (params.estado) {
      filteredCourses = filteredCourses.filter((c) => c.estado === params.estado);
    }
    
    if (params.tipoPago) {
      filteredCourses = filteredCourses.filter((c) => c.tipoPago === params.tipoPago);
    }
    
    if (params.q) {
      const query = params.q.toLowerCase();
      filteredCourses = filteredCourses.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(query) ||
          c.profesor?.nombre?.toLowerCase().includes(query) ||
          c.profesor?.apellido?.toLowerCase().includes(query)
      );
    }

    const page = params.page || 0;
    const size = params.size || 10;
    const start = page * size;
    const end = start + size;
    const paginatedCourses = filteredCourses.slice(start, end);

    return {
      content: paginatedCourses,
      totalElements: filteredCourses.length,
      totalPages: Math.ceil(filteredCourses.length / size),
      page,
      size,
    };
  },

  getCourse: async (id: number): Promise<Course> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const course = mockCourses.find(c => c.id === id);
    if (!course) throw new Error('Curso no encontrado');
    
    return course;
  },
};