// components/modals/AdultoResponsableModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from "react-native";
import { AdultoResponsable } from "@/model/model";
import { Button } from "@/components/ui/Button";

interface AdultoResponsableModalProps {
  visible: boolean;
  onClose: () => void;
  adultoResponsable: AdultoResponsable;
}

export const AdultoResponsableModal: React.FC<AdultoResponsableModalProps> = ({
  visible,
  onClose,
  adultoResponsable,
}) => {
  const handleCallPhone = () => {
    const phoneUrl = `tel:${adultoResponsable.celular}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        }
      })
      .catch((err) => console.error("Error al abrir teléfono:", err));
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `whatsapp://send?phone=${adultoResponsable.celular}`;
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          // Fallback a web
          const webUrl = `https://wa.me/${adultoResponsable.celular}`;
          Linking.openURL(webUrl);
        }
      })
      .catch((err) => console.error("Error al abrir WhatsApp:", err));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={32} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.title}>Adulto Responsable</Text>
                <Text style={styles.subtitle}>Información de contacto</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Tarjeta de información */}
            <View style={styles.infoCard}>
              {/* Nombre completo */}
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <Ionicons name="person" size={20} color="#f59e0b" />
                  <Text style={styles.infoHeaderText}>Datos Personales</Text>
                </View>
                <View style={styles.infoGrid}>
                  <InfoRow
                    label="Nombre completo"
                    value={`${adultoResponsable.nombre} ${adultoResponsable.apellido}`}
                  />
                  <InfoRow label="DNI" value={adultoResponsable.dni} />
                  <InfoRow
                    label="Relación"
                    value={adultoResponsable.relacion}
                  />
                </View>
              </View>

              {/* Contacto */}
              <View style={styles.divider} />
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <Ionicons name="call" size={20} color="#10b981" />
                  <Text style={styles.infoHeaderText}>Contacto</Text>
                </View>
                <View style={styles.infoGrid}>
                  <InfoRow
                    label="Celular"
                    value={adultoResponsable.celular.toString()}
                  />
                </View>
              </View>
            </View>

            {/* Botones de acción rápida */}
            <View style={styles.quickActions}>
              <Text style={styles.quickActionsTitle}>Acciones Rápidas</Text>
              <View style={styles.quickActionsGrid}>
                {/* Botón Llamar */}
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={handleCallPhone}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: "#dbeafe" },
                    ]}
                  >
                    <Ionicons name="call" size={24} color="#3b82f6" />
                  </View>
                  <Text style={styles.quickActionText}>Llamar</Text>
                </TouchableOpacity>

                {/* Botón WhatsApp */}
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={handleWhatsApp}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: "#d1fae5" },
                    ]}
                  >
                    <Ionicons name="logo-whatsapp" size={24} color="#10b981" />
                  </View>
                  <Text style={styles.quickActionText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cerrar"
              variant="outline"
              onPress={onClose}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Helper component
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 600,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoSection: {
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  quickActions: {
    marginTop: 20,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerButton: {
    width: "100%",
  },
});
