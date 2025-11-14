import api from "@/helper/auth.interceptor";
import { Estadistica } from "@/model/model";

const ADMIN = '/administracion';

class AdministracionService {
    getEstadisticas = async (): Promise<Estadistica> => {
    const response = await api.get(`${ADMIN}/estadisticas`);
    return response.data.data;
  };
}

export const administracionService = new AdministracionService();