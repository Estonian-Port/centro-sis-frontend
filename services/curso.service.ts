import api from "@/helper/auth.interceptor";
import {Curso} from "@/model/model";

const CURSO = '/curso';

class CursoService {
    getAllByUsuario = async (id: number): Promise<Curso[]> => {
    const response = await api.get(`${CURSO}/getAllByUsuarioId/${id}`);
    return response.data.data;
  };
}

export const cursoService = new CursoService();