import api from "@/helper/auth.interceptor";
import {
  CompleteProfileData,
  Curso,
  CursoAlumno,
  Estado,
  NuevoAlumno,
  NuevoUsuario,
  PaginatedResponse,
  ProfesorLista,
  Rol,
  UpdatePerfilUsuario,
  Usuario,
  UsuarioDetails,
  UsuarioUpdatePassword,
} from "@/model/model";

const USER = "/usuario";

export interface UsuarioFilters {
  page?: number;
  size?: number;
  search?: string;
  roles?: Rol[];
  estados?: Estado[];
}

class UsuarioService {

  /**
   * Versión paginada para la pantalla de administración.
   * Llama a GET /usuario/all-paginado/{userId} con page/size/search/roles/estados.
   */
  getAllUsuariosPaginado = async (
    id: number,
    filters: UsuarioFilters,
  ): Promise<PaginatedResponse<Usuario>> => {
    const { page = 0, size = 10, search, roles, estados } = filters;
    const response = await api.get(`${USER}/all-paginado/${id}`, {
      params: {
        page,
        size,
        search: search || undefined,
        roles: roles && roles.length > 0 ? roles : undefined,
        estados: estados && estados.length > 0 ? estados : undefined,
      },
    });
    return response.data;
  };

  getAllCoursesByAlumno = async (id: number): Promise<CursoAlumno[]> => {
    const response = await api.get(`${USER}/cursos-alumno/${id}`);
    return response.data.data;
  };

  getAllCoursesByProfesor = async (id: number): Promise<Curso[]> => {
    const response = await api.get(`${USER}/cursos-profesor/${id}`);
    return response.data.data;
  };

  altaUsuario = async (usuario: NuevoUsuario): Promise<void> => {
    const response = await api.post(`${USER}/altaUsuario`, usuario);
    return response.data.data;
  };

  registrarAlumno = async (nuevoAlumno: NuevoAlumno): Promise<void> => {
    const response = await api.post(`${USER}/altaAlumno`, nuevoAlumno);
    return response.data.data;
  };

  getNombresProfesores = async (): Promise<ProfesorLista[]> => {
    const response = await api.get(`${USER}/profesores`);
    return response.data.data;
  };

  getUserDetail = async (id: number): Promise<UsuarioDetails> => {
    const response = await api.get(`${USER}/detalle/${id}`);
    return response.data.data;
  };

  toggleEstadoUsuario = async (id: number): Promise<void> => {
    const response = await api.patch(`${USER}/toggle-estado/${id}`);
    return response.data.data;
  };

  changePassword = async (
    usuario: UsuarioUpdatePassword,
    id: number,
  ): Promise<void> => {
    const response = await api.post(`${USER}/update-password/${id}`, usuario);
    return response.data.data;
  };

  updateProfile = async (
    id: number,
    usuario: UpdatePerfilUsuario,
  ): Promise<Usuario> => {
    const response = await api.put(`${USER}/update-perfil/${id}`, usuario);
    return response.data.data;
  };

  searchByRol = async (
    query: string,
    rol: "ALUMNO" | "PROFESOR" | "ADMIN" | "OFICINA",
    cursoId?: number,
    limit: number = 20,
  ): Promise<Usuario[]> => {
    try {
      if (query.length < 2) {
        return [];
      }

      const params: any = {
        q: query,
        rol,
        limit,
      };

      if (cursoId !== undefined) {
        params.cursoId = cursoId;
      }

      const response = await api.get(`${USER}/search-by-rol`, {
        params: params,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al buscar usuarios",
      );
    }
  };

  search = async (query: string): Promise<Usuario[]> => {
    try {
      if (query.length < 2) {
        return [];
      }

      const response = await api.get(`${USER}/search`, {
        params: { q: query },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al buscar usuarios",
      );
    }
  };

  completarPerfil = async (usuario: CompleteProfileData): Promise<Usuario> => {
    const response = await api.put(`${USER}/registro`, usuario);
    return response.data.data;
  };

  bajaTotal = async (id: number, eliminadoPorId: number): Promise<void> => {
    const response = await api.delete(`${USER}/delete/${id}/${eliminadoPorId}`);
    return response.data.data;
  };

  reenviarInvitacion = async (id: number, adminId: number): Promise<void> => {
    const response = await api.post(
      `${USER}/reenviar-invitacion/${id}/${adminId}`,
    );
    return response.data.data;
  };

  asignarRol = async (id: number, rol: string): Promise<Usuario> => {
    const response = await api.post(`${USER}/asignar-rol/${id}/${rol}`);
    return response.data.data;
  };

  removerRol = async (usuarioId: number, rol: string): Promise<void> => {
    await api.delete(`${USER}/${usuarioId}/remover-rol/${rol}`);
  };

  solicitarRecuperarPassword = async (email: string): Promise<void> => {
    await api.post(`${USER}/recuperar-password`, { email });
  };
}

export const usuarioService = new UsuarioService();
