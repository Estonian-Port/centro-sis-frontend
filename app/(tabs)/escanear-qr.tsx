// app/(tabs)/escanear-qr.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/authContext";
import Toast from "react-native-toast-message";
import { Acceso } from "@/model/model";
import { accesoService } from "@/services/acceso.service";

export default function EscanearQRScreen() {
  const { usuario } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [accesosRecientes, setAccesosRecientes] = useState<Acceso[]>([]);
  const [loadingAccesos, setLoadingAccesos] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAcceso, setLastAcceso] = useState<Acceso | null>(null);

  useEffect(() => {
    requestCameraPermission();
    loadAccesosRecientes();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (processing) return;

    setProcessing(true);
    setScanning(false);

    try {
      const qrData = JSON.parse(data);
      const acceso = await accesoService.registrarAccesoQR(usuario!.id, qrData);

      setLastAcceso(acceso);
      setShowSuccess(true);
      setAccesosRecientes([acceso, ...accesosRecientes.slice(0, 49)]);

      // Cerrar modal después de 4 segundos (más tiempo si hay alerta)
      setTimeout(
        () => {
          setShowSuccess(false);
          setLastAcceso(null);
        },
        acceso.alertaPagos ? 5000 : 3000,
      );
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "❌ Error",
        text2: error?.response?.data?.message || "QR inválido",
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setProcessing(false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const loadAccesosRecientes = async () => {
    setLoadingAccesos(true);
    try {
      const accesos = await accesoService.getAccesosRecientes();
      setAccesosRecientes(accesos);
    } catch (error) {
      console.error("Error cargando accesos:", error);
    } finally {
      setLoadingAccesos(false);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          backgroundColor: "#f9fafb",
          padding: 20,
        }}
      >
        <Ionicons
          name="alert"
          size={72}
          color="#ef4444"
          style={{ marginBottom: 12 }}
        />
        <Text
          style={[styles.errorTitle, { textAlign: "center", marginTop: 0 }]}
        >
          Funcionalidad no disponible
        </Text>
        <Text style={[styles.errorText, { maxWidth: 420, marginTop: 4 }]}>
          La funcionalidad de escaneo de QR no está disponible en la versión
          web.
        </Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Solicitando permiso...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="alert" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Sin Permiso de Cámara</Text>
        <Text style={styles.errorText}>
          Habilita el acceso a la cámara en la configuración
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="scan" size={32} color="#3b82f6" />
        <Text style={styles.title}>Registrar Accesos</Text>
        <Text style={styles.subtitle}>Escanea el QR del usuario</Text>
      </View>
      {/* Botón Escanear */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setScanning(true)}
        disabled={processing}
      >
        <Ionicons name="qr-code-outline" size={48} color="#ffffff" />
        <Text style={styles.scanButtonText}>
          {processing ? "Procesando..." : "Escanear QR"}
        </Text>
      </TouchableOpacity>
      {/* Accesos Recientes */}
      <View style={styles.accesosContainer}>
        <View style={styles.accesosHeader}>
          <Text style={styles.accesosTitle}>Accesos Recientes</Text>
          <TouchableOpacity onPress={loadAccesosRecientes}>
            <Ionicons name="refresh" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {loadingAccesos ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : (
          <ScrollView style={styles.accesosList}>
            {accesosRecientes.map((acceso, index) => (
              <View
                key={acceso.id}
                style={[
                  styles.accesoItem,
                  index === 0 && styles.accesoItemFirst,
                ]}
              >
                <View style={styles.accesoInfo}>
                  <Text style={styles.accesoNombre}>
                    {acceso.usuarioNombre}
                  </Text>
                  <Text style={styles.accesoDni}>DNI: {acceso.usuarioDni}</Text>
                </View>
                <View style={styles.accesoMeta}>
                  <Text style={styles.accesoHora}>
                    {new Date(acceso.fechaHora).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <View style={styles.accesoTipoBadge}>
                    <Ionicons name="qr-code" size={12} color="#10b981" />
                    <Text style={styles.accesoTipo}>{acceso.tipoAcceso}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      {/* Modal Escáner */}
      <Modal visible={scanning} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={processing ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          >
            <View style={styles.overlay}>
              {/* Header */}
              <View style={styles.scannerHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setScanning(false)}
                  disabled={processing}
                >
                  <Ionicons name="close" size={32} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Marco */}
              <View style={styles.scanArea}>
                <View style={styles.scanFrame} />
                <Text style={styles.scanText}>
                  {processing ? "Procesando..." : "Apuntá al QR"}
                </Text>
              </View>

              <View style={styles.scannerFooter} />
            </View>
          </CameraView>
        </View>
      </Modal>
      // ============================================= // Modal de Éxito CON
      ALERTA DE PAGOS // =============================================
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View
            style={[
              styles.successModal,
              lastAcceso?.alertaPagos && styles.successModalConAlerta,
            ]}
          >
            {/* Icono de éxito */}
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={72} color="#10b981" />
            </View>

            {/* Título */}
            <Text style={styles.successTitle}>¡Acceso Registrado!</Text>

            {/* Nombre del usuario */}
            {lastAcceso && (
              <>
                <Text style={styles.successName}>
                  {lastAcceso.usuarioNombre}
                </Text>
                <Text style={styles.successDni}>
                  DNI: {lastAcceso.usuarioDni}
                </Text>

                {/* Tipo de QR */}
                <View
                  style={[styles.tipoQRBadge, styles.tipoQRBadgePermanente]}
                ></View>

                {/* ✅ ALERTA DE PAGOS */}
                {lastAcceso.alertaPagos?.tieneAtrasos && (
                  <View style={styles.alertaPagos}>
                    <View style={styles.alertaHeader}>
                      <Ionicons name="alert-circle" size={24} color="#dc2626" />
                      <Text style={styles.alertaTitle}>¡ATENCIÓN!</Text>
                    </View>

                    <Text style={styles.alertaMensaje}>
                      {lastAcceso.alertaPagos.mensaje}
                    </Text>

                    {/* Detalle de cursos atrasados */}
                    {lastAcceso.alertaPagos.cursosAtrasados.map(
                      (curso, index) => (
                        <View key={index} style={styles.cursoAtrasoItem}>
                          <Ionicons
                            name="school-outline"
                            size={16}
                            color="#dc2626"
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.cursoAtrasoNombre}>
                              {curso.cursoNombre}
                            </Text>
                            <Text style={styles.cursoAtrasoDetalle}>
                              {curso.cuotasAtrasadas} cuota(s) atrasada(s) - $
                              {curso.deudaPendiente.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      ),
                    )}

                    <Text style={styles.alertaInstruccion}>
                      Por favor, recordá al alumno ponerse al día con los pagos
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  scanButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  accesosContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
  },
  accesosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  accesosTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  accesosList: {
    flex: 1,
  },
  accesoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  accesoItemFirst: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderRadius: 8,
  },
  accesoInfo: {
    flex: 1,
  },
  accesoNombre: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  accesoDni: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  accesoMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  accesoHora: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3b82f6",
  },
  accesoTipoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  accesoTipo: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10b981",
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scannerHeader: {
    padding: 20,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 4,
    borderColor: "#ffffff",
    borderRadius: 16,
  },
  scanText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 24,
  },
  scannerFooter: {
    height: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  successModal: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 450,
  },
  successModalConAlerta: {
    maxWidth: 500,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  successName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  successDni: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
  },
  tipoQRBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  tipoQRBadgePermanente: {
    backgroundColor: "#d1fae5",
  },

  // ✅ Estilos de alerta
  alertaPagos: {
    width: "100%",
    backgroundColor: "#fef2f2",
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fecaca",
    marginTop: 20,
  },
  alertaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  alertaTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#dc2626",
  },
  alertaMensaje: {
    fontSize: 16,
    fontWeight: "600",
    color: "#991b1b",
    marginBottom: 16,
    lineHeight: 22,
  },
  cursoAtrasoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cursoAtrasoNombre: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  cursoAtrasoDetalle: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "500",
  },
  alertaInstruccion: {
    fontSize: 14,
    color: "#991b1b",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
});
