// components/pagos/PagoItem.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { PagoDisplay, formatConcepto } from "@/model/model";

interface PagoItemProps {
  pago: PagoDisplay;
}

export const PagoItem: React.FC<PagoItemProps> = ({ pago }) => {
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getConceptoColor = (concepto: string) => {
    switch (concepto) {
      case "CURSO":
        return "#3b82f6"; // Azul
      case "ALQUILER":
        return "#f59e0b"; // Naranja
      case "COMISION":
        return "#10b981"; // Verde
      default:
        return "#6b7280";
    }
  };

  const getConceptoIcon = (concepto: string) => {
    switch (concepto) {
      case "CURSO":
        return "school-outline";
      case "ALQUILER":
        return "home-outline";
      case "COMISION":
        return "cash-outline";
      default:
        return "card-outline";
    }
  };

  return (
    <View style={[styles.container, !pago.estaActivo && styles.containerInactivo]}>
      {/* Header con concepto y fecha */}
      <View style={styles.header}>
        <View style={styles.conceptoContainer}>
          <View
            style={[
              styles.conceptoIcon,
              { backgroundColor: `${getConceptoColor(pago.concepto)}15` },
            ]}
          >
            <Ionicons
              name={getConceptoIcon(pago.concepto) as any}
              size={20}
              color={getConceptoColor(pago.concepto)}
            />
          </View>
          <View>
            <Text style={styles.conceptoText}>
              {formatConcepto(pago.concepto)}
            </Text>
            <Text style={styles.cursoText}>{pago.curso}</Text>
          </View>
        </View>
        <Text style={styles.fecha}>{formatFecha(pago.fecha)}</Text>
      </View>

      {/* Monto principal */}
      <View style={styles.montoSection}>
        <Text style={styles.montoLabel}>Monto</Text>
        <Text style={styles.montoValue}>
          ${pago.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Info adicional */}
      <View style={styles.infoGrid}>
        {/* Usuario que pagó */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pagó</Text>
          <Text style={styles.infoValue}>{pago.usuarioPago}</Text>
        </View>

        {/* Usuario que recibió */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Recibió</Text>
          <Text style={styles.infoValue}>{pago.usuarioRecibe}</Text>
        </View>

        {/* Medio de pago */}
        {pago.medioPago && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Medio de pago</Text>
            <Text style={styles.infoValue}>{pago.medioPago}</Text>
          </View>
        )}

        {/* Beneficio (solo si existe) */}
        {pago.beneficio !== undefined && pago.beneficio > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Beneficio</Text>
            <Text style={[styles.infoValue, styles.beneficioText]}>
              {pago.beneficio}% de descuento
            </Text>
          </View>
        )}

        {/* Retraso (solo si existe) */}
        {pago.retraso && (
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={[styles.infoValue, styles.retrasoText]}>
              Con recargo por retraso
            </Text>
          </View>
        )}
      </View>

      {/* Badge de estado */}
      {!pago.estaActivo && (
        <View style={styles.anulado}>
          <Ionicons name="close-circle" size={16} color="#ef4444" />
          <Text style={styles.anuladoText}>ANULADO</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  containerInactivo: {
    opacity: 0.6,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  conceptoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  conceptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  conceptoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  cursoText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  fecha: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  montoSection: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  montoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  montoValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10b981",
  },
  infoGrid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    width: 80,
  },
  infoValue: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "500",
    flex: 1,
  },
  beneficioText: {
    color: "#f59e0b",
  },
  retrasoText: {
    color: "#ef4444",
  },
  anulado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#fee2e2",
  },
  anuladoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ef4444",
  },
});