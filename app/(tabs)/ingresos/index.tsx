// app/(tabs)/ingresos/index.tsx
// Versión de DEBUG - Si ves este texto, el archivo está cargando

import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function IngresosIndex() {
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 IngresosIndex montado - Redirigiendo...");
    // Redirigir después de un pequeño delay para ver si se monta
    const timeout = setTimeout(() => {
      router.replace("/ingresos/mis-ingresos");
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⏳ Redirigiendo a Mis Ingresos...</Text>
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
  text: {
    fontSize: 16,
    color: "#6b7280",
  },
});