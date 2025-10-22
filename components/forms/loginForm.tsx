import { useAuth } from '@/context/authContext';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import * as yup from 'yup';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup
    .string()
    .min(3, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, usuario, isLoading } = useAuth();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      
      // Pequeño delay para asegurar que el contexto se actualizó
      setTimeout(() => {
        if (usuario?.primerLogin) {
          router.replace('/complete-profile');
        } else {
          router.replace('/(tabs)');
        }
      }, 300);
      
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
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
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Contraseña"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={errors.password?.message}
            editable={!isSubmitting}
          />
        )}
      />

      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting || isLoading}
        style={styles.loginButton}
        disabled={isSubmitting || isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: 8,
  },
});