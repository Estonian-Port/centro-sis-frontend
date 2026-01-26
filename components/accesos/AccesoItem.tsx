// components/accesos/AccesoItem.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Acceso } from "@/model/model";

interface AccesoItemProps {
  acceso: Acceso;
  showUserInfo?: boolean; // Solo para admin
}

export const AccesoItem: React.FC<AccesoItemProps> = ({
  acceso,
  showUserInfo = false,
}) => {
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      {/* Icono y Fecha/Hora */}
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="log-in-outline" size={24} color="#10b981" />
        </View>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.fecha}>{formatFecha(acceso.fechaHora)}</Text>
          <Text style={styles.hora}>{formatHora(acceso.fechaHora)}</Text>
        </View>
      </View>

      {/* Info del Usuario (solo admin) */}
      {showUserInfo && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {acceso.usuarioNombre} {acceso.usuarioApellido}
          </Text>
          <Text style={styles.userDni}>DNI: {acceso.usuarioDni}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  dateTimeContainer: {
    gap: 4,
  },
  fecha: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  hora: {
    fontSize: 14,
    color: "#6b7280",
  },
  userInfo: {
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  userDni: {
    fontSize: 13,
    color: "#6b7280",
  },
});