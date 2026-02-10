// components/modals/ConfirmarBajaModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Alumno, Usuario } from "@/model/model";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface ConfirmarBajaModalProps {
  visible: boolean;
  onClose: () => void;
  alumno: Alumno;
  curso: string;
  onConfirmar: () => Promise<void>;
}

export const ConfirmarBajaModal: React.FC<ConfirmarBajaModalProps> = ({
  visible,
  onClose,
  alumno,
  curso,
  onConfirmar,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      await onConfirmar();
      Toast.show({
        type: "success",
        text1: "Alumno dado de baja",
        text2: `${alumno.nombre} ${alumno.apellido} fue dado de baja del curso`,
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error dando de baja:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo dar de baja al alumno",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icon de advertencia */}
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
          </View>

          {/* Título */}
          <Text style={styles.title}>¿Dar de baja al alumno?</Text>

          {/* Mensaje */}
          <Text style={styles.message}>
            Estás a punto de dar de baja a{" "}
            <Text style={styles.boldText}>
              {alumno.nombre} {alumno.apellido}
            </Text>{" "}
            del curso{" "}
            <Text style={styles.boldText}>{curso}</Text>.
          </Text>

          {/* Advertencia */}
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              Esta acción no se puede deshacer. El alumno perderá acceso al curso.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirmar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Dar de Baja</Text>
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
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: "600",
    color: "#1f2937",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
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
    backgroundColor: "#ef4444",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});