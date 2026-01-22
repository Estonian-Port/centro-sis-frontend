import api from "@/helper/auth.interceptor";
import { Access, Estadistica } from "@/model/model";

const ADMIN = "/administracion";

class AdministracionService {
  getEstadisticas = async (): Promise<Estadistica> => {
    const response = await api.get(`${ADMIN}/estadisticas`);
    return response.data.data;
  };

  // Registrar ingreso manual (admin)
  registrarIngresoManual = async (adminId: number, usuarioId: number): Promise<Access> => {
    const response = await api.post(`/acceso/manual/${adminId}/${usuarioId}`);
    return response.data;
  };
}

export const administracionService = new AdministracionService();
