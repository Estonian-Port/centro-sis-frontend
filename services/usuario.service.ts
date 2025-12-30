import api from "@/helper/auth.interceptor";
import {CursoProfesor, UsuarioAdministracion} from "@/model/model";

const USER = '/usuario';

class UsuarioService {

  getAllUsuarios = async (id : number): Promise<UsuarioAdministracion[]> => {
    const response = await api.get(`${USER}/all/${id}`);
    return response.data.data;
  };

  getAllByProfesor = async (id: number): Promise<CursoProfesor[]> => {
    const response = await api.get(`${USER}/cursos-profesor/${id}`);
    return response.data.data;
  }

}

export const usuarioService = new UsuarioService();