import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet, Text } from "react-native";

const IOSScannerOverlay = ({
  processing,
  onClose,
}: {
  processing: boolean;
  onClose: () => void;
}) => {
  return (
    <View style={styles.iosOverlay}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.iosFrame} />

      <Text style={styles.scanText}>
        {processing ? "Procesando..." : "Apuntá al QR"}
      </Text>
    </View>
  );
};

export default IOSScannerOverlay;

const styles = StyleSheet.create({
  iosOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  iosFrame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 16,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 24,
  },
});
