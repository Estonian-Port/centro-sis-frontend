import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { accesoService } from "@/services/acceso.service";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TIPOGRAFIA } from "@/util/tipografia";
import { COLORES } from "@/util/colores";
import { EventBus } from "@/util/EventBus";
import { EstadisticasAcceso } from "@/model/model";
import { RegistrarInvitadoModal } from "../accesos/RegistrarInvitadoModal";
import { useAuth } from "@/context/authContext";
import Toast from "react-native-toast-message";
import { getErrorMessage } from "@/helper/auth.interceptor";
 
export default function DashboardPorteria() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasAcceso | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showInvitadoModal, setShowInvitadoModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { usuario } = useAuth();
 
  const [showConfirmarTurno, setShowConfirmarTurno] = useState(false);
  const [registrandoTurno, setRegistrandoTurno] = useState(false);
 
  useEffect(() => {
    loadEstadisticas();
  }, []);
 
  useEffect(() => {
    const handler = () => {
      loadEstadisticas();
    };
    EventBus.on("accesoRegistrado", handler);
    return () => EventBus.off("accesoRegistrado", handler);
  }, []);
 
  const loadEstadisticas = async () => {
    if (!usuario) return;

    try {
      const stats = await accesoService.getEstadisticas(usuario.id);
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
 
  const handleComenzarTurno = async () => {
    if (!usuario) return;
 
    setRegistrandoTurno(true);
    try {
      await accesoService.comenzarTurno(usuario.id);
      
      Toast.show({
        type: "success",
        text1: "✅ Turno registrado",
        text2: `Bienvenido/a ${usuario.nombre}`,
        position: "bottom",
        visibilityTime: 3000,
      });
 
      setShowConfirmarTurno(false);
      loadEstadisticas();
      EventBus.emit("accesoRegistrado");
    } catch (error) {
      console.error("Error al comenzar turno:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo registrar el turno",
        position: "bottom",
      });
    } finally {
      setRegistrandoTurno(false);
    }
  };
 
  // ✅ NUEVO: Formatear hora del turno
  const formatearHoraTurno = (isoString: string) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <View style={styles.statsGrid}>
            {/* Hoy */}
            <View style={[styles.statCard, styles.statCardToday]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="today" size={28} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>
                {estadisticas?.totalHoy || 0}
              </Text>
              <Text style={styles.statLabel}>Hoy</Text>
            </View>
 
            {/* Última Semana */}
            <View style={[styles.statCard, styles.statCardWeek]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar" size={28} color="#10b981" />
              </View>
              <Text style={styles.statValue}>
                {estadisticas?.totalSemana || 0}
              </Text>
              <Text style={styles.statLabel}>Última Semana</Text>
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
 
        {/* Botón Comenzar Turno */}
        <TouchableOpacity
          style={styles.turnoButton}
          onPress={() => setShowConfirmarTurno(true)}
          activeOpacity={0.8}
        >
          <View style={styles.turnoButtonContent}>
            <View style={styles.turnoIconContainer}>
              <Ionicons name="time-outline" size={28} color="#ffffff" />
            </View>
            <View style={styles.turnoButtonText}>
              <Text style={styles.turnoButtonTitle}>Comenzar Turno</Text>
              <Text style={styles.turnoButtonSubtitle}>
                Registrar inicio de jornada
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#ffffff" />
          </View>
        </TouchableOpacity>
 
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
 
        {/* Botón Registrar Invitado */}
        <TouchableOpacity
          style={styles.invitadoButton}
          onPress={() => setShowInvitadoModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.invitadoButtonContent}>
            <View style={styles.invitadoIconContainer}>
              <Ionicons name="person-add" size={28} color="#ffffff" />
            </View>
            <View style={styles.invitadoButtonText}>
              <Text style={styles.invitadoButtonTitle}>Registrar Invitado</Text>
              <Text style={styles.invitadoButtonSubtitle}>
                Clase de prueba o visitante
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </ScrollView>
 
      <RegistrarInvitadoModal
        visible={showInvitadoModal}
        onClose={() => setShowInvitadoModal(false)}
        registradoPorId={usuario?.id || 0}
        onRegistroExitoso={() => {
          loadEstadisticas();
          EventBus.emit("accesoRegistrado");
        }}
      />
 
      <Modal
        visible={showConfirmarTurno}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmarTurno(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icono */}
            <View style={styles.modalIconContainer}>
              <Ionicons name="time" size={56} color="#8b5cf6" />
            </View>
 
            {/* Título */}
            <Text style={styles.modalTitle}>Comenzar Turno</Text>
 
            {/* AVISO SI YA REGISTRÓ HOY */}
            {estadisticas?.turnoRegistradoHoy && estadisticas.horaTurnoHoy && (
              <View style={styles.avisoTurnoRegistrado}>
                <Ionicons name="information-circle" size={20} color="#f59e0b" />
                <Text style={styles.avisoTurnoText}>
                  Ya registraste un turno hoy. Último registro a las{" "}
                  {formatearHoraTurno(estadisticas.horaTurnoHoy)}
                </Text>
              </View>
            )}
 
            {/* Mensaje */}
            <Text style={styles.modalMessage}>
              {estadisticas?.turnoRegistradoHoy
                ? "¿Querés registrar otro inicio de turno?"
                : "¿Confirmas que querés registrar el inicio de tu turno?"}
            </Text>
 
            {/* Info del usuario */}
            {usuario && (
              <View style={styles.modalUserInfo}>
                <Ionicons name="person-circle" size={20} color="#6b7280" />
                <Text style={styles.modalUserText}>
                  {usuario.nombre} {usuario.apellido}
                </Text>
              </View>
            )}
 
            {/* Hora actual */}
            <View style={styles.modalTimeInfo}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.modalTimeText}>
                {new Date().toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
 
            {/* Botones */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowConfirmarTurno(false)}
                disabled={registrandoTurno}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
 
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleComenzarTurno}
                disabled={registrandoTurno}
              >
                {registrandoTurno ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#ffffff" />
                    <Text style={styles.modalButtonConfirmText}>
                      {estadisticas?.turnoRegistradoHoy ? "Registrar Otro" : "Confirmar"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  turnoButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  turnoButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  turnoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  turnoButtonText: {
    flex: 1,
  },
  turnoButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  turnoButtonSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },

  // Botón Escanear
  scanButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    marginBottom: 16,
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
    ...TIPOGRAFIA.titleL,
    color: COLORES.textPrimary,
    marginBottom: 20,
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
  invitadoButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  invitadoButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  invitadoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  invitadoButtonText: {
    flex: 1,
  },
  invitadoButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  invitadoButtonSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  modalIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f3f0ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  modalUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalUserText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  modalTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
  },
  modalTimeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
  },
  modalButtonCancel: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  modalButtonConfirm: {
    backgroundColor: "#8b5cf6",
  },
  modalButtonConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
    avisoTurnoRegistrado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  avisoTurnoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#92400e",
    lineHeight: 18,
  },
});