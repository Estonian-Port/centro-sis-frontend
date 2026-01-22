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
import { Alumno, Curso, Usuario } from "@/model/model";

interface BajaTotalCursoProps {
  visible: boolean;
  onClose: () => void;
  curso: Curso;
  onConfirmar: (cursoId: number) => Promise<void>;
}

export const BajaTotalCurso: React.FC<BajaTotalCursoProps> = ({
  visible,
  onClose,
  curso,
  onConfirmar,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      await onConfirmar(curso.id);
      Toast.show({
        type: "success",
        text1: "Curso dado de baja",
        text2: `${curso.nombre} fue dado de baja del sistema`,
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error dando de baja:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo dar de baja el curso",
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="warning" size={48} color="#ef4444" />
            <Text style={[styles.modalTitle, { color: "#ef4444" }]}>
              Dar de Baja Curso
            </Text>
          </View>

          <Text style={styles.modalMessage}>
            ¿Estás seguro de que deseas dar de baja el curso{" "}
            <Text style={styles.modalCourseName}>"{curso.nombre}"</Text>?
          </Text>

          <Text style={styles.modalInfo}>
            Esta acción cambiará el estado del curso a BAJA. Los alumnos ya no
            podrán acceder al curso, pero el registro se mantendrá en el
            sistema.
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleConfirmar}
            >
              <Text style={styles.modalButtonText}>Confirmar Baja</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#ef4444",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  modalHeader: {
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    lineHeight: 22,
  },
  modalCourseName: {
    fontWeight: "700",
    color: "#111827",
  },
  modalInfo: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
});
