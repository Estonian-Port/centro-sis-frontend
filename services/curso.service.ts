import api from "@/helper/auth.interceptor";
import {CursoAdministracion, CursoAlumno, CursoProfesor} from "@/model/model";

const CURSO = '/curso';

class CursoService {
    getAllByAlumno = async (id: number): Promise<CursoAlumno[]> => {
    const response = await api.get(`${CURSO}/getAllByAlumnoId/${id}`);
    return response.data.data;
  };

  getAllCursos = async (): Promise<CursoAdministracion[]> => {
    const response = await api.get(`${CURSO}/all`);
    return response.data.data;
  };

}

export const cursoService = new CursoService();