// components/modals/RegistrarPagoModal.tsx - VERSIÓN SIMPLIFICADA
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Dimensions,  // ✅ AGREGAR
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { pagoService } from "@/services/pago.service";
import { getErrorMessage } from "@/helper/auth.interceptor";

// ✅ AGREGAR ESTA LÍNEA
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PagoPreview {
  inscripcionId: number;
  alumnoNombre: string;
  cursoNombre: string;
  montoPorCuota: number;
  beneficio: number;
  descuento: number;
  recargoPorcentaje: number;
  recargo: number;
  montoFinal: number;
  aplicaRecargo: boolean;
  cuotasPagadas: number;
  cuotasTotales: number;
  cuotasEsperadas: number;
  cuotasAtrasadas: number;
  puedeRegistrar: boolean;
}

interface RegistrarPagoModalProps {
  visible: boolean;
  onClose: () => void;
  inscripcionId: number;
  usuarioId: number;
  onSuccess: () => void;
}

export const RegistrarPagoModal: React.FC<RegistrarPagoModalProps> = ({
  visible,
  onClose,
  inscripcionId,
  usuarioId,
  onSuccess,
}) => {
  const [preview, setPreview] = useState<PagoPreview | null>(null);
  const [aplicarRecargo, setAplicarRecargo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (visible) {
      setAplicarRecargo(false);
      setLoadingPreview(true);
      pagoService
        .calcularPreviewPagoCurso(usuarioId, {
          inscripcionId,
          aplicarRecargo: false,
        })
        .then((data) => {
          setPreview(data);
          if (data.cuotasAtrasadas > 0) {
            setAplicarRecargo(true);
          }
        })
        .catch((error) => {
          console.error("Error cargando preview:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: getErrorMessage(error) || "No se pudo cargar la información del pago",
            position: "bottom",
          });
          onClose();
        })
        .finally(() => {
          setLoadingPreview(false);
        });
    }
  }, [visible, usuarioId, inscripcionId]);

  useEffect(() => {
    if (visible && preview) {
      setLoadingPreview(true);
      pagoService
        .calcularPreviewPagoCurso(usuarioId, {
          inscripcionId,
          aplicarRecargo,
        })
        .then((data) => {
          setPreview(data);
        })
        .catch((error) => {
          console.error("Error cargando preview:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: getErrorMessage(error) || "No se pudo cargar la información del pago",
            position: "bottom",
          });
          onClose();
        })
        .finally(() => {
          setLoadingPreview(false);
        });
    }
  }, [aplicarRecargo, visible, usuarioId, inscripcionId]);

  const handleRegistrar = async () => {
    if (!preview) return;

    setLoading(true);
    try {
      await pagoService.registrarPagoCurso(usuarioId, {
        inscripcionId,
        aplicarRecargo,
      });

      Toast.show({
        type: "success",
        text1: "Pago registrado",
        text2: `Pago de $${preview.montoFinal.toLocaleString("es-AR")} registrado`,
        position: "bottom",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error registrando pago:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo registrar el pago",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setAplicarRecargo(false);
    onClose();
  };

  if (!preview || loadingPreview) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Calculando pago...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="card" size={24} color="#10b981" />
            </View>
            <Text style={styles.title}>Registrar Pago</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* ScrollView */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Info del alumno y curso */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={18} color="#6b7280" />
                <Text style={styles.infoText}>{preview.alumnoNombre}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="school" size={18} color="#6b7280" />
                <Text style={styles.infoText}>{preview.cursoNombre}</Text>
              </View>
            </View>

            {/* Progreso de cuotas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progreso de cuotas</Text>
              <View style={styles.progressCard}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Pagadas</Text>
                  <Text style={styles.progressValue}>
                    {preview.cuotasPagadas} / {preview.cuotasTotales}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(preview.cuotasPagadas / preview.cuotasTotales) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Alerta de atraso */}
            {preview.cuotasAtrasadas > 0 && (
              <View style={styles.alertaAtraso}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertaTitle}>
                    {preview.cuotasAtrasadas}{" "}
                    {preview.cuotasAtrasadas === 1 ? "cuota atrasada" : "cuotas atrasadas"}
                  </Text>
                  <Text style={styles.alertaSubtitle}>
                    Debería haber pagado {preview.cuotasEsperadas} cuotas hasta hoy
                  </Text>
                </View>
              </View>
            )}

            {/* Checkbox de recargo */}
            <View style={styles.recargoSection}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAplicarRecargo(!aplicarRecargo)}
              >
                <View
                  style={[
                    styles.checkbox,
                    aplicarRecargo && styles.checkboxChecked,
                  ]}
                >
                  {aplicarRecargo && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkboxLabel}>
                    Aplicar recargo por atraso (
                    {preview.recargoPorcentaje}%)
                  </Text>
                  {preview.cuotasAtrasadas > 0 && (
                    <Text style={styles.checkboxHint}>
                      Sugerido por cuotas atrasadas
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Resumen del pago */}
            <View style={styles.resumen}>
              <Text style={styles.resumenTitle}>Resumen del pago</Text>

              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Monto por cuota:</Text>
                <Text style={styles.resumenValue}>
                  ${preview.montoPorCuota.toLocaleString("es-AR")}
                </Text>
              </View>

              {preview.beneficio > 0 && (
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>
                    Descuento aplicado ({preview.beneficio}%):
                  </Text>
                  <Text style={[styles.resumenValue, styles.descuentoText]}>
                    -${preview.descuento.toLocaleString("es-AR")}
                  </Text>
                </View>
              )}

              {preview.recargo > 0 && (
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>
                    Recargo ({preview.recargoPorcentaje.toFixed(0)}%):
                  </Text>
                  <Text style={[styles.resumenValue, styles.recargoText]}>
                    +${preview.recargo.toLocaleString("es-AR")}
                  </Text>
                </View>
              )}

              <View style={[styles.resumenRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total a pagar:</Text>
                <Text style={styles.totalValue}>
                  ${preview.montoFinal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                !preview.puedeRegistrar && styles.disabledButton,
              ]}
              onPress={handleRegistrar}
              disabled={loading || !preview.puedeRegistrar}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {preview.puedeRegistrar ? "Registrar Pago" : "Pagos Completos"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    maxWidth: 500,
    height: Platform.select({
      ios: SCREEN_HEIGHT * 0.80,  
      android: SCREEN_HEIGHT * 0.85,
      default: SCREEN_HEIGHT * 0.85,
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  infoSection: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  progressCard: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#d1fae5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
  },
  alertaAtraso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  alertaTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 4,
  },
  alertaSubtitle: {
    fontSize: 13,
    color: "#991b1b",
  },
  recargoSection: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  checkboxHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  resumen: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  resumenTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resumenLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  resumenValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  descuentoText: {
    color: "#10b981",
  },
  recargoText: {
    color: "#dc2626",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#bbf7d0",
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10b981",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  confirmButton: {
    backgroundColor: "#10b981",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});