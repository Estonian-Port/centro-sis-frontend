import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
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
import { UpdatePerfilUsuario } from "@/model/model";

// Esquema de validación
const schema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: yup
    .string()
    .required("El apellido es requerido")
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: yup.string().required("El email es requerido").email("Email inválido"),
  dni: yup
    .string()
    .required("El DNI es requerido")
    .matches(/^[0-9]+$/, "El DNI debe contener solo números")
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI debe tener máximo 8 dígitos"),
  celular: yup
    .string()
    .required("El celular es requerido")
    .matches(/^[0-9]+$/, "El celular debe contener solo números")
    .min(10, "El celular debe tener al menos 10 dígitos"),
});

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (data: UpdatePerfilUsuario) => Promise<void>;
  initialData: UpdatePerfilUsuario;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdatePerfilUsuario>({
    resolver: yupResolver(schema) as any,
    defaultValues: initialData,
  });

  // Reset form cuando cambian los datos iniciales
  useEffect(() => {
    if (visible) {
      reset(initialData);
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: UpdatePerfilUsuario) => {
    await onSuccess(data);
    onClose();
  };

  const handleClose = () => {
    reset(initialData);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color="#3b82f6"
              />
              <Text style={styles.title}>Editar Perfil</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            <Text style={styles.description}>
              Actualiza tu información personal
            </Text>

            {/* Nombre */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nombre</Text>
              <Controller
                control={control}
                name="nombre"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Ingresa tu nombre"
                    value={value}
                    onChangeText={onChange}
                    error={errors.nombre?.message}
                    leftIcon="person-outline"
                  />
                )}
              />
            </View>

            {/* Apellido */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Apellido</Text>
              <Controller
                control={control}
                name="apellido"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Ingresa tu apellido"
                    value={value}
                    onChangeText={onChange}
                    error={errors.apellido?.message}
                    leftIcon="person-outline"
                  />
                )}
              />
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="tu@email.com"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                    leftIcon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
            </View>

            {/* DNI */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>DNI</Text>
              <Controller
                control={control}
                name="dni"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="12345678"
                    value={value}
                    onChangeText={onChange}
                    error={errors.dni?.message}
                    leftIcon="card-outline"
                    keyboardType="numeric"
                    maxLength={8}
                  />
                )}
              />
            </View>

            {/* Celular */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Celular</Text>
              <Controller
                control={control}
                name="celular"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="1123456789"
                    value={value}
                    onChangeText={onChange}
                    error={errors.celular?.message}
                    leftIcon="call-outline"
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                )}
              />
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
              title={isSubmitting ? "Guardando..." : "Guardar Cambios"}
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
    height: 600,
    ...Platform.select({
      web: {
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
