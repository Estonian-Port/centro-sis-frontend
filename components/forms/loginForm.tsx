import { useAuth } from "@/context/authContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import * as yup from "yup";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TIPOGRAFIA } from "@/util/tipografia";
import { COLORES } from "@/util/colores";

const schema = yup.object().shape({
  email: yup.string().email("Email inválido").required("El email es requerido"),
  password: yup
    .string()
    .min(3, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
});

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const usuarioLogueado = await login(data.email, data.password);
      if (
        usuarioLogueado.primerLogin ||
        usuarioLogueado.estado === "PENDIENTE"
      ) {
        router.replace("/complete-profile");
      } else {
        router.replace("/(tabs)");
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error en login:", error);
      Alert.alert("Error", "Credenciales inválidas");
    }
  };

  return (
    <View style={styles.form}>
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
          />
        )}
      />

      {/** Mostrar/ocultar contraseña con icono de ojo */}
      <PasswordController
        control={control}
        error={errors.password?.message}
        isSubmitting={isSubmitting}
        labelStyle={styles.labelText}
        textInputStyle={styles.textInput}
      />

      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting || isLoading}
        style={styles.loginButton}
        textStyle={{ ...TIPOGRAFIA.subtitle, color: COLORES.blanco }}
        disabled={isSubmitting || isLoading}
      />
    </View>
  );
};

// Componente auxiliar para el campo de contraseña
const PasswordController: React.FC<{
  control: any;
  error?: string;
  isSubmitting: boolean;
  labelStyle?: any;
  textInputStyle?: any;
}> = ({ control, error, isSubmitting, labelStyle, textInputStyle }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Controller
      control={control}
      name="password"
      render={({ field: { onChange, value } }) => (
        <Input
          label="Contraseña"
          value={value}
          onChangeText={onChange}
          secureTextEntry={!showPassword}
          error={error}
          editable={!isSubmitting}
          style={textInputStyle}
          labelStyle={labelStyle}
          rightIcon={showPassword ? "eye-off" : "eye"}
          onRightIconPress={() => setShowPassword((v) => !v)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: COLORES.violeta,
  },
  textInput: {
    ...TIPOGRAFIA.body,
    color: COLORES.textPrimary,
  },
  labelText: {
    ...TIPOGRAFIA.subtitle,
    color: COLORES.textPrimary,
  },
});
