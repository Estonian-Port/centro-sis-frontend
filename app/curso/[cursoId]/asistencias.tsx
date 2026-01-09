// app/curso/[cursoId]/asistencias.tsx
import { AsistenciaItem } from "@/components/curso/AsistenciaItem";
import { Button } from "@/components/ui/Button";
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
} from "react-native";
import Toast from "react-native-toast-message";

// TODO: Crear modelo Asistencia en model.ts
interface Asistencia {
  id: number;
  fecha: string;
  presentes: Array<{ id: number; nombre: string; apellido: string }>;
  ausentes: Array<{ id: number; nombre: string; apellido: string }>;
}

export default function AsistenciasTab() {
  const { cursoId } = useLocalSearchParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [cursoId]);

  const fetchData = async () => {
    if (!cursoId) return;

    setLoading(true);
    try {
      // Cargar curso
      const cursoData = await cursoService.getById(Number(cursoId));
      setCurso(cursoData);

      // TODO: Cargar asistencias desde el backend
      // const asistenciasData = await asistenciaService.getByCursoId(Number(cursoId));
      // setAsistencias(asistenciasData);

      // Datos de ejemplo mientras tanto
      setAsistencias([
        {
          id: 1,
          fecha: "2025-01-08",
          presentes: [
            { id: 1, nombre: "Juan", apellido: "Pérez" },
            { id: 2, nombre: "María", apellido: "García" },
            { id: 3, nombre: "Carlos", apellido: "López" },
          ],
          ausentes: [
            { id: 4, nombre: "Ana", apellido: "Martínez" },
          ],
        },
        {
          id: 2,
          fecha: "2025-01-06",
          presentes: [
            { id: 1, nombre: "Juan", apellido: "Pérez" },
            { id: 2, nombre: "María", apellido: "García" },
            { id: 4, nombre: "Ana", apellido: "Martínez" },
          ],
          ausentes: [
            { id: 3, nombre: "Carlos", apellido: "López" },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar las asistencias",
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
      {/* Estadísticas Generales */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{asistencias.length}</Text>
          <Text style={styles.statLabel}>Clases dictadas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={24} color="#10b981" />
          <Text style={styles.statValue}>
            {curso.inscripciones?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Alumnos inscriptos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>
            {asistencias.length > 0
              ? Math.round(
                  (asistencias.reduce(
                    (sum, a) => sum + a.presentes.length,
                    0
                  ) /
                    (asistencias.length *
                      (curso.inscripciones?.length || 1))) *
                    100
                )
              : 0}
            %
          </Text>
          <Text style={styles.statLabel}>Promedio asistencia</Text>
        </View>
      </View>

      {/* Botón Tomar Asistencia */}
      <Button
        title="Tomar Asistencia"
        variant="primary"
        onPress={() => {
          Toast.show({
            type: "info",
            text1: "Funcionalidad en desarrollo",
            position: "bottom",
          });
        }}
        disabled={curso?.estado !== "EN_CURSO"}
        style={styles.tomarAsistenciaButton}
      />

      {/* Historial de Asistencias */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Historial de Asistencias</Text>

        {asistencias.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>
              No hay asistencias registradas
            </Text>
            <Text style={styles.emptyStateText}>
              Las asistencias tomadas aparecerán aquí
            </Text>
          </View>
        ) : (
          asistencias.map((asistencia) => (
            <AsistenciaItem key={asistencia.id} asistencia={asistencia} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

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
  tomarAsistenciaButton: {
    width: "100%",
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 12,
  },
  historySection: {
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 48,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyStateTitle: {
    fontSize: 18,
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
});