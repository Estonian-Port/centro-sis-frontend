// app/(tabs)/accesos/index.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function AccesosIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir inmediatamente sin delay
    router.replace("/accesos/mis-accesos");
  }, []);

  // Mostrar un loader mientras se hace la redirección
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
});