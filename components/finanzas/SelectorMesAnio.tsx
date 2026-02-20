// components/finanzas/SelectorMesAnio.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SelectorMesAnioProps {
  mes: number;
  anio: number;
  onCambiar: (mes: number, anio: number) => void;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const SelectorMesAnio: React.FC<SelectorMesAnioProps> = ({
  mes,
  anio,
  onCambiar
}) => {

  const handleAnterior = () => {
    if (mes === 1) {
      onCambiar(12, anio - 1);
    } else {
      onCambiar(mes - 1, anio);
    }
  };

  const handleSiguiente = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    // No permitir avanzar más allá del mes actual
    if (anio === anioActual && mes === mesActual) {
      return;
    }

    if (mes === 12) {
      onCambiar(1, anio + 1);
    } else {
      onCambiar(mes + 1, anio);
    }
  };

  const esActual = () => {
    const hoy = new Date();
    return mes === hoy.getMonth() + 1 && anio === hoy.getFullYear();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAnterior}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color="#3b82f6" />
      </TouchableOpacity>

      <View style={styles.dateContainer}>
        <Ionicons name="calendar" size={20} color="#6b7280" />
        <Text style={styles.dateText}>
          {MESES[mes - 1]} {anio}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, esActual() && styles.buttonDisabled]} 
        onPress={handleSiguiente}
        activeOpacity={0.7}
        disabled={esActual()}
      >
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={esActual() ? "#d1d5db" : "#3b82f6"} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
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
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
  },
  buttonDisabled: {
    backgroundColor: "#f3f4f6",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 150,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  }
});