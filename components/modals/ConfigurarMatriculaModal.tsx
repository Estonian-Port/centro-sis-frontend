// components/modals/ConfigurarMatriculaModal.tsx
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
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Toast from "react-native-toast-message";
import { pagoService } from "@/services/pago.service";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface ConfigurarMatriculaModalProps {
  visible: boolean;
  onClose: () => void;
  usuarioId: number; // admin
}

export const ConfigurarMatriculaModal: React.FC<
  ConfigurarMatriculaModalProps
> = ({ visible, onClose, usuarioId }) => {
  const anioActual = new Date().getFullYear();

  const [anio, setAnio] = useState(String(anioActual));
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async (anioConsulta: number) => {
    setLoading(true);
    setError(null);
    try {
      const config = await pagoService.getConfiguracionMatricula(anioConsulta);
      setMonto(config.monto != null ? String(config.monto) : "");
    } catch (e) {
      setError(getErrorMessage(e) || "No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setAnio(String(anioActual));
      fetchConfig(anioActual);
    }
  }, [visible]);

  const handleAnioBlur = () => {
    const parsed = parseInt(anio, 10);
    if (!isNaN(parsed)) {
      fetchConfig(parsed);
    }
  };

  const handleGuardar = async () => {
    const anioParsed = parseInt(anio, 10);
    const montoParsed = parseFloat(monto);

    if (isNaN(anioParsed)) {
      setError("Ingresá un año válido");
      return;
    }
    if (isNaN(montoParsed) || montoParsed <= 0) {
      setError("Ingresá un monto válido mayor a cero");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await pagoService.setConfiguracionMatricula(usuarioId, {
        anio: anioParsed,
        monto: montoParsed,
      });
      Toast.show({
        type: "success",
        text1: "Matrícula configurada",
        text2: `Año ${anioParsed}: $${montoParsed.toLocaleString("es-AR")}`,
        position: "bottom",
      });
      onClose();
    } catch (e) {
      setError(getErrorMessage(e) || "No se pudo guardar la configuración");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="ribbon" size={28} color="#8b5cf6" />
              <View>
                <Text style={styles.title}>Configurar Matrícula</Text>
                <Text style={styles.subtitle}>Monto anual del instituto</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {error && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Año"
              keyboardType="number-pad"
              value={anio}
              onChangeText={setAnio}
              onBlur={handleAnioBlur}
              leftIcon="calendar-outline"
            />

            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text style={styles.loadingText}>Cargando monto actual...</Text>
              </View>
            ) : (
              <Input
                label="Monto de la matrícula"
                keyboardType="decimal-pad"
                value={monto}
                onChangeText={setMonto}
                placeholder="0"
                leftIcon="cash-outline"
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={onClose}
              style={styles.footerButton}
            />
            <Button
              title={submitting ? "Guardando..." : "Guardar"}
              variant="primary"
              onPress={handleGuardar}
              disabled={submitting || loading}
              style={{ flex: 1, backgroundColor: "#8b5cf6" }}
            />
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
    gap: 12,
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
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
