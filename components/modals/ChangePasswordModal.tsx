import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import * as yup from "yup";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Toast from "react-native-toast-message";
import { UsuarioUpdatePassword } from "@/model/model";
import { useAuth } from "@/context/authContext";

// Esquema de validación
const schema = yup.object().shape({
  passwordActual: yup
    .string()
    .required("La contraseña actual es requerida"),
  nuevoPassword: yup
    .string()
    .required("La nueva contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Debe contener al menos una mayúscula, una minúscula y un número"
    ),
  confirmacionPassword: yup
    .string()
    .required("Debes confirmar la nueva contraseña")
    .oneOf([yup.ref("nuevoPassword")], "Las contraseñas no coinciden"),
});

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (usuario : UsuarioUpdatePassword) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { usuario } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UsuarioUpdatePassword>({
    resolver: yupResolver(schema),
    defaultValues: {
      passwordActual: "",
      nuevoPassword: "",
      confirmacionPassword: "",
    },
  });

  const newPassword = watch("nuevoPassword");

  const onSubmit = async (data: UsuarioUpdatePassword) => {
    await onSuccess(data);
    onClose();
  };

  const handleClose = () => {
    reset();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  // Validación de fuerza de contraseña
  const getPasswordStrength = () => {
    if (!newPassword) return null;

    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++;
    if (/\d/.test(newPassword)) strength++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;

    if (strength <= 2) return { label: "Débil", color: "#ef4444" };
    if (strength <= 3) return { label: "Media", color: "#f59e0b" };
    return { label: "Fuerte", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="key-outline" size={24} color="#8b5cf6" />
              <Text style={styles.title}>Cambiar Contraseña</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            <Text style={styles.description}>
              Asegúrate de usar una contraseña segura con al menos 8 caracteres
            </Text>

            {/* Contraseña Actual */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Contraseña Actual</Text>
              <Controller
                control={control}
                name="passwordActual"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Ingresa tu contraseña actual"
                    value={value}
                    onChangeText={onChange}
                    error={errors.passwordActual?.message}
                    secureTextEntry={!showCurrentPassword}
                    leftIcon="lock-closed-outline"
                    rightIcon={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                    onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                )}
              />
            </View>

            {/* Nueva Contraseña */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nueva Contraseña</Text>
              <Controller
                control={control}
                name="nuevoPassword"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input
                      placeholder="Ingresa tu nueva contraseña"
                      value={value}
                      onChangeText={onChange}
                      error={errors.nuevoPassword?.message}
                      secureTextEntry={!showNewPassword}
                      leftIcon="lock-closed-outline"
                      rightIcon={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                    />
                    {/* Indicador de fuerza */}
                    {passwordStrength && (
                      <View style={styles.strengthContainer}>
                        <View style={styles.strengthBar}>
                          <View
                            style={[
                              styles.strengthFill,
                              {
                                width:
                                  passwordStrength.label === "Débil"
                                    ? "33%"
                                    : passwordStrength.label === "Media"
                                    ? "66%"
                                    : "100%",
                                backgroundColor: passwordStrength.color,
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.strengthText,
                            { color: passwordStrength.color },
                          ]}
                        >
                          {passwordStrength.label}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              />
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
              <Controller
                control={control}
                name="confirmacionPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Confirma tu nueva contraseña"
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirmacionPassword?.message}
                    secureTextEntry={!showConfirmPassword}
                    leftIcon="lock-closed-outline"
                    rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                )}
              />
            </View>

            {/* Requisitos */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>La contraseña debe contener:</Text>
              <View style={styles.requirement}>
                <Ionicons
                  name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={newPassword.length >= 8 ? "#10b981" : "#9ca3af"}
                />
                <Text style={styles.requirementText}>Al menos 8 caracteres</Text>
              </View>
              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /[A-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={16}
                  color={/[A-Z]/.test(newPassword) ? "#10b981" : "#9ca3af"}
                />
                <Text style={styles.requirementText}>Una letra mayúscula</Text>
              </View>
              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /[a-z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={16}
                  color={/[a-z]/.test(newPassword) ? "#10b981" : "#9ca3af"}
                />
                <Text style={styles.requirementText}>Una letra minúscula</Text>
              </View>
              <View style={styles.requirement}>
                <Ionicons
                  name={/\d/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={/\d/.test(newPassword) ? "#10b981" : "#9ca3af"}
                />
                <Text style={styles.requirementText}>Un número</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
              disabled={isSubmitting}
            />
            <Button
              title={isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              style={styles.saveButton}
              disabled={isSubmitting}
            />
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
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    ...Platform.select({
      web: {
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  strengthContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requirementsContainer: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#6b7280",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});