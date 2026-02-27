import api from "@/helper/auth.interceptor";
import { Acceso, Estadistica } from "@/model/model";
import { Platform } from "react-native";
import * as FileSystem from 'expo-file-system';  
import * as Sharing from 'expo-sharing';         
import Toast from "react-native-toast-message";  

const ADMIN = "/administracion";

class AdministracionService {
  getEstadisticas = async (): Promise<Estadistica> => {
    const response = await api.get(`${ADMIN}/estadisticas`);
    return response.data.data;
  };

  // Registrar ingreso manual (admin)
  registrarIngresoManual = async (adminId: number, usuarioId: number): Promise<Acceso> => {
    const response = await api.post(`/acceso/manual/${adminId}/${usuarioId}`);
    return response.data;
  };

  /**
   * Descarga todos los QR en un ZIP
   * SOLO WEB
   */
  descargarTodosQr = async (): Promise<void> => {
    try {
      // ✅ Validar que sea web
      if (Platform.OS !== 'web') {
        Toast.show({
          type: 'info',
          text1: 'Función disponible solo en web',
          text2: 'Por favor, usa la versión web para descargar los QR',
          position: 'bottom',
        });
        return;
      }

      const response = await api.get(`${ADMIN}/descargar-todos`, {
        responseType: 'blob'
      });

      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `codigos_qr_usuarios_${fecha}.zip`;

      // Descarga directa en navegador
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error descargando QR:', error);
      throw error;
    }
  };
}


export const administracionService = new AdministracionService();
