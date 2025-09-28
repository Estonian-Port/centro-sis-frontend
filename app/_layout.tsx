import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// --- MOCKS -------------------------------------------------

// Simula que el framework ya está listo
const useFrameworkReady = () => {
  return true;
};

// Mock de Auth
const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simula delay de carga
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true); // cambiar a false para probar flujo no auth
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return { isLoading, isAuthenticated };
};

// Mock de AuthProvider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// ----------------------------------------------------------

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null; // loading screen
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
