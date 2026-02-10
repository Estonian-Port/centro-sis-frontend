// app/curso/[cursoId]/asistencias.tsx
import { AsistenciaItem } from "@/components/curso/AsistenciaItem";
import { TomarAsistenciaModal } from "@/components/curso/modals/TomarAsistenciaModal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/authContext";
import { getErrorMessage } from "@/helper/auth.interceptor";
import { Curso, ParteAsistencia, Rol } from "@/model/model";
import { cursoService } from "@/services/curso.service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AsistenciasTab() {
  const { cursoId } = useLocalSearchParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [partesAsistencia, setPartesAsistencias] = useState<ParteAsistencia[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { selectedRole, usuario } = useAuth();

  useEffect(() => {
    fetchData();
  }, [cursoId]);

  const fetchData = async () => {
    if (!cursoId) return;

    setLoading(true);
    try {
      const cursoData = await cursoService.getById(Number(cursoId));
      setCurso(cursoData);

      const partesAsistenciaData = await cursoService.obtenerPartesAsistencias(
        Number(cursoId),
      );
      setPartesAsistencias(partesAsistenciaData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron cargar los partes de asistencia",
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

  if (!usuario) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Usuario no autenticado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Estadísticas Generales */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{partesAsistencia.length}</Text>
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
            {partesAsistencia.length > 0
              ? Math.round(
                  (partesAsistencia.reduce(
                    (sum, a) => sum + a.presentes.length,
                    0,
                  ) /
                    (partesAsistencia.length *
                      (curso.inscripciones?.length || 1))) *
                    100,
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
        onPress={() => setModalVisible(true)}
        disabled={
          curso?.estado !== "EN_CURSO" ||
          !(selectedRole === Rol.ADMINISTRADOR || selectedRole === Rol.PROFESOR)
        }
        style={styles.tomarAsistenciaButton}
      />

      {/* Historial de Asistencias */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Historial de Asistencias</Text>

        {partesAsistencia.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>
              No hay partes de asistencia registradas
            </Text>
            <Text style={styles.emptyStateText}>
              Los partes de asistencia tomados aparecerán aquí
            </Text>
          </View>
        ) : (
          partesAsistencia.map((p) => <AsistenciaItem key={p.id} parte={p} />)
        )}
      </View>
      <TomarAsistenciaModal
        cursoId={Number(cursoId)}
        usuarioId={usuario.id}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cursoNombre={curso.nombre}
        onConfirmar={async () => {
          await fetchData();
          setModalVisible(false);
        }}
        yaSeTomoHoy={partesAsistencia.some((a) => {
          const hoy = new Date();
          const fechaHoy = `${hoy.getFullYear()}-${String(
            hoy.getMonth() + 1,
          ).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
          const resultado = a.fecha === fechaHoy;
          return resultado;
        })}
      />
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
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
