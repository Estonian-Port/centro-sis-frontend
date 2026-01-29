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
import { Usuario } from "@/model/model";

interface AvisoInvitacionModalProps {
  visible: boolean;
  onClose: () => void;
  usuario: Usuario;
  onConfirmar: () => Promise<void>;
}

export const AvisoInvitacionModal: React.FC<AvisoInvitacionModalProps> = ({
  visible,
  onClose,
  usuario,
  onConfirmar,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      await onConfirmar();
      Toast.show({
        type: "success",
        text1: "Mail reenviado",
        text2: `Se reenvió la invitación a ${usuario.email}`,
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error reenviando mail:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo reenviar el mail de invitación",
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
          {/* Ícono */}
          <View style={styles.iconContainer}>
            <Ionicons name="mail-unread" size={48} color="#3b82f6" />
          </View>

          {/* Título */}
          <Text style={styles.title}>Invitación Enviada</Text>

          {/* Email destacado */}
          <View style={styles.emailBox}>
            <Ionicons name="mail" size={20} color="#6b7280" />
            <Text style={styles.emailText}>{usuario.email}</Text>
          </View>

          {/* Mensaje */}
          <Text style={styles.message}>
            Se envió una invitación al usuario para que complete su registro.
            Una vez que lo haga, podrá acceder al sistema.
          </Text>

          {/* Info adicional */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                El usuario debe revisar su correo electrónico (incluyendo la
                carpeta de spam).
              </Text>
            </View>
          </View>

          {/* Advertencia spam */}
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              Si no encuentra el correo, puede reenviar la invitación.
            </Text>
          </View>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirmar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="mail" size={18} color="#ffffff" />
                  <Text style={styles.confirmButtonText}>Reenviar</Text>
                </>
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
    maxWidth: 420,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  emailBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: "100%",
  },
  emailText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  message: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    width: "100%",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  confirmButton: {
    backgroundColor: "#3b82f6",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
});
