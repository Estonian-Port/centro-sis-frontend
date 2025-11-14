import api from "@/helper/auth.interceptor";
import {Curso, CursoAdministracion} from "@/model/model";

const CURSO = '/curso';

class CursoService {
    getAllByUsuario = async (id: number): Promise<Curso[]> => {
    const response = await api.get(`${CURSO}/getAllByUsuarioId/${id}`);
    return response.data.data;
  };

  getAllCursos = async (): Promise<CursoAdministracion[]> => {
    const response = await api.get(`${CURSO}/all`);
    return response.data.data;
  };

}

export const cursoService = new CursoService();