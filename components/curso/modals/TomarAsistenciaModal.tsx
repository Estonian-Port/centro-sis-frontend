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
import { DatePicker } from "@/components/pickers/DatePicker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { cursoService } from "@/services/curso.service";

interface TomarAsistenciaModalProps {
  visible: boolean;
  onClose: () => void;
  cursoId: number;
  usuarioId: number;
  cursoNombre: string;
  onConfirmar: () => Promise<void>;
  yaSeTomoHoy: boolean;
}

export const TomarAsistenciaModal: React.FC<TomarAsistenciaModalProps> = ({
  visible,
  onClose,
  cursoId,
  usuarioId,
  cursoNombre,
  onConfirmar,
  yaSeTomoHoy,
}) => {
  const [loading, setLoading] = useState(false);
  const [usarOtraFecha, setUsarOtraFecha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });

  const handleConfirmar = async () => {
    setError(null);

    // Validación de fecha futura
    if (usarOtraFecha) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const [y, m, d] = fechaSeleccionada.split("-").map(Number);
      const fechaElegida = new Date(y, m - 1, d);
      fechaElegida.setHours(0, 0, 0, 0);

      if (fechaElegida > hoy) {
        setError("No se puede tomar asistencia para una fecha futura");
        return;
      }
    }

    setLoading(true);
    try {
      const hoy = new Date();
      const hoyStr = hoy.toISOString().split("T")[0];
      const fechaStr = usarOtraFecha ? fechaSeleccionada : hoyStr;

      await cursoService.tomarAsistenciaAutomatica(
        cursoId,
        usuarioId,
        fechaStr,
      );
      await onConfirmar();

      Toast.show({
        type: "success",
        text1: "Asistencia tomada",
        text2: "Se registró la asistencia automáticamente",
        position: "bottom",
      });
      onClose();
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || "No se pudo tomar la asistencia";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let fechaFormateada = "";

  if (!usarOtraFecha) {
    fechaFormateada = hoy.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (fechaSeleccionada) {
    const [y, m, d] = fechaSeleccionada.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);
    fechaFormateada = fecha.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (yaSeTomoHoy) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-done-circle"
                size={48}
                color="#10b981"
              />
            </View>
            <Text style={styles.title}>Asistencia ya tomada</Text>
            <Text style={styles.message}>
              La asistencia para{" "}
              <Text style={styles.boldText}>{cursoNombre}</Text> ya fue tomada
              hoy.
            </Text>
            <View style={styles.fechaBox}>
              <Ionicons name="calendar" size={20} color="#3b82f6" />
              <Text style={styles.fechaText}>{fechaFormateada}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onClose}
            >
              <Text style={styles.primaryButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-done-circle" size={48} color="#10b981" />
          </View>
          <Text style={styles.title}>Tomar Asistencia</Text>
          <Text style={styles.message}>
            <Text style={styles.boldText}>{cursoNombre}</Text>
          </Text>

          <Text style={styles.infoText}>
            Se registrarán como presentes todos los alumnos con acceso por QR.
            Solo se puede tomar una vez por día.
          </Text>

          {/* Fecha */}
          {usarOtraFecha ? (
            <View style={styles.datePickerContainer}>
              <DatePicker
                label="Fecha de asistencia"
                value={fechaSeleccionada}
                onChange={(date) => {
                  setFechaSeleccionada(date);
                  setError(null);
                }}
                maximumDate={new Date()}
              />
            </View>
          ) : (
            <View style={styles.fechaBox}>
              <Ionicons name="calendar" size={20} color="#3b82f6" />
              <Text style={styles.fechaText}>{fechaFormateada}</Text>
            </View>
          )}

          <View style={styles.fechaContainer}>
            {/* Checkbox para otra fecha */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                setUsarOtraFecha(!usarOtraFecha);
                setError(null);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  usarOtraFecha && styles.checkboxChecked,
                ]}
              >
                {usarOtraFecha && (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Elegir fecha manualmente</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

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
    height: 380,
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
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  boldText: {
    fontWeight: "600",
    color: "#1f2937",
  },
  fechaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  datePickerContainer: {
    width: "100%",
  },
  fechaBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 16,
  },
  fechaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    textTransform: "capitalize",
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "500",
  },
  infoText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
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
  primaryButton: {
    backgroundColor: "#10b981",
    width: "100%",
    marginTop: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
