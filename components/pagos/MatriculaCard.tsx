// components/pagos/MatriculaCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { EstadoMatricula } from "@/model/model";
import { pagoService } from "@/services/pago.service";
import { getErrorMessage } from "@/helper/auth.interceptor";
import { RegistrarMatriculaModal } from "@/components/modals/RegistrarMatriculaModal";

interface MatriculaCardProps {
  alumnoId: number; // id del usuario alumno
  usuarioId: number; // id del usuario logueado (quien registra)
  canRegister: boolean; // admin/oficina
  anio?: number; // por defecto el año actual
}

export const MatriculaCard: React.FC<MatriculaCardProps> = ({
  alumnoId,
  usuarioId,
  canRegister,
  anio,
}) => {
  const [estado, setEstado] = useState<EstadoMatricula | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrar, setShowRegistrar] = useState(false);

  const fetchEstado = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pagoService.getEstadoMatricula(alumnoId, anio);
      setEstado(data);
    } catch (e) {
      setError(getErrorMessage(e) || "No se pudo cargar la matrícula");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstado();
  }, [alumnoId, anio]);

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "";
    const [y, m, d] = fecha.split("-");
    return `${d}/${m}/${y}`;
  };

  const anioMostrado = estado?.anio ?? anio ?? new Date().getFullYear();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="ribbon-outline" size={20} color="#8b5cf6" />
        <Text style={styles.sectionTitle}>Matrícula {anioMostrado}</Text>
      </View>

      <Card style={styles.card}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : estado ? (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Estado</Text>
              <Tag
                label={estado.pagada ? "Pagada" : "Pendiente"}
                variant={estado.pagada ? "success" : "warning"}
              />
            </View>

            {estado.monto != null && (
              <View style={styles.statusRow}>
                <Text style={styles.label}>Monto</Text>
                <Text style={styles.value}>
                  ${estado.monto.toLocaleString("es-AR")}
                </Text>
              </View>
            )}

            {estado.pagada && estado.fechaPago && (
              <View style={styles.statusRow}>
                <Text style={styles.label}>Fecha de pago</Text>
                <Text style={styles.value}>
                  {formatFecha(estado.fechaPago)}
                </Text>
              </View>
            )}

            {canRegister && !estado.pagada && (
              <Button
                title="Registrar matrícula"
                variant="primary"
                onPress={() => setShowRegistrar(true)}
                style={styles.registrarButton}
              />
            )}
          </>
        ) : null}
      </Card>

      <RegistrarMatriculaModal
        visible={showRegistrar}
        onClose={() => setShowRegistrar(false)}
        usuarioId={usuarioId}
        alumnoId={alumnoId}
        anio={anioMostrado}
        onMatriculaRegistrada={fetchEstado}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  card: {
    backgroundColor: "#faf5ff",
    borderColor: "#8b5cf6",
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  registrarButton: {
    marginTop: 4,
    backgroundColor: "#8b5cf6",
  },
});
