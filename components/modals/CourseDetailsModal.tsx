import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Card } from "../ui/Card";
import { CursoAlumno } from "@/model/model";
import { Button } from "../ui/Button";
import {
  formatDateToDDMMYYYY,
  estadoPagoToTagVariant,
  formatEstadoPago,
  formatEstadoCurso,
} from "@/helper/funciones";
import { Tag } from "../ui/Tag";

interface CourseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  curso: CursoAlumno;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  visible,
  onClose,
  curso,
}) => {
  const handleClose = () => {
    onClose();
  };

  if (!curso) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Cargando información...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.courseIcon}>
                <Ionicons name="school" size={24} color="#ffffff" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{curso.nombre}</Text>
                <Tag
                  label={formatEstadoPago(curso.estadoPago)}
                  variant={estadoPagoToTagVariant(curso.estadoPago)}
                />
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Información del Curso */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Curso</Text>
              <Card style={styles.infoCard}>
                <InfoRow label="Estado" value={formatEstadoCurso(curso.estado)} />
                <InfoRow
                  label="Fecha Inicio"
                  value={formatDateToDDMMYYYY(curso.fechaInicio)}
                />
                <InfoRow
                  label="Fecha Fin"
                  value={formatDateToDDMMYYYY(curso.fechaFin)}
                />
                <InfoRow
                  label="Mi Inscripción"
                  value={formatDateToDDMMYYYY(curso.fechaInscripcion)}
                />
              </Card>
            </View>

            {/* Profesores */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Profesores ({curso.profesores.length})
              </Text>
              <Card style={styles.infoCard}>
                {curso.profesores.map((profesor, index) => (
                  <View key={index} style={styles.profesorItem}>
                    <Ionicons
                      name="person-circle-outline"
                      size={20}
                      color="#3b82f6"
                    />
                    <View style={styles.profesorInfo}>
                      <Text style={styles.profesorName}>
                        {profesor.nombre} {profesor.apellido}
                      </Text>
                      <Text style={styles.profesorContact}>
                        {profesor.email}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>

            {/* Horarios */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Horarios ({curso.horarios.length})
              </Text>
              <Card style={styles.infoCard}>
                {curso.horarios.map((horario, index) => (
                  <View key={index} style={styles.horarioItem}>
                    <View style={styles.horarioDia}>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#10b981"
                      />
                      <Text style={styles.horarioDiaText}>{horario.dia}</Text>
                    </View>
                    <View style={styles.horarioHoras}>
                      <Ionicons name="time-outline" size={18} color="#6b7280" />
                      <Text style={styles.horarioHorasText}>
                        {horario.horaInicio} - {horario.horaFin}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>

            {/* Mi Asistencia */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mi Asistencia</Text>
              <Card style={styles.asistenciaCard}>
                <View style={styles.asistenciaContainer}>
                  <View style={styles.asistenciaBar}>
                    <View
                      style={[
                        styles.asistenciaProgress,
                        {
                          width: `${curso.porcentajeAsistencia || 0}%`,
                          backgroundColor:
                            (curso.porcentajeAsistencia || 0) >= 75
                              ? "#10b981"
                              : (curso.porcentajeAsistencia || 0) >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.asistenciaText}>
                    {curso.porcentajeAsistencia || 0}% de asistencia
                  </Text>
                </View>
              </Card>
            </View>

            {/* Mi Plan de Pago */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mi Plan de Pago</Text>
              <Card style={styles.infoCard}>
                <InfoRow
                  label="Modalidad"
                  value={curso.tipoPagoElegido.tipo}
                  valueStyle={styles.boldValue}
                />
                <InfoRow
                  label="Monto Base"
                  value={`$${curso.tipoPagoElegido.monto.toLocaleString()}`}
                  valueStyle={styles.greenValue}
                />
                {curso.beneficio > 0 && (
                  <InfoRow
                    label="Descuento"
                    value={`${curso.beneficio}%`}
                    valueStyle={styles.orangeValue}
                  />
                )}
                <InfoRow
                  label="Monto a Pagar"
                  value={`$${(
                    curso.tipoPagoElegido.monto *
                    (1 - curso.beneficio / 100)
                  ).toLocaleString()}`}
                  valueStyle={[styles.greenValue, styles.totalValue]}
                />
              </Card>
            </View>

            {/* Mis Pagos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Mis Pagos ({curso.pagosRealizados?.length || 0})
              </Text>
              {curso.pagosRealizados && curso.pagosRealizados.length > 0 ? (
                <View style={styles.pagosContainer}>
                  {curso.pagosRealizados.map((pago) => (
                    <View key={pago.id} style={styles.pagoItem}>
                      <View style={styles.pagoInfo}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10b981"
                        />
                        <View style={styles.pagoDetails}>
                          <Text style={styles.pagoMonto}>
                            ${pago.monto.toLocaleString()}
                          </Text>
                          <Text style={styles.pagoFecha}>
                            {formatDateToDDMMYYYY(pago.fecha)}
                          </Text>
                        </View>
                      </View>
                      {pago.beneficioAplicado && pago.beneficioAplicado > 0 && (
                        <View style={styles.descuentoBadge}>
                          <Text style={styles.descuentoText}>
                            -{pago.beneficioAplicado}%
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Card style={styles.emptyPayments}>
                  <Ionicons name="cash-outline" size={32} color="#d1d5db" />
                  <Text style={styles.emptyPaymentsText}>
                    No hay pagos registrados
                  </Text>
                </Card>
              )}
            </View>

            {/* Mis Puntos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sistema de Recompensas</Text>
              <Card style={styles.puntosCard}>
                <View style={styles.puntosContainer}>
                  <Ionicons name="star" size={40} color="#f59e0b" />
                  <View>
                    <Text style={styles.puntosText}>
                      {curso.puntos || 0} puntos
                    </Text>
                    <Text style={styles.puntosSubtext}>
                      Acumulados en este curso
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cerrar"
              variant="primary"
              onPress={handleClose}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Componente helper para filas de información
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
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  loadingContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    margin: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  courseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  closeButton: {
    padding: 4,
  },
  content: {
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
  infoCard: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
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
  totalValue: {
    fontSize: 16,
  },
  profesorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  profesorInfo: {
    flex: 1,
  },
  profesorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  profesorContact: {
    fontSize: 13,
    color: "#6b7280",
  },
  horarioItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  horarioDia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  horarioDiaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  horarioHoras: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  horarioHorasText: {
    fontSize: 14,
    color: "#6b7280",
  },
  asistenciaCard: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    padding: 20,
  },
  asistenciaContainer: {
    gap: 12,
  },
  asistenciaBar: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  asistenciaProgress: {
    height: "100%",
    borderRadius: 6,
  },
  asistenciaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  pagosContainer: {
    gap: 12,
  },
  pagoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86efac",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 2,
  },
  pagoFecha: {
    fontSize: 13,
    color: "#6b7280",
  },
  descuentoBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  descuentoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f59e0b",
  },
  emptyPayments: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  emptyPaymentsText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  puntosCard: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
    borderWidth: 1,
    padding: 20,
  },
  puntosContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  puntosText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f59e0b",
  },
  puntosSubtext: {
    fontSize: 13,
    color: "#92400e",
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
