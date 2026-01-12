// components/curso/modals/EditarNombreCursoModal.tsx
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

interface EditarNombreCursoModalProps {
  visible: boolean;
  onClose: () => void;
  nombreActual: string;
  onGuardar: (nuevoNombre: string) => Promise<void>;
}

export const EditarNombreCursoModal: React.FC<EditarNombreCursoModalProps> = ({
  visible,
  onClose,
  nombreActual,
  onGuardar,
}) => {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setNombre(nombreActual);
    }
  }, [visible, nombreActual]);

  const handleGuardar = async () => {
    const nombreTrimmed = nombre.trim();

    if (!nombreTrimmed) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El nombre del curso no puede estar vacío",
        position: "bottom",
      });
      return;
    }

    if (nombreTrimmed === nombreActual) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onGuardar(nombreTrimmed);
      Toast.show({
        type: "success",
        text1: "Nombre actualizado",
        text2: "El nombre del curso se actualizó correctamente",
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error actualizando nombre:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar el nombre",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNombre(nombreActual);
    onClose();
  };

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
              <Ionicons name="pencil" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.title}>Editar Nombre del Curso</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del curso</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Taekwondo Infantil"
              maxLength={100}
              autoFocus
            />
            <Text style={styles.hint}>{nombre.length}/100 caracteres</Text>
          </View>

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
              disabled={loading || !nombre.trim()}
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
    backgroundColor: "#dbeafe",
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
  hint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "right",
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
    backgroundColor: "#3b82f6",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});