import { Card } from "@/components/ui/Card";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TIPOGRAFIA } from "@/util/tipografia";
import { COLORES } from "@/util/colores";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/forms/loginForm";
import { RegistroAlumnoModal } from "@/components/modals/AltaAlumnoModal";
import Toast from "react-native-toast-message";
import packageJson from "../../package.json"; 

export default function LoginScreen() {
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const appVersion = packageJson.version;

  return (
    <LinearGradient
      colors={[COLORES.violeta, COLORES.cobre]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {Platform.OS === "web" ? (
              <View style={styles.content}>
                <View style={styles.header}>
                  <Logo size={200} color={COLORES.dorado} />
                  <Text style={styles.title}>CENTRO SIS</Text>
                  <Text style={styles.subtitle}>
                    Sistema de Gestión Educativa
                  </Text>
                </View>
                <Card style={styles.loginCard}>
                  <LoginForm />
                </Card>

                <Text style={styles.registroHint}>
                  La contraseña es sensible a Mayúsculas y Minúsculas
                </Text>
              </View>
            ) : (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.content}>
                  <View style={styles.header}>
                    <Logo size={200} color={COLORES.dorado} />
                    <Text style={styles.title}>CENTRO SIS</Text>
                    <Text style={styles.subtitle}>
                      Sistema de Gestión Educativa
                    </Text>
                  </View>
                  <Card style={styles.loginCard}>
                    <LoginForm />
                  </Card>
                  
                  <Text style={styles.registroHint}>
                    La contraseña es sensible a Mayúsculas y Minúsculas
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>v{appVersion}</Text>
        </View>

        <RegistroAlumnoModal
          visible={showRegistroModal}
          onClose={() => setShowRegistroModal(false)}
        />

        <Toast />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? 400 : "100%",
    alignSelf: "center",
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
  registroHint: {
    fontSize: 15,
    color: "#ffffff",
    textAlign: "center",
    opacity: 0.9,
    fontWeight: "bold",
  },
  versionFooter: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 20 : 10,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        pointerEvents: "none", // Evita capas invisibles bloqueando clics en web
      },
    }),
  },
  versionText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
    letterSpacing: 0.5,
  },
});