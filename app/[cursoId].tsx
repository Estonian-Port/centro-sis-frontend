// app/curso/[cursoId].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alumno, Curso, Usuario } from "@/model/model";
import { cursoService } from "@/services/curso.service";
import Toast from "react-native-toast-message";
import { Button } from "@/components/ui/Button";
import { COLORES } from "@/util/colores";

type Tab = "informacion" | "alumnos";

export default function CursoDetalle() {
  const { cursoId } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("alumnos");

  useEffect(() => {
    fetchCurso();
  }, [cursoId]);

  const fetchCurso = async () => {
    if (!cursoId) return;

    setLoading(true);
    try {
      const response = await cursoService.getById(Number(cursoId));
      setCurso(response);
    } catch (error) {
      console.error("Error fetching curso:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cargar el curso",
        position: "bottom",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando curso...</Text>
      </SafeAreaView>
    );
  }

  if (!curso) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>No se encontró el curso</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {curso.nombre}
          </Text>
          <View style={styles.headerMeta}>
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text style={styles.headerMetaText}>
              {curso.alumnosInscriptos.length}{" "}
              {curso.alumnosInscriptos.length === 1 ? "alumno" : "alumnos"}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "alumnos" && styles.tabActive]}
          onPress={() => setActiveTab("alumnos")}
        >
          <Ionicons
            name="people-outline"
            size={20}
            color={activeTab === "alumnos" ? COLORES.cobre : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "alumnos" && styles.tabTextActive,
            ]}
          >
            Alumnos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "informacion" && styles.tabActive]}
          onPress={() => setActiveTab("informacion")}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={activeTab === "informacion" ? COLORES.cobre : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "informacion" && styles.tabTextActive,
            ]}
          >
            Información
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === "informacion" ? (
          <InformacionTab curso={curso} />
        ) : (
          <AlumnosTab curso={curso} onRefresh={fetchCurso} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== TAB: INFORMACIÓN ====================
interface InformacionTabProps {
  curso: Curso;
}

const InformacionTab: React.FC<InformacionTabProps> = ({ curso }) => {
  return (
    <View style={styles.tabContent}>
      {/* Información General */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>Información General</Text>
        </View>
        <View style={styles.cardContent}>
          <InfoRow label="Estado" value={curso.estado} />
          <InfoRow label="Fecha Inicio" value={curso.fechaInicio} />
          <InfoRow label="Fecha Fin" value={curso.fechaFin} />
          <InfoRow
            label="Alumnos Inscriptos"
            value={`${curso.alumnosInscriptos.length}`}
          />
        </View>
      </View>

      {/* Profesores */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="school" size={24} color="#10b981" />
          <Text style={styles.cardTitle}>
            Profesores ({curso.profesores.length})
          </Text>
        </View>
        <View style={styles.cardContent}>
          {curso.profesores.map((profesor, index) => (
            <View
              key={index}
              style={[
                styles.listItem,
                index === curso.profesores.length - 1 && styles.listItemLast,
              ]}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color="#3b82f6"
              />
              <Text style={styles.listItemText}>{profesor}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Horarios */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={24} color="#8b5cf6" />
          <Text style={styles.cardTitle}>
            Horarios ({curso.horarios.length})
          </Text>
        </View>
        <View style={styles.cardContent}>
          {curso.horarios.map((horario, index) => (
            <View
              key={index}
              style={[
                styles.horarioItem,
                index === curso.horarios.length - 1 && styles.listItemLast,
              ]}
            >
              <View style={styles.horarioDia}>
                <Ionicons name="calendar-outline" size={18} color="#10b981" />
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
        </View>
      </View>

      {/* Tipos de Pago */}
      {curso.tiposPago && curso.tiposPago.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash" size={24} color="#f59e0b" />
            <Text style={styles.cardTitle}>
              Modalidades de Pago ({curso.tiposPago.length})
            </Text>
          </View>
          <View style={styles.cardContent}>
            {curso.tiposPago.map((tipoPago, index) => (
              <View
                key={index}
                style={[
                  styles.tipoPagoItem,
                  index === curso.tiposPago!.length - 1 && styles.listItemLast,
                ]}
              >
                <View style={styles.tipoPagoInfo}>
                  <Ionicons name="cash-outline" size={18} color="#f59e0b" />
                  <Text style={styles.tipoPagoTipo}>{tipoPago.tipo}</Text>
                </View>
                <Text style={styles.tipoPagoMonto}>
                  ${tipoPago.monto.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// ==================== TAB: ALUMNOS ====================
interface AlumnosTabProps {
  curso: Curso;
  onRefresh: () => void;
}

const AlumnosTab: React.FC<AlumnosTabProps> = ({ curso, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const alumnos: Alumno[] = curso.alumnosInscriptos; 

  const handleAddAlumno = () => {
    setShowAddModal(true);
    // TODO: Implementar modal de agregar alumno
  };

  const handleRemoveAlumno = (alumnoId: number) => {
    // TODO: Implementar eliminar alumno
    Toast.show({
      type: "info",
      text1: "Funcionalidad en desarrollo",
      position: "bottom",
    });
  };

  const handleRegistrarPago = (alumnoId: number) => {
    // TODO: Implementar registrar pago
    Toast.show({
      type: "info",
      text1: "Funcionalidad en desarrollo",
      position: "bottom",
    });
  };

  const handleAsignarPuntos = (alumnoId: number) => {
    // TODO: Implementar asignar puntos
    Toast.show({
      type: "info",
      text1: "Funcionalidad en desarrollo",
      position: "bottom",
    });
  };

  return (
    <View style={styles.tabContent}>
      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <Button
          title="Agregar Alumno"
          variant="primary"
          onPress={handleAddAlumno}
        />
      </View>

      {/* Alumnos List */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="people" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>
            Alumnos Inscriptos ({curso.alumnosInscriptos.length})
          </Text>
        </View>

        {alumnos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-add-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>
              No hay alumnos inscriptos
            </Text>
            <Text style={styles.emptyStateText}>
              Comienza agregando alumnos a este curso
            </Text>
          </View>
        ) : (
          <View style={styles.cardContent}>
            {alumnos.map((alumno, index) => (
              <View
                key={alumno.id}
                style={[
                  styles.alumnoItem,
                  index === alumnos.length - 1 && styles.listItemLast,
                ]}
              >
                {/* Alumno Info */}
                <View style={styles.alumnoInfo}>
                  <View style={styles.alumnoAvatar}>
                    <Ionicons name="person" size={24} color="#ffffff" />
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

                {/* Actions */}
                <View style={styles.alumnoActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonGreen]}
                    onPress={() => handleRegistrarPago(alumno.id)}
                  >
                    <Ionicons name="cash-outline" size={18} color="#10b981" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonYellow]}
                    onPress={() => handleAsignarPuntos(alumno.id)}
                  >
                    <Ionicons name="star-outline" size={18} color="#f59e0b" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonRed]}
                    onPress={() => handleRemoveAlumno(alumno.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ==================== COMPONENTS ====================
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerMetaText: {
    fontSize: 14,
    color: "#6b7280",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: COLORES.cobre,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabTextActive: {
    color: COLORES.cobre,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemText: {
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
  tipoPagoInfo: {
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
  actionsBar: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 48,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  alumnoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
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
  alumnoDetails: {
    flex: 1,
  },
  alumnoName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
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
  alumnoActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonGreen: {
    backgroundColor: "#d1fae5",
  },
  actionButtonYellow: {
    backgroundColor: "#fef3c7",
  },
  actionButtonRed: {
    backgroundColor: "#fee2e2",
  },
});
