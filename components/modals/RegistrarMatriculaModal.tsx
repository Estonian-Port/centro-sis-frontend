// components/modals/RegistrarMatriculaModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PagoMatriculaPreview } from "@/model/model";
import { Button } from "@/components/ui/Button";
import Toast from "react-native-toast-message";
import { pagoService } from "@/services/pago.service";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface RegistrarMatriculaModalProps {
  visible: boolean;
  onClose: () => void;
  usuarioId: number; // admin/oficina que registra el pago
  alumnoId: number; // id del usuario alumno
  anio?: number; // por defecto el año actual (lo resuelve el backend)
  onMatriculaRegistrada?: () => void;
}

export const RegistrarMatriculaModal: React.FC<
  RegistrarMatriculaModalProps
> = ({ visible, onClose, usuarioId, alumnoId, anio, onMatriculaRegistrada }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PagoMatriculaPreview | null>(null);

  useEffect(() => {
    if (visible) {
      loadPreview();
    } else {
      setPreview(null);
      setError(null);
    }
  }, [visible]);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pagoService.calcularPreviewMatricula(
        usuarioId,
        alumnoId,
        anio,
      );
      setPreview(data);
      if (!data.puedeRegistrar && data.mensajeError) {
        setError(data.mensajeError);
      }
    } catch (e) {
      setError(getErrorMessage(e) || "No se pudo cargar la información");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrar = async () => {
    if (!preview) return;
    setSubmitting(true);
    setError(null);
    try {
      await pagoService.registrarPagoMatricula(usuarioId, {
        alumnoId,
        anio: preview.anio,
      });

      Toast.show({
        type: "success",
        text1: "Matrícula Registrada",
        text2: `${preview.alumnoNombre} - Matrícula ${preview.anio}: $${
          preview.monto?.toLocaleString("es-AR") ?? ""
        }`,
        position: "bottom",
      });

      onMatriculaRegistrada?.();
      onClose();
    } catch (e) {
      setError(getErrorMessage(e) || "No se pudo registrar la matrícula");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="ribbon" size={28} color="#8b5cf6" />
              <View>
                <Text style={styles.title}>Registrar Matrícula</Text>
                <Text style={styles.subtitle}>Alumno → Instituto</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.loadingText}>Calculando...</Text>
              </View>
            )}

            {error && !loading && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!loading && preview && (
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Alumno:</Text>
                  <Text style={styles.infoValue}>{preview.alumnoNombre}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Año:</Text>
                  <Text style={styles.infoValue}>{preview.anio}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Monto:</Text>
                  <Text style={[styles.infoValue, styles.montoDestacado]}>
                    {preview.monto != null
                      ? `$${preview.monto.toLocaleString("es-AR")}`
                      : "Sin configurar"}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {!loading && (
            <View style={styles.footer}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={styles.footerButton}
              />
              <Button
                title={submitting ? "Registrando..." : "Registrar Matrícula"}
                variant="primary"
                onPress={handleRegistrar}
                disabled={!preview?.puedeRegistrar || submitting}
                style={{ flex: 1, backgroundColor: "#8b5cf6" }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: "#faf5ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  montoDestacado: {
    fontSize: 16,
    color: "#8b5cf6",
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
