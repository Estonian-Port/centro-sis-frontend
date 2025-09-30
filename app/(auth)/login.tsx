import { useAuth } from '@/context/authContext';
import { router } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LoginForm } from '../../components/forms/loginForm';
import { Card } from '../../components/ui/Card';


export default function LoginScreen() {
  const { user, hasMultipleRoles } = useAuth();

  const handleLoginSuccess = () => {
    if (user?.firstLogin) {
      router.replace('/(auth)/complete-profile');
    } else if (hasMultipleRoles()) {
      router.replace('/(tabs)/' as any);
    } else {
      router.replace('/(tabs)/' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Centro-sis</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Educativa</Text>
        </View>

        <Card style={styles.loginCard}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          <LoginForm onSuccess={handleLoginSuccess} />
        </Card>

        {process.env.EXPO_PUBLIC_MOCK_MODE === 'true' && (
          <Card style={styles.demoCard}>
            <Text style={styles.demoTitle}>Modo Demo</Text>
            <Text style={styles.demoText}>
              Credenciales de prueba:
              {'\n'}• Alumno: alumno@test.com / 123456
              {'\n'}• Profesor: profesor@test.com / 123456
              {'\n'}• Admin: admin@test.com / 123456
              {'\n'}• Profesor y Alumno: profesoralumno@test.com / 123456
              {'\n'}• Todos: completo@test.com / 123456
            </Text>
          </Card>
        )}
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
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loginCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  demoCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});
