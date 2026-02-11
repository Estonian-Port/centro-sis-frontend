import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/authContext";
import { Stack } from "expo-router";
import { QRData } from "@/model/model";
import { CustomDrawerHeader } from "@/components/navigation/CustomDrawerHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MiQRScreen() {
  const { usuario } = useAuth();
  const [qrData, setQrData] = useState<QRData | null>(null);

  useEffect(() => {
    if (usuario) {
      setQrData({
        usuarioId: usuario.id,
        tipo: "PERMANENTE",
      });
    }
  }, [usuario]);

  if (!usuario || !qrData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando QR...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <CustomDrawerHeader title="Mi Código QR" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Instrucción Principal */}
        <View style={styles.header}>
          <Ionicons name="qr-code" size={48} color="#3b82f6" />
          <Text style={styles.title}>Tu Código de Acceso</Text>
          <Text style={styles.subtitle}>
            Mostrá este código al ingresar al instituto
          </Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={JSON.stringify(qrData)}
              size={260}
              backgroundColor="white"
              color="black"
            />
          </View>

          {/* Badge Permanente */}
          <View style={styles.permanentBadge}>
            <Ionicons name="infinite" size={20} color="#10b981" />
            <Text style={styles.permanentText}>Código Permanente</Text>
          </View>
        </View>

        {/* Usuario Info */}
        <View style={styles.userCard}>
          <View style={styles.userRow}>
            <Ionicons name="person" size={20} color="#6b7280" />
            <Text style={styles.userLabel}>Nombre:</Text>
            <Text style={styles.userValue}>
              {usuario.nombre} {usuario.apellido}
            </Text>
          </View>
          <View style={styles.userRow}>
            <Ionicons name="card" size={20} color="#6b7280" />
            <Text style={styles.userLabel}>DNI:</Text>
            <Text style={styles.userValue}>{usuario.dni}</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#10b981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Código Permanente</Text>
            <Text style={styles.infoText}>
              Este código NO expira. Podés mostrarlo desde tu celular o
              imprimirlo en una tarjeta.
            </Text>
          </View>
        </View>

        {/* Instrucciones */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instrucciones de Uso:</Text>
          <View style={styles.instructionRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Mostrá este código al portero desde tu celular
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              El portero escaneará el código y registrará tu acceso
            </Text>
          </View>
        </View>

        {/* Nota Importante */}
        <View style={styles.warningBox}>
          <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
          <Text style={styles.warningText}>
            <Text style={styles.bold}>Importante:</Text> No compartas este
            código con otras personas. Es personal e intransferible.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },

  // QR Container
  qrContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  qrWrapper: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  permanentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 20,
  },
  permanentText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10b981",
  },

  // User Card
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  userValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  // Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#d1fae5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#065f46",
    lineHeight: 20,
  },

  // Instrucciones
  instructions: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "600",
    color: "#3b82f6",
  },

  // Warning Box
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
});
