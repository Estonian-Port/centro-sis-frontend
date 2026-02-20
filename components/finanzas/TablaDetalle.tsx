// components/finanzas/TablaDetalle.tsx

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { 
  DetalleIngresos, 
  DetalleEgresos,
  ConceptoFinanciero 
} from "@/services/reporte-financiero.service";

interface TablaDetalleIngresosProps {
  detalle: DetalleIngresos;
}

interface TablaDetalleEgresosProps {
  detalle: DetalleEgresos;
}

const formatMonto = (monto: number): string => {
  return `$ ${monto.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// ============================================
// TABLA DE INGRESOS
// ============================================

export const TablaDetalleIngresos: React.FC<TablaDetalleIngresosProps> = ({ detalle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={20} color="#10b981" />
        <Text style={styles.headerText}>Detalle de Ingresos</Text>
      </View>

      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Concepto</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: "center" }]}>Cantidad</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Subtotal</Text>
        </View>

        {/* Rows */}
        <FilaConcepto concepto={detalle.pagosAlumnos} />
        <FilaConcepto concepto={detalle.alquileresProfesores} />

        {/* Total */}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text style={[styles.cell, styles.totalCell, { flex: 2 }]}>TOTAL INGRESOS</Text>
          <Text style={[styles.cell, { flex: 1 }]}></Text>
          <Text style={[styles.cell, styles.totalCell, { flex: 1, textAlign: "right" }]}>
            {formatMonto(detalle.total)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================
// TABLA DE EGRESOS
// ============================================

export const TablaDetalleEgresos: React.FC<TablaDetalleEgresosProps> = ({ detalle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trending-down" size={20} color="#ef4444" />
        <Text style={styles.headerText}>Detalle de Egresos</Text>
      </View>

      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Concepto</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: "center" }]}>Cantidad</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Subtotal</Text>
        </View>

        {/* Rows */}
        <FilaConcepto concepto={detalle.comisionesProfesores} />

        {/* Total */}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text style={[styles.cell, styles.totalCell, { flex: 2 }]}>TOTAL EGRESOS</Text>
          <Text style={[styles.cell, { flex: 1 }]}></Text>
          <Text style={[styles.cell, styles.totalCell, { flex: 1, textAlign: "right" }]}>
            {formatMonto(detalle.total)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================
// COMPONENTE AUXILIAR: FILA DE CONCEPTO
// ============================================

const FilaConcepto: React.FC<{ concepto: ConceptoFinanciero }> = ({ concepto }) => {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 2 }]}>{concepto.concepto}</Text>
      <Text style={[styles.cell, { flex: 1, textAlign: "center" }]}>{concepto.cantidad}</Text>
      <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>
        {formatMonto(concepto.subtotal)}
      </Text>
    </View>
  );
};

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }
    })
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  table: {
    gap: 0,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  cell: {
    fontSize: 14,
    color: "#374151",
  },
  totalRow: {
    backgroundColor: "#f9fafb",
    borderBottomWidth: 0,
    marginTop: 8,
    borderRadius: 6,
  },
  totalCell: {
    fontWeight: "700",
    color: "#1f2937",
    fontSize: 15,
  }
});