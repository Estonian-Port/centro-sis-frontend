import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "../ui/Card";
import { Curso } from "@/model/model";
import { cursoService } from "@/services/curso.service";
import Toast from "react-native-toast-message";
import { Button } from "../ui/Button";

interface CourseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  cursoId: number;
  onNavigateToCourse?: (cursoId: number) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  visible,
  onClose,
  cursoId,
  onNavigateToCourse,
}) => {
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && cursoId) {
      fetchCourseDetails();
    }
  }, [visible, cursoId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const response = await cursoService.getById(cursoId);
      setCurso(response);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo obtener el curso.",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurso(null);
    onClose();
  };

  const handleCourseClick = (cursoId: string) => {
    onClose();
    if (onNavigateToCourse) {
      onNavigateToCourse(Number(cursoId));
    }
  };

  if (!curso) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{curso.nombre}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Información General */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información General</Text>
              <Card style={styles.infoCard}>
                <InfoRow label="Estado" value={curso.estado} />
                <InfoRow label="Fecha Inicio" value={curso.fechaInicio} />
                <InfoRow label="Fecha Fin" value={curso.fechaFin} />
                <InfoRow
                  label="Alumnos Inscriptos"
                  value={`${curso.alumnosInscriptos.length} ${
                    curso.alumnosInscriptos.length === 1 ? "alumno" : "alumnos"
                  }`}
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
                    <Text style={styles.profesorName}>{profesor}</Text>
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

            {/* Tipos de Pago */}
            {curso.tiposPago && curso.tiposPago.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Modalidades de Pago ({curso.tiposPago.length})
                </Text>
                <Card style={styles.infoCard}>
                  {curso.tiposPago.map((tipoPago, index) => (
                    <View key={index} style={styles.tipoPagoItem}>
                      <View style={styles.tipoPagoHeader}>
                        <Ionicons
                          name="cash-outline"
                          size={18}
                          color="#f59e0b"
                        />
                        <Text style={styles.tipoPagoTipo}>{tipoPago.tipo}</Text>
                      </View>
                      <Text style={styles.tipoPagoMonto}>
                        ${tipoPago.monto.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </Card>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Ir al curso"
              variant="primary"
              onPress={() => {
                handleCourseClick(curso.id.toString());
              }}
              style={styles.footerButton}
            />
            <Button
              title="Cerrar"
              variant="outline"
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
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

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
    borderRadius: 12,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
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
    fontWeight: "500",
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  profesorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  profesorName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
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
  tipoPagoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tipoPagoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipoPagoTipo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  tipoPagoMonto: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
