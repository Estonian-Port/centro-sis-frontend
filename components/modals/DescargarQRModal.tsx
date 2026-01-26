// components/modals/DescargarQRModal.tsx - ARREGLADO
import React, { useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/authContext";

interface DescargarQRModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DescargarQRModal: React.FC<DescargarQRModalProps> = ({
  visible,
  onClose,
}) => {
  const { usuario } = useAuth();
  const qrRef = useRef<any>(null);

  const qrData = usuario
    ? {
        usuarioId: usuario.id,
        tipo: "PERMANENTE",
      }
    : null;

  const handleDescargar = () => {
    if (Platform.OS === "web") {
      // ✅ En web: Intentar descargar como PNG
      try {
        qrRef.current?.toDataURL((dataURL: string) => {
          const link = document.createElement("a");
          link.href = dataURL;
          link.download = `QR_${usuario?.nombre}_${usuario?.apellido}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } catch (error) {
        Alert.alert(
          "Error",
          "No se pudo descargar el QR. Por favor, toma una captura de pantalla."
        );
      }
    } else {
      // ✅ En móvil: Instrucciones para captura
      Alert.alert(
        "Guardar QR",
        "Para guardar tu QR:\n\n1. Toma captura de pantalla de esta ventana\n2. Recorta solo el QR\n3. Imprimilo en tamaño tarjeta (85 x 55 mm)\n4. Plastificalo y llevalo en tu billetera",
        [{ text: "Entendido", style: "default" }]
      );
    }
  };

  if (!usuario || !qrData) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="download" size={28} color="#10b981" />
              <Text style={styles.title}>QR para Tarjeta</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* ✅ ScrollView para todo el contenido */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* QR Card */}
            <View style={styles.qrCard}>
              <View style={styles.qrCardHeader}>
                <Text style={styles.instituteText}>CENTRO ESTONIAN PORT</Text>
                <Text style={styles.cardTitle}>TARJETA DE ACCESO</Text>
              </View>

              <View style={styles.qrWrapper}>
                <QRCode
                  value={JSON.stringify(qrData)}
                  size={220}
                  backgroundColor="white"
                  color="black"
                  getRef={(ref) => (qrRef.current = ref)}
                />
              </View>

              <View style={styles.qrCardFooter}>
                <Text style={styles.userName}>
                  {usuario.nombre} {usuario.apellido}
                </Text>
                <Text style={styles.userDni}>DNI: {usuario.dni}</Text>
              </View>

              <View style={styles.permanentBadge}>
                <Ionicons name="infinite" size={16} color="#10b981" />
                <Text style={styles.permanentText}>PERMANENTE</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#10b981" />
              <Text style={styles.infoText}>
                Este código NO expira. Guardalo para acceder siempre al
                instituto.
              </Text>
            </View>

            {/* Instrucciones según plataforma */}
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>
                {Platform.OS === "web"
                  ? "Para descargar:"
                  : "Para guardar en tu celular:"}
              </Text>
              {Platform.OS === "web" ? (
                <Text style={styles.instructionText}>
                  1. Tocá "Descargar"{"\n"}
                  2. Se guardará como imagen{"\n"}
                  3. Imprimila en tamaño tarjeta (85 x 55 mm){"\n"}
                  4. Plastificala y llevala en tu billetera
                </Text>
              ) : (
                <Text style={styles.instructionText}>
                  1. Tocá "Instrucciones" abajo{"\n"}
                  2. Seguí los pasos para tomar captura{"\n"}
                  3. Imprimilo o guardalo en tu galería{"\n"}
                  4. Llevá la tarjeta impresa en tu billetera
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Botones - Fuera del ScrollView */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={handleDescargar}
            >
              <Ionicons name="download" size={20} color="#ffffff" />
              <Text style={styles.downloadButtonText}>
                {Platform.OS === "web" ? "Descargar" : "Instrucciones"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 450,
    maxHeight: "90%", // ✅ Limitar altura
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },

  // ✅ ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },

  // QR Card
  qrCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginBottom: 20,
  },
  qrCardHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  instituteText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 4,
  },
  qrWrapper: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 16,
  },
  qrCardFooter: {
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  userDni: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  permanentBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d1fae5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "center",
  },
  permanentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#d1fae5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#065f46",
    lineHeight: 18,
  },
  instructions: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 20,
  },

  // Botones
  buttons: {
    flexDirection: "row",
    gap: 12,
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  downloadButton: {
    backgroundColor: "#10b981",
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});