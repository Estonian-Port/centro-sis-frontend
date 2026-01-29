import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function PagosIndex() {
  const { selectedRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Alumno va directo a Realizados, otros van a Recibidos
    const defaultTab = selectedRole === "ALUMNO" ? "realizados" : "recibidos";
    router.replace(`/pagos/${defaultTab}`);
  }, [selectedRole]);

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
