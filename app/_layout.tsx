import { AuthProvider, useAuth } from '@/context/authContext';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

function RootStack() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (user?.firstLogin) {
        // Si es el primer login, ir a completar perfil
        router.replace('/(auth)/complete-profile');
      } else {
        // Si ya completó el perfil, ir a tabs
        router.replace('/(tabs)' as any);
      }
    }
  }, [isAuthenticated, isLoading, user?.firstLogin]);

  // Mientras cargamos el token no mostramos nada
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Registramos todas las rutas */}
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/complete-profile" /> {/* AGREGAR ESTA LÍNEA */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}