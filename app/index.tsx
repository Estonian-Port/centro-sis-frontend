// app/index.tsx
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/context/authContext';
import { router } from 'expo-router';
import { TIPOGRAFIA } from '@/util/tipografia';

export default function RootIndex() {
  const { isAuthenticated, isLoading, usuario } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (usuario?.primerLogin) {
        router.replace('/complete-profile');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, usuario?.primerLogin]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...TIPOGRAFIA.titleL,
  },
});
