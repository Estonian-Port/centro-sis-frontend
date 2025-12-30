import api from "@/helper/auth.interceptor";
import {UsuarioAdministracion} from "@/model/model";

const USER = '/usuario';

class UsuarioService {

  getAllUsuarios = async (id : number): Promise<UsuarioAdministracion[]> => {
    const response = await api.get(`${USER}/all/${id}`);
    return response.data.data;
  };

}

export const usuarioService = new UsuarioService();