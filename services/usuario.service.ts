import api from "@/helper/auth.interceptor";
import {CursoInformacion, NuevoUsuario, ProfesorLista, UsuarioAdministracion} from "@/model/model";

const USER = '/usuario';

class UsuarioService {

  getAllUsuarios = async (id : number): Promise<UsuarioAdministracion[]> => {
    const response = await api.get(`${USER}/all/${id}`);
    return response.data.data;
  };

  getAllByProfesor = async (id: number): Promise<CursoInformacion[]> => {
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

}

export const usuarioService = new UsuarioService();