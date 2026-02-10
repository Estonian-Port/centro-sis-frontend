// components/modals/AsignarPuntosModal.tsx
import React, { useState } from "react";
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

interface AsignarPuntosModalProps {
  visible: boolean;
  onClose: () => void;
  alumno: Alumno;
  puntosActuales: number;
  onAsignar: (puntos: number) => Promise<void>;
}

export const AsignarPuntosModal: React.FC<AsignarPuntosModalProps> = ({
  visible,
  onClose,
  alumno,
  puntosActuales,
  onAsignar,
}) => {
  const [puntos, setPuntos] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsignar = async () => {
    const puntosNum = parseInt(puntos);

    if (!puntos || isNaN(puntosNum) || puntosNum <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingresa una cantidad válida de puntos",
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      await onAsignar(puntosNum);
      Toast.show({
        type: "success",
        text1: "Puntos asignados",
        text2: `Se asignaron ${puntosNum} puntos a ${alumno.nombre}`,
        position: "bottom",
      });
      setPuntos("");
      onClose();
    } catch (error) {
      console.error("Error asignando puntos:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron asignar los puntos",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPuntos("");
    onClose();
  };

  const nuevosPuntos = parseInt(puntos) || 0;
  const totalPuntos = puntosActuales + nuevosPuntos;

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
              <Ionicons name="trophy" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.title}>Asignar Puntos</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Alumno info */}
          <View style={styles.alumnoInfo}>
            <Text style={styles.alumnoNombre}>
              {alumno.nombre} {alumno.apellido}
            </Text>
            <Text style={styles.puntosActuales}>
              Puntos actuales: {puntosActuales}
            </Text>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Puntos a asignar</Text>
            <TextInput
              style={styles.input}
              value={puntos}
              onChangeText={setPuntos}
              placeholder="Ej: 100"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* Preview */}
          {nuevosPuntos > 0 && (
            <View style={styles.preview}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Puntos actuales:</Text>
                <Text style={styles.previewValue}>{puntosActuales}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Puntos a sumar:</Text>
                <Text style={[styles.previewValue, styles.addValue]}>
                  +{nuevosPuntos}
                </Text>
              </View>
              <View style={[styles.previewRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{totalPuntos}</Text>
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
              onPress={handleAsignar}
              disabled={loading || !puntos}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Asignar</Text>
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
  puntosActuales: {
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
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  preview: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
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
  addValue: {
    color: "#10b981",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
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