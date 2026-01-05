import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { NuevoUsuario } from "@/model/model";
import { usuarioService } from "@/services/usuario.service";
import Toast from "react-native-toast-message";

const schema = yup.object().shape({
  email: yup.string().email("Email inválido").required("El email es requerido"),
  roles: yup
    .array()
    .min(1, "Debe seleccionar al menos un rol")
    .required("Los roles son requeridos"),
});

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (nuevoUsuario: NuevoUsuario) => Promise<void>;
}

const availableRoles = [
  { id: "ALUMNO", label: "Alumno" },
  { id: "PROFESOR", label: "Profesor" },
  { id: "OFICINA", label: "Oficina" },
  { id: "ADMINISTRADOR", label: "Administrador" },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<NuevoUsuario>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      roles: [],
    },
  });

  const selectedRoles = watch("roles");

  const toggleRole = (roleId: string) => {
    const currentRoles = selectedRoles || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter((r) => r !== roleId)
      : [...currentRoles, roleId];
    setValue("roles", newRoles);
  };

  const invitacionNuevoUsuario = async (nuevoUsuario: NuevoUsuario) => {
    try {
      const response = await usuarioService.altaUsuario(nuevoUsuario);
      Toast.show({
        type: "success",
        text1: "Invitación enviada",
        text2: `La invitación ha sido enviada a ${nuevoUsuario.email}.`,
        position: "bottom",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo crear el usuario.",
        position: "bottom",
      });
    }
  };

  const onSubmit = async (data: NuevoUsuario) => {
    await onSuccess(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Crear Usuario</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />

            <View style={styles.rolesSection}>
              <Text style={styles.rolesLabel}>Roles</Text>
              {availableRoles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleOption,
                    selectedRoles?.includes(role.id) && styles.selectedRole,
                  ]}
                  onPress={() => toggleRole(role.id)}
                >
                  <Text
                    style={[
                      styles.roleText,
                      selectedRoles?.includes(role.id) &&
                        styles.selectedRoleText,
                    ]}
                  >
                    {role.label}
                  </Text>
                  <Ionicons
                    name={
                      selectedRoles?.includes(role.id)
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={20}
                    color={
                      selectedRoles?.includes(role.id) ? "#3b82f6" : "#9ca3af"
                    }
                  />
                </TouchableOpacity>
              ))}
              {errors.roles && (
                <Text style={styles.errorText}>{errors.roles.message}</Text>
              )}
            </View>

            <Card style={styles.infoCard}>
              <Text style={styles.infoTitle}>Información</Text>
              <Text style={styles.infoText}>
                • Se enviará una contraseña temporal al email proporcionado
              </Text>
              <Text style={styles.infoText}>
                • El usuario deberá completar su perfil en el primer inicio de
                sesión
              </Text>
            </Card>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
            />
            <Button
              title="Crear Usuario"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.createButton}
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
  rolesSection: {
    marginBottom: 20,
  },
  rolesLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  roleOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  selectedRole: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  roleText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedRoleText: {
    color: "#3b82f6",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#f0f9ff",
    borderColor: "#0ea5e9",
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0c4a6e",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#0c4a6e",
    marginBottom: 4,
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
  createButton: {
    flex: 2,
  },
});
