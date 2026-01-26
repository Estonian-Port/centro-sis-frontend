// app/(tabs)/index.tsx - Dashboard Portería
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/authContext";
import { accesoService } from "@/services/acceso.service";
import { router } from "expo-router";

interface EstadisticasAcceso {
  totalHoy: number;
  totalEstaSemana: number;
  totalEsteMes: number;
  promedioDiario: number;
}

export default function DashboardPorteria() {
  const { usuario, selectedRole } = useAuth();
  const [estadisticas, setEstadisticas] = useState<EstadisticasAcceso | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    try {
      const stats = await accesoService.getEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEstadisticas();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Estadísticas */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>

        <View style={styles.statsGrid}>
          {/* Hoy */}
          <View style={[styles.statCard, styles.statCardToday]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="today" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{estadisticas?.totalHoy || 0}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>

          {/* Esta Semana */}
          <View style={[styles.statCard, styles.statCardWeek]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={28} color="#10b981" />
            </View>
            <Text style={styles.statValue}>
              {estadisticas?.totalEstaSemana || 0}
            </Text>
            <Text style={styles.statLabel}>Esta Semana</Text>
          </View>

          {/* Este Mes */}
          <View style={[styles.statCard, styles.statCardMonth]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar-outline" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>
              {estadisticas?.totalEsteMes || 0}
            </Text>
            <Text style={styles.statLabel}>Este Mes</Text>
          </View>

          {/* Promedio Diario */}
          <View style={[styles.statCard, styles.statCardAvg]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={28} color="#8b5cf6" />
            </View>
            <Text style={styles.statValue}>
              {estadisticas?.promedioDiario?.toFixed(1) || "0"}
            </Text>
            <Text style={styles.statLabel}>Promedio/día</Text>
          </View>
        </View>
      </View>

      {/* Botón Principal: Escanear QR */}
      <TouchableOpacity
        style={[styles.scanButton, { borderRadius: 12, marginBottom: 24 }]}
        onPress={() => router.push("/escanear-qr")}
        activeOpacity={0.8}
      >
        <View style={[styles.scanButtonContent, { padding: 14 }]}>
          <View
            style={[
              styles.scanIconContainer,
              { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
            ]}
          >
            <Ionicons name="qr-code-outline" size={32} color="#ffffff" />
          </View>
          <View style={styles.scanButtonText}>
            <Text
              style={[
                styles.scanButtonTitle,
                { fontSize: 16, marginBottom: 2 },
              ]}
            >
              Escanear QR
            </Text>
            <Text style={[styles.scanButtonSubtitle, { fontSize: 12 }]}>
              Registrar acceso de usuario
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#ffffff" />
        </View>
      </TouchableOpacity>

      {/* Acciones Rápidas */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="refresh" size={24} color="#10b981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Actualizar Estadísticas</Text>
            <Text style={styles.actionSubtitle}>Recargar datos actuales</Text>
          </View>
          {refreshing && <ActivityIndicator size="small" color="#10b981" />}
        </TouchableOpacity>
      </View>

      {/* Info adicional */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3b82f6" />
        <Text style={styles.infoText}>
          Deslizá hacia abajo para actualizar las estadísticas
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  // Botón Escanear
  scanButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  scanIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  scanButtonText: {
    flex: 1,
  },
  scanButtonTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  scanButtonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },

  // Estadísticas
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardToday: {
    borderColor: "#dbeafe",
  },
  statCardWeek: {
    borderColor: "#d1fae5",
  },
  statCardMonth: {
    borderColor: "#fef3c7",
  },
  statCardAvg: {
    borderColor: "#ede9fe",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },

  // Acciones Rápidas
  quickActions: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },

  // Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
});
