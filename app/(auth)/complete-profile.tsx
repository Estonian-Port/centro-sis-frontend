import { useAuth } from '@/context/authContext'; // AGREGAR
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as yup from 'yup';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const schema = yup.object({
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
  const { user, setUser, hasMultipleRoles } = useAuth(); // AGREGAR
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      dni: user?.dni || '',
      telefono: user?.telefono || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: CompleteProfileData) => {
    try {
      console.log('Updating profile:', data);

      // Simula API - aquí deberías hacer la llamada real
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar el usuario en el contexto
      if (user) {
        const updatedUser = {
          ...user,
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          telefono: data.telefono,
          firstLogin: false, // IMPORTANTE: Marcar como completado
        };
        setUser(updatedUser);
      }

      Alert.alert(
        'Perfil Completado',
        'Tu perfil ha sido actualizado correctamente.',
        [
          {
            text: 'Continuar',
            onPress: () => {
              if (hasMultipleRoles()) {
                router.replace('/(tabs)/' as any);
              } else {
                router.replace('/(tabs)/' as any);
              }
            },
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