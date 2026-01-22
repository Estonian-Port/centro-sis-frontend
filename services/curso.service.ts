import api from "@/helper/auth.interceptor";
import {
  Curso,
  Horario,
  nuevoCursoAlquilerAdmin,
  nuevoCursoAlquilerProfesor,
  nuevoCursoComision,
  TipoPago,
} from "@/model/model";

const CURSO = "/curso";

class CursoService {
  getAllCursos = async (): Promise<Curso[]> => {
    const response = await api.get(`${CURSO}/activos`);
    return response.data.data;
  };

  altaCursoAlquiler = async (
    nuevoCurso: nuevoCursoAlquilerAdmin,
  ): Promise<any> => {
    console.log("Nuevo curso alquiler service", nuevoCurso);
    const response = await api.post(`${CURSO}/alta-alquiler`, nuevoCurso);
    return response.data;
  };

  altaCursoComision = async (nuevoCurso: nuevoCursoComision): Promise<any> => {
    const response = await api.post(`${CURSO}/alta-comision`, nuevoCurso);
    return response.data;
  };

  getById = async (id: number): Promise<Curso> => {
    const response = await api.get(`${CURSO}/${id}`);
    return response.data.data;
  };

  updateProfesores = async (
    cursoId: number,
    profesoresIds: number[],
  ): Promise<any> => {
    const response = await api.put(
      `${CURSO}/${cursoId}/profesores`,
      profesoresIds,
    );
    return response.data;
  };

  updateNombre = async (
    cursoId: number,
    nuevoNombre: string,
  ): Promise<Curso> => {
    const response = await api.put(
      `${CURSO}/${cursoId}/nombre?nuevoNombre=${nuevoNombre}`,
    );
    return response.data;
  };

  updateHorarios = async (
    cursoId: number,
    horarios: Horario[],
  ): Promise<Curso> => {
    const response = await api.put(`${CURSO}/${cursoId}/horarios`, horarios);
    return response.data;
  };

  updateModalidadesPago = async (
    cursoId: number,
    modalidades: TipoPago[],
  ): Promise<any> => {
    const response = await api.put(
      `${CURSO}/${cursoId}/modalidades-pago`,
      modalidades,
    );
    return response.data;
  };

  tomarAsistenciaAutomatica = async (
    cursoId: number,
    usuarioId: number,
    fecha: string,
  ): Promise<any> => {
    const response = await api.post(
      `${CURSO}/${cursoId}/tomar-asistencia-automatica/${usuarioId}?fecha=${fecha}`,
    );
    return response.data;
  };

  obtenerPartesAsistencias = async (cursoId: number): Promise<any> => {
    const response = await api.get(`${CURSO}/${cursoId}/partes-asistencia`);
    return response.data;
  };

  completarCursoAlquiler = async (
    curso: nuevoCursoAlquilerProfesor,
  ): Promise<Curso> => {
    console.log("Completar curso alquiler service", curso);
    const response = await api.post(
      `${CURSO}/${curso.id}/finalizar-alta-alquiler`,
      curso,
    );
    return response.data;
  };

  bajaCurso = async (cursoId: number): Promise<any> => {
    const response = await api.delete(`${CURSO}/baja/${cursoId}`);
    return response.data;
  };

}

export const cursoService = new CursoService();
