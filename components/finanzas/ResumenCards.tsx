// components/finanzas/ResumenCards.tsx

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResumenFinanciero } from "@/services/reporte-financiero.service";

interface ResumenCardsProps {
  resumen: ResumenFinanciero;
}

export const ResumenCards: React.FC<ResumenCardsProps> = ({ resumen }) => {
  
  const formatMonto = (monto: number): string => {
    return `$ ${monto.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatPorcentaje = (porcentaje: number | null): string => {
    if (porcentaje === null) return "";
    const signo = porcentaje >= 0 ? "+" : "";
    return `${signo}${porcentaje.toFixed(1)}%`;
  };

  const getColorPorcentaje = (porcentaje: number | null, invertir: boolean = false): string => {
    if (porcentaje === null) return "#6b7280";
    const esPositivo = invertir ? porcentaje < 0 : porcentaje > 0;
    return esPositivo ? "#10b981" : "#ef4444";
  };

  return (
    <View style={styles.container}>
      {/* Card Ingresos */}
      <View style={[styles.card, styles.cardIngresos]}>
        <View style={styles.iconContainer}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
        </View>
        <Text style={styles.cardLabel}>Ingresos</Text>
        <Text style={styles.cardMonto}>{formatMonto(resumen.totalIngresos)}</Text>
        {resumen.porcentajeCambioIngresos !== null && (
          <View style={styles.cambioContainer}>
            <Ionicons 
              name={resumen.porcentajeCambioIngresos >= 0 ? "arrow-up" : "arrow-down"} 
              size={14} 
              color={getColorPorcentaje(resumen.porcentajeCambioIngresos)} 
            />
            <Text style={[
              styles.cambioText, 
              { color: getColorPorcentaje(resumen.porcentajeCambioIngresos) }
            ]}>
              {formatPorcentaje(resumen.porcentajeCambioIngresos)}
            </Text>
          </View>
        )}
      </View>

      {/* Card Egresos */}
      <View style={[styles.card, styles.cardEgresos]}>
        <View style={styles.iconContainer}>
          <Ionicons name="trending-down" size={24} color="#ef4444" />
        </View>
        <Text style={styles.cardLabel}>Egresos</Text>
        <Text style={styles.cardMonto}>{formatMonto(resumen.totalEgresos)}</Text>
        {resumen.porcentajeCambioEgresos !== null && (
          <View style={styles.cambioContainer}>
            <Ionicons 
              name={resumen.porcentajeCambioEgresos >= 0 ? "arrow-up" : "arrow-down"} 
              size={14} 
              color={getColorPorcentaje(resumen.porcentajeCambioEgresos, true)} 
            />
            <Text style={[
              styles.cambioText, 
              { color: getColorPorcentaje(resumen.porcentajeCambioEgresos, true) }
            ]}>
              {formatPorcentaje(resumen.porcentajeCambioEgresos)}
            </Text>
          </View>
        )}
      </View>

      {/* Card Balance */}
      <View style={[styles.card, styles.cardBalance]}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={resumen.balance >= 0 ? "cash" : "alert-circle"} 
            size={24} 
            color={resumen.balance >= 0 ? "#3b82f6" : "#f59e0b"} 
          />
        </View>
        <Text style={styles.cardLabel}>Balance</Text>
        <Text style={[
          styles.cardMonto,
          { color: resumen.balance >= 0 ? "#10b981" : "#ef4444" }
        ]}>
          {formatMonto(resumen.balance)}
        </Text>
        <View style={styles.estadoContainer}>
          <View style={[
            styles.estadoBadge,
            { backgroundColor: resumen.balance >= 0 ? "#d1fae5" : "#fee2e2" }
          ]}>
            <Text style={[
              styles.estadoText,
              { color: resumen.balance >= 0 ? "#065f46" : "#991b1b" }
            ]}>
              {resumen.balance >= 0 ? "✓ Positivo" : "⚠ Negativo"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 200 : "47%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }
    })
  },
  cardIngresos: {
    borderColor: "#d1fae5",
  },
  cardEgresos: {
    borderColor: "#fecaca",
  },
  cardBalance: {
    borderColor: "#bfdbfe",
  },
  iconContainer: {
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 8,
  },
  cardMonto: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  cambioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cambioText: {
    fontSize: 13,
    fontWeight: "600",
  },
  estadoContainer: {
    marginTop: 4,
  },
  estadoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: "600",
  }
});