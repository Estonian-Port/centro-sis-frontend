// components/modals/RegistrarInvitadoModal.tsx

import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Toast from "react-native-toast-message";
import { accesoService } from "@/services/acceso.service";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface RegistrarInvitadoModalProps {
  visible: boolean;
  onClose: () => void;
  registradoPorId: number;
  onRegistroExitoso?: () => void;
}

export const RegistrarInvitadoModal: React.FC<RegistrarInvitadoModalProps> = ({
  visible,
  onClose,
  registradoPorId,
  onRegistroExitoso,
}) => {
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // ✅ Estados para errores inline
  const [errorDni, setErrorDni] = useState<string | null>(null);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const handleClose = () => {
    setDni("");
    setNombre("");
    setRegistroExitoso(false);
    setErrorDni(null);
    setErrorNombre(null);
    setErrorGeneral(null);
    onClose();
  };

  const validarFormulario = (): boolean => {
    let valido = true;

    // Limpiar errores previos
    setErrorDni(null);
    setErrorNombre(null);
    setErrorGeneral(null);

    // Validar DNI
    const dniRegex = /^\d{7,8}$/;
    if (!dni.trim()) {
      setErrorDni("El DNI es requerido");
      valido = false;
    } else if (!dniRegex.test(dni)) {
      setErrorDni("El DNI debe tener 7 u 8 dígitos numéricos");
      valido = false;
    }

    // ✅ Validar Nombre (ahora requerido)
    if (!nombre.trim()) {
      setErrorNombre("El nombre es requerido");
      valido = false;
    } else if (nombre.trim().length < 2) {
      setErrorNombre("El nombre debe tener al menos 2 caracteres");
      valido = false;
    }

    return valido;
  };

  const handleRegistrar = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    setErrorGeneral(null);

    try {
      await accesoService.registrarAccesoInvitado(registradoPorId, {
        dni: dni.trim(),
        nombre: nombre.trim(), // ✅ Ya no es opcional
      });

      setRegistroExitoso(true);

      Toast.show({
        type: "success",
        text1: "✅ Acceso Registrado",
        text2: `${nombre} (DNI ${dni}) ingresó correctamente`,
        position: "bottom",
        visibilityTime: 3000,
      });

      if (onRegistroExitoso) onRegistroExitoso();

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      // ✅ Error inline en lugar de Toast
      setErrorGeneral(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
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
            <View style={styles.headerContent}>
              <Ionicons name="person-add" size={28} color="#10b981" />
              <View>
                <Text style={styles.title}>Registrar Invitado</Text>
                <Text style={styles.subtitle}>
                  Acceso temporal sin usuario registrado
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {!registroExitoso ? (
            <View style={styles.content}>
              {/* Info */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={styles.infoText}>
                  Este registro es para personas que vienen a una clase de
                  prueba o no están en el sistema.
                </Text>
              </View>

              {/* ✅ Error General (si hay) */}
              {errorGeneral && (
                <View style={styles.errorAlert}>
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <View style={styles.errorContent}>
                    <Text style={styles.errorText}>{errorGeneral}</Text>
                    <TouchableOpacity
                      onPress={() => setErrorGeneral(null)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Formulario */}
              <View style={styles.form}>
                <Input
                  label="DNI *"
                  value={dni}
                  onChangeText={(text) => {
                    setDni(text);
                    setErrorDni(null);
                  }}
                  placeholder="12345678"
                  keyboardType="number-pad"
                  maxLength={8}
                  error={errorDni ?? undefined}
                />

                <Input
                  label="Nombre Completo *"
                  value={nombre}
                  onChangeText={(text) => {
                    setNombre(text);
                    setErrorNombre(null);
                  }}
                  placeholder="Juan Pérez"
                  error={errorNombre ?? undefined}
                />
              </View>

              {/* Advertencia */}
              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={18} color="#f59e0b" />
                <Text style={styles.warningText}>
                  El invitado solo puede registrar UN acceso por día.
                </Text>
              </View>
            </View>
          ) : (
            /* Éxito */
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>¡Acceso Registrado!</Text>
              <Text style={styles.successMessage}>
                {nombre} con DNI {dni} ha ingresado correctamente.
              </Text>
            </View>
          )}

          {/* Footer */}
          {!registroExitoso && (
            <View style={styles.footer}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={handleClose}
                style={styles.footerButton}
                disabled={loading}
              />
              <Button
                title={loading ? "Registrando..." : "Registrar"}
                variant="primary"
                onPress={handleRegistrar}
                disabled={loading}
                style={{ ...styles.footerButton, backgroundColor: "#10b981" }}
              />
            </View>
          )}
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
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 19,
  },
  // ✅ NUEVO: Estilos para error general
  errorAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#fef2f2",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 16,
  },
  errorContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "500",
    lineHeight: 19,
  },
  form: {
    gap: 16,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
    lineHeight: 17,
  },
  successContainer: {
    padding: 30,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
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
