import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";  // ✅ Quitar FlatList
import { Ionicons } from "@expo/vector-icons";
import { MovimientoFinanciero } from "@/services/reporte-financiero.service";

interface ListaMovimientosProps {
  movimientos: MovimientoFinanciero[];
}

export const ListaMovimientos: React.FC<ListaMovimientosProps> = ({ movimientos }) => {

  const formatFecha = (fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatMonto = (monto: number, tipo: 'INGRESO' | 'EGRESO'): string => {
    const signo = tipo === 'INGRESO' ? '+' : '-';
    return `${signo} $ ${Math.abs(monto).toLocaleString('es-AR')}`;
  };

  const getIcono = (categoria: MovimientoFinanciero['categoria']): string => {
    switch (categoria) {
      case 'PAGO_ALUMNO': return 'person';
      case 'ALQUILER_PROFESOR': return 'home';
      case 'COMISION_PROFESOR': return 'cash';
    }
  };

  const getColorCategoria = (categoria: MovimientoFinanciero['categoria']): string => {
    switch (categoria) {
      case 'PAGO_ALUMNO': return '#3b82f6';
      case 'ALQUILER_PROFESOR': return '#8b5cf6';
      case 'COMISION_PROFESOR': return '#f59e0b';
    }
  };

  const getNombreCategoria = (categoria: MovimientoFinanciero['categoria']): string => {
    switch (categoria) {
      case 'PAGO_ALUMNO': return 'Pago Alumno';
      case 'ALQUILER_PROFESOR': return 'Alquiler';
      case 'COMISION_PROFESOR': return 'Comisión';
    }
  };

  const renderMovimiento = (item: MovimientoFinanciero) => {
    const color = item.tipo === 'INGRESO' ? '#10b981' : '#ef4444';
    const colorCategoria = getColorCategoria(item.categoria);

    return (
      <View key={item.id} style={styles.movimientoCard}>
        {/* Icono y Fecha */}
        <View style={styles.movimientoHeader}>
          <View style={[styles.iconoContainer, { backgroundColor: `${colorCategoria}15` }]}>
            <Ionicons name={getIcono(item.categoria) as any} size={20} color={colorCategoria} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.fecha}>{formatFecha(item.fecha)}</Text>
            <View style={[styles.categoriaBadge, { backgroundColor: `${colorCategoria}15` }]}>
              <Text style={[styles.categoriaText, { color: colorCategoria }]}>
                {getNombreCategoria(item.categoria)}
              </Text>
            </View>
          </View>
        </View>

        {/* Concepto */}
        <Text style={styles.concepto}>{item.concepto}</Text>

        {/* Detalles */}
        <View style={styles.detalles}>
          {item.alumno && (
            <View style={styles.detalle}>
              <Ionicons name="person-outline" size={14} color="#6b7280" />
              <Text style={styles.detalleText}>{item.alumno}</Text>
            </View>
          )}
          {item.profesor && (
            <View style={styles.detalle}>
              <Ionicons name="school-outline" size={14} color="#6b7280" />
              <Text style={styles.detalleText}>{item.profesor}</Text>
            </View>
          )}
          {item.curso && (
            <View style={styles.detalle}>
              <Ionicons name="book-outline" size={14} color="#6b7280" />
              <Text style={styles.detalleText}>{item.curso}</Text>
            </View>
          )}
        </View>

        {/* Monto */}
        <View style={styles.montoContainer}>
          <Text style={[styles.monto, { color }]}>
            {formatMonto(item.monto, item.tipo)}
          </Text>
        </View>
      </View>
    );
  };

  if (movimientos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>No hay movimientos en este periodo</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="list" size={20} color="#3b82f6" />
        <Text style={styles.headerText}>Últimos movimientos</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{movimientos.length}</Text>
        </View>
      </View>

      {/* ✅ CAMBIO: map en lugar de FlatList */}
      <View style={styles.lista}>
        {movimientos.map(renderMovimiento)}
      </View>
    </View>
  );
};

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
    flex: 1,
  },
  badge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6",
  },
  lista: {
    gap: 12,
  },
  movimientoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  movimientoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  iconoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  fecha: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  categoriaBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoriaText: {
    fontSize: 11,
    fontWeight: "600",
  },
  concepto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 10,
  },
  detalles: {
    gap: 6,
    marginBottom: 12,
  },
  detalle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detalleText: {
    fontSize: 13,
    color: "#6b7280",
  },
  montoContainer: {
    alignItems: "flex-end",
  },
  monto: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9ca3af",
  }
});