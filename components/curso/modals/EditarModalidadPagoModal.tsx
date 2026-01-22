// components/curso/modals/EditarModalidadesPagoModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { TipoPago } from "@/model/model";

interface EditarModalidadesPagoModalProps {
  visible: boolean;
  onClose: () => void;
  modalidadesActuales: TipoPago[];
  onGuardar: (modalidades: TipoPago[]) => Promise<void>;
}

export const EditarModalidadesPagoModal: React.FC<
  EditarModalidadesPagoModalProps
> = ({ visible, onClose, modalidadesActuales, onGuardar }) => {
  const [modalidades, setModalidades] = useState<TipoPago[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalidades([...modalidadesActuales]);
    }
  }, [visible, modalidadesActuales]);

  const handleChangeMonto = (index: number, montoStr: string) => {
    // Remover caracteres no numéricos
    const cleanStr = montoStr.replace(/[^0-9]/g, "");
    const monto = cleanStr === "" ? 0 : parseInt(cleanStr, 10);

    const updated = [...modalidades];
    updated[index] = { ...updated[index], monto };
    setModalidades(updated);
  };

  const formatMonto = (monto: number): string => {
    return monto.toLocaleString("es-AR");
  };

  const handleGuardar = async () => {
    // Validar que todos los montos sean > 0
    const invalid = modalidades.some((m) => m.monto <= 0);
    if (invalid) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Todos los montos deben ser mayores a 0",
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      await onGuardar(modalidades);
      Toast.show({
        type: "success",
        text1: "Modalidades actualizadas",
        text2: "Los montos se actualizaron correctamente",
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error actualizando modalidades:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron actualizar las modalidades",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModalidades([...modalidadesActuales]);
    onClose();
  };

  // Helper para iconos según tipo
  const getIconName = (tipo: string): any => {
    if (tipo.includes("MENSUAL")) return "calendar";
    if (tipo.includes("TOTAL")) return "cash";
    return "card";
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
              <Ionicons name="cash" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.title}>Editar Modalidades de Pago</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                Solo puedes editar el monto de cada modalidad, no el tipo.
              </Text>
            </View>

            {/* Lista de Modalidades */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Modalidades ({modalidades.length})
              </Text>
              {modalidades.map((modalidad, index) => (
                <View key={index} style={styles.modalidadItem}>
                  <View style={styles.modalidadHeader}>
                    <View style={styles.modalidadIcon}>
                      <Ionicons
                        name={getIconName(modalidad.tipo)}
                        size={20}
                        color="#f59e0b"
                      />
                    </View>
                    <Text style={styles.modalidadTipo}>{modalidad.tipo}</Text>
                  </View>

                  {/* Input Monto */}
                  <View style={styles.montoContainer}>
                    <Text style={styles.montoLabel}>Monto</Text>
                    <View style={styles.montoInputContainer}>
                      <Text style={styles.montoPrefix}>$</Text>
                      <TextInput
                        style={styles.montoInput}
                        value={modalidad.monto.toString()}
                        onChangeText={(text) => handleChangeMonto(index, text)}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>
                    <Text style={styles.montoFormatted}>
                      = ${formatMonto(modalidad.monto)}
                    </Text>
                  </View>
                </View>
              ))}
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
              style={[styles.button, styles.confirmButton]}
              onPress={handleGuardar}
              disabled={loading}
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
    maxWidth: 500,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
  content: {
    padding: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  modalidadItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalidadHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalidadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalidadTipo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  montoContainer: {
    gap: 8,
  },
  montoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  montoInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  montoPrefix: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 4,
  },
  montoInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    paddingVertical: 10,
  },
  montoFormatted: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
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