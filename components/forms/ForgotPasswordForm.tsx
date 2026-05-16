import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as yup from "yup";
import Toast from "react-native-toast-message";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TIPOGRAFIA } from "@/util/tipografia";
import { COLORES } from "@/util/colores";
import { usuarioService } from "@/services/usuario.service";
import { getErrorMessage } from "@/helper/auth.interceptor";
import { Ionicons } from "@expo/vector-icons";

const schema = yup.object().shape({
  email: yup.string().email("Email inválido").required("El email es requerido"),
});

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordForm: React.FC = () => {
  const [enviado, setEnviado] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await usuarioService.solicitarRecuperarPassword(data.email);
      setEnviado(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo enviar el correo",
        position: "bottom",
      });
    }
  };

  if (enviado) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-open" size={40} color={COLORES.violeta} />
        </View>
        <Text style={styles.successTitle}>¡Correo enviado!</Text>
        <Text style={styles.successText}>
          Si el email <Text style={styles.emailDestacado}>{getValues("email")}</Text> está registrado,
          recibirás las instrucciones para restablecer tu contraseña.
        </Text>
        <Text style={styles.spamHint}>
          Revisá también la carpeta de spam.
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={styles.volverButton}>
          <Ionicons name="arrow-back" size={16} color={COLORES.violeta} />
          <Text style={styles.volverText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <Text style={styles.description}>
        Ingresá tu email y te enviaremos las instrucciones para restablecer tu contraseña.
      </Text>

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
            editable={!isSubmitting}
            style={styles.textInput}
            labelStyle={styles.labelText}
            leftIcon="mail"
          />
        )}
      />

      <Button
        title="Enviar instrucciones"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.submitButton}
        textStyle={{ ...TIPOGRAFIA.subtitle, color: COLORES.blanco }}
        disabled={isSubmitting}
      />

      <TouchableOpacity
        onPress={() => router.replace("/(auth)/login")}
        style={styles.cancelLink}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={16} color={COLORES.violeta} />
        <Text style={styles.cancelText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
  },
  description: {
    ...TIPOGRAFIA.body,
    color: COLORES.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  textInput: {
    ...TIPOGRAFIA.body,
    color: COLORES.textPrimary,
  },
  labelText: {
    ...TIPOGRAFIA.subtitle,
    color: COLORES.textPrimary,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: COLORES.violeta,
  },
  cancelLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  cancelText: {
    ...TIPOGRAFIA.body,
    color: COLORES.violeta,
    fontWeight: "600",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3e8ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    ...TIPOGRAFIA.titleL,
    color: COLORES.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    ...TIPOGRAFIA.body,
    color: COLORES.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  emailDestacado: {
    fontWeight: "700",
    color: COLORES.textPrimary,
  },
  spamHint: {
    fontSize: 13,
    color: COLORES.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    fontStyle: "italic",
  },
  volverButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  volverText: {
    ...TIPOGRAFIA.body,
    color: COLORES.violeta,
    fontWeight: "600",
  },
});
