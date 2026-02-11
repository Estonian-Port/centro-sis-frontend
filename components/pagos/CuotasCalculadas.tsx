// components/pagos/CuotasCalculadas.tsx - NUEVO CÁLCULO CON UMBRAL 15 DÍAS

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { calcularCuotas, calcularDuracionEnTexto, tieneCuotaAdicional } from "@/util/calcularCuotas";

interface CuotasCalculadasProps {
  fechaInicio: Date | null;
  fechaFin: Date | null;
  label?: string;
  helpText?: string;
}

export const CuotasCalculadas: React.FC<CuotasCalculadasProps> = ({
  fechaInicio,
  fechaFin,
  label = "Cuotas",
  helpText = "Calculadas automáticamente según la duración del curso"
}) => {
  const cuotas = calcularCuotas(fechaInicio, fechaFin);
  const hayCuotaAdicional = fechaInicio && fechaFin ? tieneCuotaAdicional(fechaInicio, fechaFin) : false;

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Valor calculado */}
      <View style={styles.valueContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="calculator-outline" size={20} color="#8b5cf6" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.value}>
            {cuotas} {cuotas === 1 ? "cuota" : "cuotas"}
          </Text>
          
          {fechaInicio && fechaFin && (
            <Text style={styles.helpText}>
              {helpText}
            </Text>
          )}
        </View>
      </View>

      {/* ✅ Aclaración de cuota adicional */}
      {hayCuotaAdicional && (
        <View style={styles.additionalInfoContainer}>
          <Ionicons name="add-circle" size={16} color="#8b5cf6" />
          <Text style={styles.additionalInfoText}>
            Se cobra una cuota adicional porque el curso supera los 15 días adicionales
          </Text>
        </View>
      )}

      {/* Info adicional */}
      {!fechaInicio || !fechaFin ? (
        <View style={styles.warningContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#f59e0b" />
          <Text style={styles.warningText}>
            Selecciona las fechas del curso para calcular las cuotas
          </Text>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
          <Text style={styles.infoText}>
            Duración: {calcularDuracionEnTexto(fechaInicio, fechaFin)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  helpText: {
    fontSize: 12,
    color: "#6b7280",
  },
  // ✅ NUEVO: Banner de cuota adicional
  additionalInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#faf5ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9d5ff",
    gap: 8,
  },
  additionalInfoText: {
    fontSize: 12,
    color: "#7c3aed",
    fontWeight: "500",
    flex: 1,
    lineHeight: 16,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  warningText: {
    fontSize: 12,
    color: "#f59e0b",
    marginLeft: 6,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#10b981",
    marginLeft: 6,
    fontWeight: "500",
  },
});