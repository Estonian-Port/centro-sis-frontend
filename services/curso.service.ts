import api from "@/helper/auth.interceptor";
import {CursoAlumno, CursoInformacion, nuevoCursoAlquiler, nuevoCursoComision} from "@/model/model";

const CURSO = '/curso';

class CursoService {
    getAllByAlumno = async (id: number): Promise<CursoAlumno[]> => {
    const response = await api.get(`${CURSO}/getAllByAlumnoId/${id}`);
    return response.data.data;
  };

  getAllCursos = async (): Promise<CursoInformacion[]> => {
    const response = await api.get(`${CURSO}/activos`);
    return response.data.data;
  };

  altaCursoAlquiler = async (nuevoCurso: nuevoCursoAlquiler): Promise<any> => {
    const response = await api.post(`${CURSO}/alta-alquiler`, nuevoCurso);
    return response.data;
  }

  altaCursoComision = async (nuevoCurso: nuevoCursoComision): Promise<any> => {
    const response = await api.post(`${CURSO}/alta-comision`, nuevoCurso);
    return response.data;
  }

}

export const cursoService = new CursoService();