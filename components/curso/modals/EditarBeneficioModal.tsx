// components/modals/EditarBeneficioModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Alumno, Usuario } from "@/model/model";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface EditarBeneficioModalProps {
  visible: boolean;
  onClose: () => void;
  alumno: Alumno;
  beneficioActual: number;
  montoCurso: number;
  onGuardar: (beneficio: number) => Promise<void>;
}

export const EditarBeneficioModal: React.FC<EditarBeneficioModalProps> = ({
  visible,
  onClose,
  alumno,
  beneficioActual,
  montoCurso,
  onGuardar,
}) => {
  const [beneficio, setBeneficio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setBeneficio(beneficioActual.toString());
    }
  }, [visible, beneficioActual]);

  const handleGuardar = async () => {
    const beneficioNum = parseFloat(beneficio);

    if (!beneficio || isNaN(beneficioNum)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingresa un porcentaje válido",
        position: "bottom",
      });
      return;
    }

    if (beneficioNum < 0 || beneficioNum > 100) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El beneficio debe estar entre 0% y 100%",
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      await onGuardar(beneficioNum);
      Toast.show({
        type: "success",
        text1: "Beneficio actualizado",
        text2: `Beneficio del ${beneficioNum}% aplicado a ${alumno.nombre}`,
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error actualizando beneficio:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo actualizar el beneficio",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBeneficio(beneficioActual.toString());
    onClose();
  };

  const beneficioNum = parseFloat(beneficio) || 0;
  const descuento = (montoCurso * beneficioNum) / 100;
  const montoFinal = montoCurso - descuento;

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
              <Ionicons name="gift" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.title}>Editar Beneficio</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Alumno info */}
          <View style={styles.alumnoInfo}>
            <Text style={styles.alumnoNombre}>
              {alumno.nombre} {alumno.apellido}
            </Text>
            <Text style={styles.montoOriginal}>
              Monto del curso: ${montoCurso.toLocaleString("es-AR")}
            </Text>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Porcentaje de descuento (%)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={beneficio}
                onChangeText={setBeneficio}
                placeholder="Ej: 10"
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
            <Text style={styles.hint}>Ingresa un valor entre 0 y 100</Text>
          </View>

          {/* Preview */}
          {beneficioNum >= 0 && beneficioNum <= 100 && (
            <View style={styles.preview}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Monto original:</Text>
                <Text style={styles.previewValue}>
                  ${montoCurso.toLocaleString("es-AR")}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>
                  Descuento ({beneficioNum}%):
                </Text>
                <Text style={[styles.previewValue, styles.discountValue]}>
                  -${descuento.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
              <View style={[styles.previewRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Monto a pagar:</Text>
                <Text style={styles.totalValue}>
                  ${montoFinal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          )}

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
              style={[styles.button, styles.confirmButton]}
              onPress={handleGuardar}
              disabled={loading || !beneficio}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Guardar</Text>
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
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
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
  alumnoInfo: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  alumnoNombre: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  montoOriginal: {
    fontSize: 14,
    color: "#6b7280",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  inputSuffix: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  preview: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  discountValue: {
    color: "#f59e0b",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#fde68a",
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f59e0b",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
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
    backgroundColor: "#f59e0b",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});