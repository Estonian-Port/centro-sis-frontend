// components/curso/AsistenciaItem.tsx
import { formatDateToDDMMYYYY } from "@/helper/funciones";
import { ParteAsistencia } from "@/model/model";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";



interface ParteAsistenciaItemProps {
  parte: ParteAsistencia;
}

export const AsistenciaItem: React.FC<ParteAsistenciaItemProps> = ({
  parte,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header Collapsable */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        {/* Fecha */}
        <View style={styles.headerLeft}>
          <View style={styles.dateIcon}>
            <Ionicons name="calendar" size={20} color="#3b82f6" />
          </View>
          <View>
            <Text style={styles.dateText}>{formatDateToDDMMYYYY(parte.fecha)}</Text>
            <Text style={styles.statsText}>
              {parte.totalPresentes} presentes •{" "}
              {parte.totalAusentes} ausentes
            </Text>
          </View>
        </View>

        {/* Porcentaje + Icono */}
        <View style={styles.headerRight}>
          <View
            style={[
              styles.percentageBadge,
              parte.porcentajeAsistencia >= 80
                ? styles.badgeGreen
                : parte.porcentajeAsistencia >= 50
                ? styles.badgeYellow
                : styles.badgeRed,
            ]}
          >
            <Text style={styles.percentageText}>
              {parte.porcentajeAsistencia.toFixed(2)}%
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#9ca3af"
          />
        </View>
      </TouchableOpacity>

      {/* Contenido Expandido */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Lista de Presentes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>
                Presentes ({parte.totalPresentes})
              </Text>
            </View>
            {parte.presentes.length > 0 ? (
              <View style={styles.alumnosList}>
                {parte.presentes.map((alumno) => (
                  <View key={alumno.id} style={styles.alumnoItem}>
                    <View style={[styles.statusDot, styles.dotPresent]} />
                    <Text style={styles.alumnoName}>
                      {alumno.nombre} {alumno.apellido}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No hay alumnos presentes</Text>
            )}
          </View>

          {/* Lista de Ausentes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="close-circle" size={20} color="#ef4444" />
              <Text style={styles.sectionTitle}>
                Ausentes ({parte.totalAusentes})
              </Text>
            </View>
            {parte.ausentes.length > 0 ? (
              <View style={styles.alumnosList}>
                {parte.ausentes.map((alumno) => (
                  <View key={alumno.id} style={styles.alumnoItem}>
                    <View style={[styles.statusDot, styles.dotAbsent]} />
                    <Text style={styles.alumnoName}>
                      {alumno.nombre} {alumno.apellido}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No hay alumnos ausentes</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  statsText: {
    fontSize: 13,
    color: "#6b7280",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeGreen: {
    backgroundColor: "#d1fae5",
  },
  badgeYellow: {
    backgroundColor: "#fef3c7",
  },
  badgeRed: {
    backgroundColor: "#fee2e2",
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  alumnosList: {
    gap: 8,
  },
  alumnoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotPresent: {
    backgroundColor: "#10b981",
  },
  dotAbsent: {
    backgroundColor: "#ef4444",
  },
  alumnoName: {
    fontSize: 14,
    color: "#1f2937",
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
});
