import api from "@/helper/auth.interceptor";
import {Curso, CursoAlumno, NuevoUsuario, ProfesorLista, Usuario, UsuarioDetails} from "@/model/model";

const USER = '/usuario';

class UsuarioService {

  getAllUsuarios = async (id : number): Promise<Usuario[]> => {
    const response = await api.get(`${USER}/all/${id}`);
    return response.data.data;
  };

  getAllCoursesByAlumno = async (id: number): Promise<CursoAlumno[]> => {
    const response = await api.get(`${USER}/cursos-alumno/${id}`);
    return response.data.data;
  }

  getAllCoursesByProfesor = async (id: number): Promise<Curso[]> => {
    const response = await api.get(`${USER}/cursos-profesor/${id}`);
    return response.data.data;
  }

  altaUsuario = async (usuario: NuevoUsuario): Promise<void> => {
    const response = await api.post(`${USER}/altaUsuario`, usuario);
    return response.data.data;
  };

  getNombresProfesores = async (): Promise<ProfesorLista[]> => {
    const response = await api.get(`${USER}/profesores`);
    return response.data.data;
  }

  getUserDetail = async (id: number): Promise<UsuarioDetails> => {
    const response = await api.get(`${USER}/detalle/${id}`);
    return response.data.data;
  }

  toggleEstadoUsuario = async (id: number): Promise<void> => {
    const response = await api.patch(`${USER}/toggle-estado/${id}`);
    return response.data.data;
  }

  changePassword = async (id: number, newPassword: string): Promise<void> => {
    const response = await api.patch(`${USER}/change-password/${id}`, { newPassword });
    return response.data.data;
  }

  updateProfile = async (id: number, usuario: Partial<UsuarioDetails>): Promise<void> => {
    const response = await api.put(`${USER}/update-perfil/${id}`, usuario);
    return response.data.data;
  }

}

export const usuarioService = new UsuarioService();