import api from "@/helper/auth.interceptor";
import { NuevaInscripcion } from "@/model/model";
const INSC = "/inscripcion";

export const inscripcionService = {
  /**
   * Inscribir un alumno a un curso
   */
  inscribirAlumno: async (
    cursoId: number,
    alumnoId: number,
    inscripcion: NuevaInscripcion
  ) => {
    try {
      const response = await api.post(
        `${INSC}/usuario/${alumnoId}/curso/${cursoId}`,
          inscripcion,
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al inscribir alumno"
      );
    }
  },

  /**
   * Obtener inscripciones de un alumno
   */
  getInscripcionesPorAlumno: async (alumnoId: number) => {
    try {
      const response = await api.get(`${INSC}/alumno/${alumnoId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener inscripciones"
      );
    }
  },

  /**
   * Obtener inscripciones de un curso
   */
  getInscripcionesPorCurso: async (cursoId: number) => {
    try {
      const response = await api.get(`${INSC}/curso/${cursoId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener inscripciones"
      );
    }
  },

  /**
   * Eliminar inscripción
   */
  eliminarInscripcion: async (inscripcionId: number) => {
    try {
      const response = await api.delete(`${INSC}/${inscripcionId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar inscripción"
      );
    }
  },

  asignarPuntos : async (inscripcionId: number, puntos: number) => {
    try {
      const response = await api.post(
        `${INSC}/${inscripcionId}/asignar-puntos`,
        { puntos }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al asignar puntos"
      );
    }
  },

  actualizarBeneficio : async (inscripcionId: number, beneficio: number) => {
    try {
      const response = await api.put(
        `${INSC}/${inscripcionId}/actualizar-beneficio`,
        { beneficio }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar beneficio"
      );
    }
  },
};
