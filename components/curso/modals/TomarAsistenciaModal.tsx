// components/curso/modals/TomarAsistenciaModal.tsx
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

interface TomarAsistenciaModalProps {
  visible: boolean;
  onClose: () => void;
  cursoId: number;
  cursoNombre: string;
  onConfirmar: () => Promise<void>;
  yaSeTomoHoy: boolean;
}

export const TomarAsistenciaModal: React.FC<TomarAsistenciaModalProps> = ({
  visible,
  onClose,
  cursoId,
  cursoNombre,
  onConfirmar,
  yaSeTomoHoy,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      await onConfirmar();
      Toast.show({
        type: "success",
        text1: "Asistencia tomada",
        text2: "Se registró la asistencia automáticamente",
        position: "bottom",
      });
      onClose();
    } catch (error: any) {
      console.error("Error tomando asistencia:", error);

      // Validar si ya se tomó asistencia hoy
      if (
        error.response?.status === 409 ||
        error.message?.includes("ya se tomó")
      ) {
        Toast.show({
          type: "error",
          text1: "Asistencia ya registrada",
          text2: "Ya se tomó asistencia para hoy",
          position: "bottom",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo registrar la asistencia",
          position: "bottom",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha actual formateada
  const hoy = new Date();
  const fechaFormateada = hoy.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {!yaSeTomoHoy ? (
          <View style={styles.modal}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-done-circle"
                size={48}
                color="#10b981"
              />
            </View>

            {/* Título */}
            <Text style={styles.title}>Tomar Asistencia Automática</Text>

            {/* Mensaje */}
            <View style={styles.messageContainer}>
              <Text style={styles.message}>
                Se tomará asistencia automática para{" "}
                <Text style={styles.boldText}>{cursoNombre}</Text>
              </Text>

              {/* Fecha */}
              <View style={styles.fechaBox}>
                <Ionicons name="calendar" size={20} color="#3b82f6" />
                <Text style={styles.fechaText}>{fechaFormateada}</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                Se registrarán como presentes todos los alumnos con ingreso RFID
                en el día de hoy.
              </Text>
            </View>

            {/* Advertencia */}
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
              <Text style={styles.warningText}>
                Solo se puede tomar asistencia una vez por día.
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
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.modal}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-done-circle"
                size={48}
                color="#10b981"
              />
            </View>

            {/* Título */}
            <Text style={styles.title}>Asistencia ya tomada</Text>

            {/* Mensaje */}
            <View style={styles.messageContainer}>
              <Text style={styles.message}>
                La asistencia para{" "}
                <Text style={styles.boldText}>{cursoNombre}</Text> ya fue tomada
                hoy.
              </Text>

              {/* Fecha */}
              <View style={styles.fechaBox}>
                <Ionicons name="calendar" size={20} color="#3b82f6" />
                <Text style={styles.fechaText}>{fechaFormateada}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    maxWidth: 450,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  messageContainer: {
    width: "100%",
    marginBottom: 16,
    gap: 12,
  },
  message: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "600",
    color: "#1f2937",
  },
  fechaBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  fechaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    textTransform: "capitalize",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
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
    width: "100%",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
    fontWeight: "500",
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
    backgroundColor: "#10b981",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
