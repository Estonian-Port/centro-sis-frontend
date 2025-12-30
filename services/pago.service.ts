import api from "@/helper/auth.interceptor";
import {Pago} from "@/model/model";

const PAGO = '/pago';

class PagoService {
    getAllByUsuario = async (id: number): Promise<Pago[]> => {
    const response = await api.get(`${PAGO}/getAllByUsuarioId/${id}`);
    return response.data.data;
  };
}

export const pagoService = new PagoService();