import api from "@/helper/auth.interceptor";
import {CursoAlumno, Curso, nuevoCursoAlquiler, nuevoCursoComision} from "@/model/model";

const CURSO = '/curso';

class CursoService {

  getAllCursos = async (): Promise<Curso[]> => {
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

  getById = async (id: number): Promise<Curso> => {
    const response = await api.get(`${CURSO}/${id}`);
    return response.data.data;
  }

}

export const cursoService = new CursoService();