// components/curso/AlumnoItem.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { Inscripcion } from "@/model/model";
import { Button } from "../ui/Button";
import { Tag } from "../ui/Tag";
import { formatEstadoPago } from "@/model/model";
import { COLORES } from "@/util/colores";

interface AlumnoItemProps {
  inscripcion: Inscripcion;
  onRegistrarPago: () => void;
  onAsignarPuntos: () => void;
  onDarDeBaja: () => void;
  onModificarBeneficio: () => void;
}

export const AlumnoItem: React.FC<AlumnoItemProps> = ({
  inscripcion,
  onRegistrarPago,
  onAsignarPuntos,
  onDarDeBaja,
  onModificarBeneficio,
}) => {
  const [showModal, setShowModal] = useState(false);
  const alumno = inscripcion.alumno;

  // Helper para obtener variant del tag según estado de pago
  const getEstadoPagoVariant = (estado: string) => {
    switch (estado) {
      case "AL_DIA":
        return "success";
      case "ATRASADO":
        return "warning";
      case "PENDIENTE":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <>
      {/* Card Clickeable */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        {/* Alumno Info */}
        <View style={styles.alumnoInfo}>
          <View style={styles.alumnoAvatar}>
            <Text style={styles.avatarText}>
              {alumno.nombre[0]}
              {alumno.apellido[0]}
            </Text>
          </View>
          <View style={styles.alumnoDetails}>
            <Text style={styles.alumnoName}>
              {alumno.nombre} {alumno.apellido}
            </Text>
            <View style={styles.alumnoMeta}>
              <Ionicons name="mail-outline" size={14} color="#6b7280" />
              <Text style={styles.alumnoMetaText}>{alumno.email}</Text>
            </View>
          </View>
        </View>

        {/* Estado de Pago */}
        <View style={styles.cardRight}>
          <Tag
            label={formatEstadoPago(inscripcion.estadoPago)}
            variant={getEstadoPagoVariant(inscripcion.estadoPago)}
          />
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>

      {/* Modal con Detalles */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header del Modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarText}>
                    {alumno.nombre[0]}
                    {alumno.apellido[0]}
                  </Text>
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {alumno.nombre} {alumno.apellido}
                  </Text>
                  <Tag
                    label={formatEstadoPago(inscripcion.estadoPago)}
                    variant={getEstadoPagoVariant(inscripcion.estadoPago)}
                    style={styles.modalTag}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Información Personal */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                <View style={styles.infoGrid}>
                  <InfoRow label="DNI" value={alumno.dni || "N/A"} />
                  <InfoRow label="Celular" value={alumno.celular || "N/A"} />
                  <InfoRow label="Email" value={alumno.email} />
                  <InfoRow
                    label="Fecha Inscripción"
                    value={
                      inscripcion.fechaInscripcion
                        ? new Date(
                            inscripcion.fechaInscripcion
                          ).toLocaleDateString("es-AR")
                        : "N/A"
                    }
                  />
                </View>
              </View>

              {/* Asistencia */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Asistencia</Text>
                <View style={styles.asistenciaContainer}>
                  <View style={styles.asistenciaBar}>
                    <View
                      style={[
                        styles.asistenciaProgress,
                        {
                          width: `${inscripcion.porcentajeAsistencia || 0}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.asistenciaText}>
                    {inscripcion.porcentajeAsistencia || 0}% de asistencia
                  </Text>
                </View>
              </View>

              {/* Información de Pago */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información de Pago</Text>
                <View style={styles.infoGrid}>
                  <InfoRow
                    label="Modalidad"
                    value={inscripcion.tipoPagoElegido.tipo}
                    valueStyle={styles.boldValue}
                  />
                  <InfoRow
                    label="Monto"
                    value={`$${inscripcion.tipoPagoElegido.monto.toLocaleString()}`}
                    valueStyle={styles.greenValue}
                  />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Beneficio</Text>
                    <View style={styles.beneficioRow}>
                      <Text
                        style={[
                          styles.infoValue,
                          inscripcion.beneficio > 0 && styles.orangeValue,
                        ]}
                      >
                        {inscripcion.beneficio > 0
                          ? `${inscripcion.beneficio}% de descuento`
                          : "0%"}
                      </Text>
                      <TouchableOpacity
                        onPress={onModificarBeneficio}
                        style={styles.editButton}
                      >
                        <Ionicons name="pencil" size={16} color="#3b82f6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Pagos Realizados */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderWithAction}>
                  <Text style={styles.sectionTitle}>
                    Pagos Realizados ({inscripcion.pagosRealizados?.length || 0})
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      onRegistrarPago();
                    }}
                    style={styles.sectionActionButton}
                  >
                    <Ionicons name="add-circle" size={20} color={COLORES.violeta} />
                    <Text style={styles.sectionActionText}>Registrar Pago</Text>
                  </TouchableOpacity>
                </View>
                {inscripcion.pagosRealizados && inscripcion.pagosRealizados.length > 0 ? (
                  <View style={styles.pagosContainer}>
                    {inscripcion.pagosRealizados.map((pago) => (
                      <View key={pago.id} style={styles.pagoItem}>
                        <View style={styles.pagoInfo}>
                          <Ionicons name="cash" size={18} color="#10b981" />
                          <View style={styles.pagoDetails}>
                            <Text style={styles.pagoMonto}>
                              ${pago.monto.toLocaleString()}
                            </Text>
                            <Text style={styles.pagoFecha}>
                              {new Date(pago.fecha).toLocaleDateString("es-AR")}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.pagoTipo}>
                          {pago.tipoPagoElegido.tipo}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyPayments}>
                    <Ionicons name="cash-outline" size={32} color="#d1d5db" />
                    <Text style={styles.emptyPaymentsText}>
                      No hay pagos registrados
                    </Text>
                  </View>
                )}
              </View>

              {/* Puntos */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderWithAction}>
                  <Text style={styles.sectionTitle}>Sistema de Recompensas</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      onAsignarPuntos();
                    }}
                    style={styles.sectionActionButton}
                  >
                    <Ionicons name="add-circle" size={20} color="#f59e0b" />
                    <Text style={[styles.sectionActionText, { color: "#f59e0b" }]}>
                      Asignar Puntos
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.puntosContainer}>
                  <Ionicons name="star" size={32} color="#f59e0b" />
                  <Text style={styles.puntosText}>
                    {inscripcion.puntos || 0} puntos
                  </Text>
                </View>
              </View>

              {/* Dar de Baja */}
              <View style={styles.section}>
                <Button
                  title="Dar de Baja del Curso"
                  variant="outline"
                  onPress={() => {
                    setShowModal(false);
                    onDarDeBaja();
                  }}
                  style={{ width: "100%", borderColor: "#ef4444" }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Helper Component
const InfoRow = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: any;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  alumnoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  alumnoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  alumnoDetails: {
    flex: 1,
  },
  alumnoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  alumnoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alumnoMetaText: {
    fontSize: 13,
    color: "#6b7280",
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    ...Platform.select({
      web: {
        justifyContent: "center",
        alignItems: "center",
      },
    }),
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    maxHeight: Platform.OS === 'web' ? '85vh' as any : undefined,
    ...Platform.select({
      web: {
        borderRadius: 16,
        width: "100%",
        maxWidth: 600,
      },
      default: {
        // En mobile ocupa todo el alto disponible
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  modalTag: {
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  sectionHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORES.violeta,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    textAlign: "right",
  },
  boldValue: {
    fontWeight: "600",
  },
  greenValue: {
    color: "#10b981",
    fontWeight: "700",
  },
  orangeValue: {
    color: "#f59e0b",
    fontWeight: "600",
  },
  beneficioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  asistenciaContainer: {
    gap: 8,
  },
  asistenciaBar: {
    height: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 5,
    overflow: "hidden",
  },
  asistenciaProgress: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 5,
  },
  asistenciaText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  pagosContainer: {
    gap: 12,
  },
  pagoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pagoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  pagoDetails: {
    flex: 1,
  },
  pagoMonto: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 2,
  },
  pagoFecha: {
    fontSize: 13,
    color: "#6b7280",
  },
  pagoTipo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyPayments: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyPaymentsText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  puntosContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
  },
  puntosText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f59e0b",
  },
});