import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido'),
  apellido: yup.string().required('El apellido es requerido'),
  dni: yup.string().required('El DNI es requerido'),
  telefono: yup.string().required('El teléfono es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La nueva contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma la nueva contraseña'),
});

interface CompleteProfileData {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  password: string;
  confirmPassword: string;
}

export default function CompleteProfileScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: CompleteProfileData) => {
    try {
      // Here you would typically make an API call to update the user profile
      console.log('Updating profile:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Perfil Completado',
        'Tu perfil ha sido actualizado correctamente.',
        [
          {
            text: 'Continuar',
            onPress: () => router.replace('/(tabs)/' as any),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al actualizar tu perfil.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Completar Perfil</Text>
          <Text style={styles.subtitle}>
            Para continuar, necesitamos que completes tu información personal y
            cambies tu contraseña.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nombre"
                  value={value}
                  onChangeText={onChange}
                  error={errors.nombre?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="apellido"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Apellido"
                  value={value}
                  onChangeText={onChange}
                  error={errors.apellido?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="dni"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="DNI"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.dni?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Teléfono"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  error={errors.telefono?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nueva Contraseña"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirmar Contraseña"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              title="Completar Perfil"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
  },
});
