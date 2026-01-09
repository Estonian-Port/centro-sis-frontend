// app/curso/[cursoId]/informacion.tsx
import { Curso } from "@/model/model";
import { cursoService } from "@/services/curso.service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";

export default function InformacionTab() {
  const { cursoId } = useLocalSearchParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!curso) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró el curso</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
            value={`${curso.inscripciones?.length || 0}`}
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
              <Ionicons name="person-circle-outline" size={20} color="#3b82f6" />
              <Text style={styles.listItemText}>{profesor}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Horarios */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={24} color="#8b5cf6" />
          <Text style={styles.cardTitle}>Horarios ({curso.horarios.length})</Text>
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
    </ScrollView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    padding: 16,
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
});