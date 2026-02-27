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
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TIPOGRAFIA } from "@/util/tipografia";
import { COLORES } from "@/util/colores";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/forms/loginForm";
import { RegistroAlumnoModal } from "@/components/modals/AltaAlumnoModal";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [showRegistroModal, setShowRegistroModal] = useState(false);

  return (
    <LinearGradient
      colors={[COLORES.violeta, COLORES.cobre]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
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

                <TouchableOpacity
                  style={styles.registroButton}
                  onPress={() => setShowRegistroModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-add" size={20} color="#ffffff" />
                  <Text style={styles.registroButtonText}>
                    Registrarse como Alumno
                  </Text>
                </TouchableOpacity>

                <Text style={styles.registroHint}>
                  ¿Sos alumno nuevo? Registrate para acceder al sistema
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

                  <TouchableOpacity
                    style={styles.registroButton}
                    onPress={() => setShowRegistroModal(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-add" size={20} color="#ffffff" />
                    <Text style={styles.registroButtonText}>
                      Registrarse como Alumno
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.registroHint}>
                    ¿Sos alumno nuevo? Registrate para acceder al sistema
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <RegistroAlumnoModal
          visible={showRegistroModal}
          onClose={() => setShowRegistroModal(false)}
        />
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
    paddingVertical: 20,
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
  registroButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 12,
  },
  registroButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  registroHint: {
    fontSize: 13,
    color: "#ffffff",
    textAlign: "center",
    opacity: 0.9,
  },
});