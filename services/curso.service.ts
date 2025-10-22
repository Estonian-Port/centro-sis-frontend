import { api } from "./api.service";

const CURSO = '/curso';

class CursoService {

    get = async (id: number): Promise<String[]> => {
    const response = await api.get(`${CURSO}/get/${id}`);
    return response.data.data;
  };

}