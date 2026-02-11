import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/authContext";
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

export default function LoginScreen() {
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
                </View>
              </TouchableWithoutFeedback>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
});
