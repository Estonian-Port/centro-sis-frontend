import api from "@/helper/auth.interceptor";
import {Pago} from "@/model/model";

const PAGO = '/pago';

class PagoService {
    getAllByUsuario = async (id: number): Promise<Pago[]> => {
    const response = await api.get(`${PAGO}/getAllByUsuarioId/${id}`);
    return response.data.data;
  };

  registrarPagoCurso = async (pagoData: {
    inscripcionId: number;
    fecha: string;
    monto: number;
    retraso: boolean;
    beneficioAplicado?: number;
    medioPago: string;
  }): Promise<Pago> => {
    const response = await api.post(`${PAGO}/registrarPagoCurso`, pagoData);
    return response.data.data;
  }
}

export const pagoService = new PagoService();