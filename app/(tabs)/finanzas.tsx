import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/context/authContext";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import {
  ReporteFinancieroMensual,
  reporteFinancieroService,
} from "@/services/reporte-financiero.service";
import { SelectorMesAnio } from "@/components/finanzas/SelectorMesAnio";
import { ResumenCards } from "@/components/finanzas/ResumenCards";
import {
  TablaDetalleEgresos,
  TablaDetalleIngresos,
} from "@/components/finanzas/TablaDetalle";
import { ListaMovimientos } from "@/components/finanzas/ListaMovimientos";

export default function FinanzasScreen() {
  const { usuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [reporte, setReporte] = useState<ReporteFinancieroMensual | null>(null);

  // Mes y año actual por defecto
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());

  const cargarReporte = useCallback(async () => {
    if (!usuario?.id) return;

    setLoading(true);
    try {
      const data = await reporteFinancieroService.obtenerReporteMensual(
        usuario.id,
        mes,
        anio,
      );

      setReporte(data);
    } catch (error: any) {
      console.error("❌ ERROR:", error);
      Toast.show({
        type: "error",
        text1: "Error al cargar reporte",
        text2: error?.response?.data?.message || "Intente nuevamente",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  }, [usuario?.id, mes, anio]);

  // Recargar cuando la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      cargarReporte();
    }, [cargarReporte]),
  );

  // También recargar cuando cambia mes/año
  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  const handleCambiarMesAnio = (nuevoMes: number, nuevoAnio: number) => {
    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  const handleDescargarExcel = async () => {
    if (!usuario?.id) return;

    setExportando(true);
    try {
      const excel = await reporteFinancieroService.exportarReporte(
        usuario.id,
        mes,
        anio,
      );

      if (Platform.OS === "web") {
        // WEB: Descarga directa
        const link = document.createElement("a");
        link.href = `data:${excel.mimeType};base64,${excel.base64}`;
        link.download = excel.nombreArchivo;
        link.click();
      } else {
        // MOBILE: Guardar y compartir
        const fileUri = FileSystem.cacheDirectory + excel.nombreArchivo;

        await FileSystem.writeAsStringAsync(fileUri, excel.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: excel.mimeType,
            dialogTitle: "Guardar reporte financiero",
          });
        } else {
          Alert.alert(
            "Archivo guardado",
            `El reporte se guardó en: ${fileUri}`,
          );
        }
      }

      Toast.show({
        type: "success",
        text1: "✅ Excel descargado",
        text2: excel.nombreArchivo,
        position: "bottom",
      });
    } catch (error: any) {
      console.error("Error al descargar Excel:", error);
      Toast.show({
        type: "error",
        text1: "Error al descargar",
        text2: error?.response?.data?.message || "Intente nuevamente",
        position: "bottom",
      });
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Cargando reporte financiero...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reporte) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>No se pudo cargar el reporte</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarReporte}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="stats-chart" size={28} color="#3b82f6" />
            <Text style={styles.headerTitle}>Finanzas</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.downloadButton,
              exportando && styles.downloadButtonDisabled,
            ]}
            onPress={handleDescargarExcel}
            disabled={exportando}
          >
            {exportando ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="download" size={20} color="#ffffff" />
            )}
            <Text style={styles.downloadButtonText}>
              {exportando ? "Generando..." : "Descargar Excel"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selector de Mes/Año */}
        <SelectorMesAnio
          mes={mes}
          anio={anio}
          onCambiar={handleCambiarMesAnio}
        />

        {/* Cards de Resumen */}
        <ResumenCards resumen={reporte.resumen} />

        {/* Tablas de Detalle */}
        <TablaDetalleIngresos detalle={reporte.detalleIngresos} />
        <TablaDetalleEgresos detalle={reporte.detalleEgresos} />

        {/* Lista de Movimientos */}
        <ListaMovimientos movimientos={reporte.movimientos} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
      },
    }),
  },
  downloadButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});
