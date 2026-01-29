// components/curso/AlumnoDetailModal.tsx
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
import {
  Curso,
  Estado,
  EstadoCurso,
  EstadoPago,
  Inscripcion,
  Rol,
  TipoCurso,
} from "@/model/model";
import { COLORES } from "@/util/colores";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import {
  estadoPagoToTagVariant, formatEstadoPago
} from "@/helper/funciones";
import { useAuth } from "@/context/authContext";
import { AdultoResponsableModal } from "@/components/modals/AdultoResponsableModal";

interface AlumnoDetailModalProps {
  visible: boolean;
  onClose: () => void;
  inscripcion: Inscripcion;
  curso: Curso;
  onOpenRegistrarPago: () => void;
  onOpenAsignarPuntos: () => void;
  onOpenEditarBeneficio: () => void;
  onDarDeBaja: () => void;
}

export const AlumnoDetailModal: React.FC<AlumnoDetailModalProps> = ({
  visible,
  onClose,
  inscripcion,
  curso,
  onOpenRegistrarPago,
  onOpenAsignarPuntos,
  onOpenEditarBeneficio,
  onDarDeBaja,
}) => {
  const { selectedRole } = useAuth();
  const [showAdultoResponsableModal, setShowAdultoResponsableModal] =
    useState(false);
  const alumno = inscripcion.alumno;

  const esMenorDeEdad = (fechaNacimiento: string | undefined) => {
    if (!fechaNacimiento) return false;
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth() - fechaNac.getMonth();

    if (
      mesActual < 0 ||
      (mesActual === 0 && hoy.getDate() < fechaNac.getDate())
    ) {
      return edad - 1 < 18;
    }
    return edad < 18;
  };

  const evaluarPorRol =
    (curso?.tipoCurso === TipoCurso.COMISION &&
      selectedRole !== null &&
      (selectedRole === Rol.ADMINISTRADOR || selectedRole === Rol.OFICINA)) ||
    (curso?.tipoCurso === TipoCurso.ALQUILER &&
      selectedRole !== null &&
      (selectedRole === Rol.ADMINISTRADOR || selectedRole === Rol.PROFESOR));

  const puedeEditarPagos =
    curso?.estadoAlta === Estado.ACTIVO &&
    evaluarPorRol &&
    inscripcion.estadoPago !== EstadoPago.PAGO_COMPLETO;

  const puedeEditarBeneficio =
    curso?.estadoAlta === Estado.ACTIVO && evaluarPorRol;

  const puedeDarDeBaja =
    evaluarPorRol &&
    curso?.estadoAlta === Estado.ACTIVO &&
    (curso?.estado === EstadoCurso.EN_CURSO ||
      curso?.estado === EstadoCurso.POR_COMENZAR);

  const puedeEditarPuntos =
    selectedRole !== null &&
    (selectedRole === Rol.ADMINISTRADOR || selectedRole === Rol.PROFESOR) &&
    curso?.estadoAlta === Estado.ACTIVO &&
    curso?.estado === EstadoCurso.EN_CURSO;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
                  variant={estadoPagoToTagVariant(inscripcion.estadoPago)}
                  style={styles.modalTag}
                />
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                  label="Fecha de nacimiento"
                  value={alumno.fechaNacimiento}
                />
                <InfoRow
                  label="Fecha Inscripción"
                  value={
                    inscripcion.fechaInscripcion
                      ? new Date(
                          inscripcion.fechaInscripcion,
                        ).toLocaleDateString("es-AR")
                      : "N/A"
                  }
                />
              </View>
              {esMenorDeEdad(alumno.fechaNacimiento) &&
                alumno.adultoResponsable && (
                  <>
                    <View style={styles.dividerSmall} />
                    <TouchableOpacity
                      style={styles.adultoResponsableRow}
                      onPress={() => setShowAdultoResponsableModal(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.adultoResponsableLeft}>
                        <Ionicons
                          name="people-outline"
                          size={18}
                          color="#f59e0b"
                        />
                        <Text style={styles.adultoResponsableLabel}>
                          Adulto Responsable
                        </Text>
                      </View>
                      <View style={styles.adultoResponsableRight}>
                        <Text style={styles.adultoResponsableName}>
                          {alumno.adultoResponsable.nombre}{" "}
                          {alumno.adultoResponsable.apellido}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#9ca3af"
                        />
                      </View>
                    </TouchableOpacity>
                  </>
                )}
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
                    {puedeEditarBeneficio && (
                      <TouchableOpacity
                        onPress={onOpenEditarBeneficio}
                        style={styles.editButton}
                      >
                        <Ionicons name="pencil" size={16} color="#3b82f6" />
                      </TouchableOpacity>
                    )}
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
                {puedeEditarPagos && (
                  <TouchableOpacity
                    onPress={onOpenRegistrarPago}
                    style={styles.sectionActionButton}
                  >
                    <Ionicons
                      name="add-circle"
                      size={20}
                      color={COLORES.violeta}
                    />
                    <Text style={styles.sectionActionText}>Registrar Pago</Text>
                  </TouchableOpacity>
                )}
              </View>
              {inscripcion.pagosRealizados &&
              inscripcion.pagosRealizados.length > 0 ? (
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
                        {inscripcion.tipoPagoElegido.tipo}
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
                {puedeEditarPuntos && (
                  <TouchableOpacity
                    onPress={onOpenAsignarPuntos}
                    style={styles.sectionActionButton}
                  >
                    <Ionicons name="add-circle" size={20} color="#f59e0b" />
                    <Text
                      style={[styles.sectionActionText, { color: "#f59e0b" }]}
                    >
                      Asignar Puntos
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.puntosContainer}>
                <Ionicons name="star" size={32} color="#f59e0b" />
                <Text style={styles.puntosText}>
                  {inscripcion.puntos || 0} puntos
                </Text>
              </View>
            </View>

            {/* Dar de Baja */}
            {puedeDarDeBaja && (
              <View style={styles.section}>
                <Button
                  title="Dar de Baja del Curso"
                  variant="outline"
                  onPress={() => {
                    onClose();
                    onDarDeBaja();
                  }}
                  style={{ width: "100%", borderColor: "#ef4444" }}
                />
              </View>
            )}
          </ScrollView>
          {alumno.adultoResponsable && (
            <AdultoResponsableModal
              visible={showAdultoResponsableModal}
              onClose={() => setShowAdultoResponsableModal(false)}
              adultoResponsable={alumno.adultoResponsable}
            />
          )}
        </View>
      </View>
    </Modal>
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
    maxHeight: Platform.select({
      web: "85vh" as any,
      ios: "90%",
      android: "90%",
      default: "90%",
    }),
    ...Platform.select({
      web: {
        borderRadius: 16,
        width: "100%",
        maxWidth: 600,
      },
      default: {
        width: "100%",
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
  dividerSmall: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  adultoResponsableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  adultoResponsableLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adultoResponsableLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#92400e",
  },
  adultoResponsableRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adultoResponsableName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#78350f",
  },
});
