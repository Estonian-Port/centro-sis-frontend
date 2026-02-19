// components/modals/RegistroAlumnoModal.tsx - CON ERROR INLINE

import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Toast from "react-native-toast-message";
import { usuarioService } from "@/services/usuario.service";
import { getErrorMessage } from "@/helper/auth.interceptor";
import { NuevoAlumno } from "@/model/model";

interface RegistroAlumnoModalProps {
  visible: boolean;
  onClose: () => void;
  onRegistroExitoso?: () => void;
}

export const RegistroAlumnoModal: React.FC<RegistroAlumnoModalProps> = ({
  visible,
  onClose,
  onRegistroExitoso,
}) => {
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null); // ✅ NUEVO

  const handleClose = () => {
    setEmail("");
    setDni("");
    setRegistroExitoso(false);
    setErrorMensaje(null); // ✅ Limpiar error
    onClose();
  };

  const validarFormulario = (): boolean => {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email.trim()) {
      setErrorMensaje("Por favor ingresá tu email");
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrorMensaje("El formato del email no es válido");
      return false;
    }

    const dniRegex = /^\d{7,8}$/;
    if (!dni.trim()) {
      setErrorMensaje("Por favor ingresá tu DNI");
      return false;
    }
    if (!dniRegex.test(dni)) {
      setErrorMensaje("El DNI debe tener 7 u 8 dígitos numéricos");
      return false;
    }

    return true;
  };
  
  const handleRegistro = async () => {
    setErrorMensaje(null);
    if (!validarFormulario()) return;

    const nuevoAlumno: NuevoAlumno = {
      email: email.trim().toLowerCase(),
      dni: dni.trim(),
    };

    setLoading(true);
    try {
      await usuarioService.registrarAlumno(nuevoAlumno);

      setRegistroExitoso(true);
      
      Toast.show({
        type: "success",
        text1: "¡Registro exitoso!",
        text2: "Revisá tu email para continuar",
        position: "bottom",
        visibilityTime: 5000,
      });

      setTimeout(() => {
        if (onRegistroExitoso) onRegistroExitoso();
        handleClose();
      }, 3000);
    } catch (error: any) {
      // ✅ Mostrar error en el modal
      setErrorMensaje(getErrorMessage(error));
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
              <Ionicons name="person-add" size={28} color="#6366f1" />
              <View>
                <Text style={styles.title}>Registrarse como Alumno</Text>
                <Text style={styles.subtitle}>
                  Creá tu cuenta en el sistema
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {!registroExitoso ? (
            <ScrollView 
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                {/* Instrucciones */}
                <View style={styles.instructionsBox}>
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <Text style={styles.instructionsText}>
                    Ingresá tu email y DNI. Te enviaremos un correo con tu
                    contraseña temporal para que completes tu perfil.
                  </Text>
                </View>

                {/* ✅ Alerta de error inline */}
                {errorMensaje && (
                  <View style={styles.errorAlert}>
                    <Ionicons name="alert-circle" size={20} color="#dc2626" />
                    <View style={styles.errorContent}>
                      <Text style={styles.errorText}>{errorMensaje}</Text>
                      <TouchableOpacity
                        onPress={() => setErrorMensaje(null)}
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
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrorMensaje(null);
                    }}
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <Input
                    label="DNI"
                    value={dni}
                    onChangeText={(text) => {
                      setDni(text);
                      setErrorMensaje(null);
                    }}
                    placeholder="12345678"
                    keyboardType="number-pad"
                    maxLength={8}
                  />
                </View>

                {/* Advertencia */}
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={18} color="#f59e0b" />
                  <Text style={styles.warningText}>
                    Asegurate de ingresar un email al que tengas acceso. Recibirás
                    tu contraseña temporal allí.
                  </Text>
                </View>
              </View>
            </ScrollView>
          ) : (
            /* Mensaje de éxito */
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>¡Registro Exitoso!</Text>
              <Text style={styles.successMessage}>
                Te enviamos un email a{"\n"}
                <Text style={styles.successEmail}>{email}</Text>
                {"\n\n"}
                con tu contraseña temporal.{"\n"}
                Revisá tu casilla (incluyendo spam).
              </Text>
              <View style={styles.successSteps}>
                <View style={styles.successStep}>
                  <Ionicons name="mail" size={20} color="#6366f1" />
                  <Text style={styles.successStepText}>1. Revisá tu email</Text>
                </View>
                <View style={styles.successStep}>
                  <Ionicons name="log-in" size={20} color="#6366f1" />
                  <Text style={styles.successStepText}>
                    2. Ingresá con tu contraseña
                  </Text>
                </View>
                <View style={styles.successStep}>
                  <Ionicons name="person" size={20} color="#6366f1" />
                  <Text style={styles.successStepText}>
                    3. Completá tu perfil
                  </Text>
                </View>
              </View>
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
                title={loading ? "Registrando..." : "Registrarse"}
                variant="primary"
                onPress={handleRegistro}
                disabled={loading}
                style={styles.footerButton}
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
    maxHeight: "90%",
  },
  scrollContent: {
    maxHeight: 400, // ✅ Altura máxima para el scroll
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
  instructionsBox: {
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
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 19,
  },
  // ✅ NUEVO: Estilos para el error inline
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
    marginBottom: 24,
  },
  successEmail: {
    fontWeight: "700",
    color: "#1f2937",
  },
  successSteps: {
    width: "100%",
    gap: 12,
  },
  successStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f5f3ff",
    padding: 12,
    borderRadius: 8,
  },
  successStepText: {
    fontSize: 14,
    color: "#4338ca",
    fontWeight: "500",
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