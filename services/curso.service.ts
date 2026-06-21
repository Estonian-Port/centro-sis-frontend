import api from "@/helper/auth.interceptor";
import {
  CursoAlumnoInscripto,
  CursoDetalle,
  CursoFilters,
  CursoResumen,
  CustomResponse,
  Horario,
  MiInscripcionCurso,
  nuevoCursoAlquilerAdmin,
  nuevoCursoAlquilerProfesor,
  nuevoCursoComision,
  PaginatedResponse,
  PagoRealizado,
  TipoPago,
} from "@/model/model";

const CURSO = "/curso";


class CursoService {

  // ─── Listados livianos ────────────────────────────────────────────────────

  /** GET /curso/resumen/activos — lista completa liviana (vista de calendario). */
  getResumenActivos = async (): Promise<CursoResumen[]> => {
    const response = await api.get(`${CURSO}/resumen/activos`);
    return response.data.data;
  };

  /** GET /curso/resumen — listado paginado liviano (grilla de administración). */
  getResumenPaginado = async (
    filters: CursoFilters,
  ): Promise<PaginatedResponse<CursoResumen>> => {
    const { page = 0, size = 10, search, estadoAlta, estadoCurso } = filters;
    const response = await api.get(`${CURSO}/resumen`, {
      params: {
        page,
        size,
        search: search || undefined,
        estadoAlta: estadoAlta || undefined,
        estadoCurso: estadoCurso || undefined,
      },
    });
    return response.data;
  };

  /** GET /curso/resumen/profesor/{idProfe} — cursos de un profesor, livianos. */
  getResumenPorProfesor = async (idProfe: number): Promise<CursoResumen[]> => {
    const response = await api.get(`${CURSO}/resumen/profesor/${idProfe}`);
    return response.data.data;
  };

  // ─── Detalle + sub-recursos ───────────────────────────────────────────────
  getDetalle = async (id: number): Promise<CursoDetalle> => {
    const response = await api.get(`${CURSO}/${id}/detalle`);
    return response.data.data;
  };

  /** GET /curso/{cursoId}/alumnos — alumnos inscriptos, paginados. */
  getAlumnosInscriptos = async (
    cursoId: number,
    page = 0,
    size = 20,
  ): Promise<PaginatedResponse<CursoAlumnoInscripto>> => {
    const response = await api.get(`${CURSO}/${cursoId}/alumnos`, {
      params: { page, size },
    });
    return response.data;
  };

  /** GET /curso/{cursoId}/mi-inscripcion?alumnoId= — vista "mi curso" de un alumno. */
  getMiInscripcion = async (
    cursoId: number,
    alumnoId: number,
  ): Promise<MiInscripcionCurso> => {
    const response = await api.get(`${CURSO}/${cursoId}/mi-inscripcion/${alumnoId}`)
    return response.data.data;
  };

  /** GET /curso/{cursoId}/mis-pagos/${alumnoId}*/
  getPagosRealizados = async (
    cursoId: number,
    alumnoId: number,
  ): Promise<PagoRealizado[]> => {
    const response = await api.get(`${CURSO}/${cursoId}/mis-pagos/${alumnoId}`)
    return response.data.data;
  };

  // ─── Alta ─────────────────────────────────────────────────────────────────

  altaCursoAlquiler = async (
    nuevoCurso: nuevoCursoAlquilerAdmin,
  ): Promise<CustomResponse<CursoDetalle>> => {
    const response = await api.post(`${CURSO}/alta-alquiler`, nuevoCurso);
    return response.data;
  };

  altaCursoComision = async (
    nuevoCurso: nuevoCursoComision,
  ): Promise<CustomResponse<CursoDetalle>> => {
    const response = await api.post(`${CURSO}/alta-comision`, nuevoCurso);
    return response.data;
  };

  completarCursoAlquiler = async (
    curso: nuevoCursoAlquilerProfesor,
  ): Promise<CursoDetalle> => {
    const response = await api.post(
      `${CURSO}/${curso.id}/finalizar-alta-alquiler`,
      curso,
    );
    return response.data.data;
  };

  // ─── Actualización ────────────────────────────────────────────────────────

  updateProfesores = async (
    cursoId: number,
    profesoresIds: number[],
  ): Promise<CursoDetalle> => {
    const response = await api.put(
      `${CURSO}/${cursoId}/profesores`,
      profesoresIds,
    );
    return response.data.data;
  };

  updateNombre = async (
    cursoId: number,
    nuevoNombre: string,
  ): Promise<CursoDetalle> => {
    const response = await api.put(
      `${CURSO}/${cursoId}/nombre?nuevoNombre=${nuevoNombre}`,
    );
    return response.data.data;
  };

  updateHorarios = async (
    cursoId: number,
    horarios: Horario[],
  ): Promise<CursoDetalle> => {
    const response = await api.put(`${CURSO}/${cursoId}/horarios`, horarios);
    return response.data.data;
  };

  updateModalidadesPago = async (
    cursoId: number,
    modalidades: TipoPago[],
  ): Promise<CursoDetalle> => {
    const response = await api.put(
      `${CURSO}/${cursoId}/modalidades-pago`,
      modalidades,
    );
    return response.data.data;
  };

  // ─── Asistencia ───────────────────────────────────────────────────────────

  tomarAsistenciaAutomatica = async (
    cursoId: number,
    usuarioId: number,
    fecha: string,
  ): Promise<CustomResponse<null>> => {
    const response = await api.post(
      `${CURSO}/${cursoId}/tomar-asistencia-automatica/${usuarioId}?fecha=${fecha}`,
    );
    return response.data;
  };

  obtenerPartesAsistencias = async (cursoId: number): Promise<any> => {
    const response = await api.get(`${CURSO}/${cursoId}/partes-asistencia`);
    return response.data.data;
  };

  // ─── Baja ─────────────────────────────────────────────────────────────────

  bajaCurso = async (cursoId: number): Promise<CustomResponse<null>> => {
    const response = await api.delete(`${CURSO}/baja/${cursoId}`);
    return response.data;
  };

}

export const cursoService = new CursoService();