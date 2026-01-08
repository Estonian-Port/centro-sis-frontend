import { LoginForm } from "@/components/forms/loginForm";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/authContext";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TIPOGRAFIA } from "@/util/tipografia";
import { COLORES } from "@/util/colores";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui/Logo";

export default function LoginScreen() {
  const { usuario, isLoading, isAuthenticated } = useAuth();

  return (
    <LinearGradient
      colors={[COLORES.violeta, COLORES.cobre]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Logo size={200} color={COLORES.dorado} />
            <Text style={styles.title}>CENTRO SIS</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Educativa</Text>
          </View>
          <Card style={styles.loginCard}>
            <LoginForm />
          </Card>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    maxWidth: Platform.OS === "web" ? 400 : "100%",
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    ...TIPOGRAFIA.titleXL,
    color: COLORES.dorado,
    textAlign: "center",
  },
  subtitle: {
    ...TIPOGRAFIA.subtitle,
    color: COLORES.dorado,
    textAlign: "center",
  },
  loginCard: {
    marginBottom: 20,
  },
});
