import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Curso } from "@/model/model";
import { COLORES } from "@/util/colores";

interface CalendarioSemanalProps {
  cursos: Curso[];
  onCursoPress?: (curso: Curso) => void;
}

const CalendarioSemanal: React.FC<CalendarioSemanalProps> = ({
  cursos,
  onCursoPress,
}) => {
  const { width } = useWindowDimensions();

  // Calcular columnas según el ancho
  const getColumns = () => {
    if (Platform.OS === "web") {
      if (width >= 1024) return 6; // 1024px+ = 6 columnas
      if (width >= 768) return 3; // Tablet: 3 columnas
      return 2; // Mobile: 2 columnas
    }
    return 2; // iOS/Android: siempre 2 columnas
  };

  const columns = getColumns();

  // Agrupar cursos por día de la semana
  const cursosPorDia = useMemo(() => {
    return cursos.reduce((acc, curso) => {
      curso.horarios.forEach((horario) => {
        let dia = horario.dia.toUpperCase();

        // Mapear posibles variaciones
        const diaMapping: Record<string, string> = {
          LUNES: "MONDAY",
          MARTES: "TUESDAY",
          MIERCOLES: "WEDNESDAY",
          MIÉRCOLES: "WEDNESDAY",
          JUEVES: "THURSDAY",
          VIERNES: "FRIDAY",
          SABADO: "SATURDAY",
          SÁBADO: "SATURDAY",
          DOMINGO: "SUNDAY",
        };

        if (diaMapping[dia]) {
          dia = diaMapping[dia];
        }

        if (!acc[dia]) {
          acc[dia] = [];
        }
        acc[dia].push({
          curso,
          horario,
        });
      });
      return acc;
    }, {} as Record<string, Array<{ curso: Curso; horario: any }>>);
  }, [cursos]);

  const renderDaySchedule = (dia: string) => {
    const cursosDelDia = cursosPorDia[dia] || [];

    if (cursosDelDia.length === 0) {
      return (
        <View style={styles.emptyDay}>
          <Ionicons name="calendar-outline" size={32} color="#d1d5db" />
          <Text style={styles.emptyDayText}>Sin clases</Text>
        </View>
      );
    }

    // Ordenar por hora de inicio
    const cursosOrdenados = cursosDelDia.sort((a, b) =>
      a.horario.horaInicio.localeCompare(b.horario.horaInicio)
    );

    return cursosOrdenados.map(({ curso, horario }, index) => (
      <TouchableOpacity
        key={`${curso.id}-${horario.horaInicio}-${index}`}
        style={[styles.cursoItem, { borderLeftColor: getCursoColor(index) }]}
        onPress={() => onCursoPress && onCursoPress(curso)}
        activeOpacity={0.7}
      >
        <View style={styles.cursoHora}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.horaText}>
            {horario.horaInicio} - {horario.horaFin}
          </Text>
        </View>
        <Text style={styles.cursoNombre} numberOfLines={2}>
          {curso.nombre}
        </Text>
        <View style={styles.cursoFooter}>
          <Ionicons name="people-outline" size={12} color="#6b7280" />
          <Text style={styles.alumnosText}>
            {curso.alumnosInscriptos.length}{" "}
            {curso.alumnosInscriptos.length === 1 ? "alumno" : "alumnos"}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const getCursoColor = (index: number) => {
    const colores = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
      "#06b6d4",
    ];
    return colores[index % colores.length];
  };

  // Mapeo de nombres de días del enum a español
  const diaMap: Record<string, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
  };

  // Días de la semana en orden
  const diasSemana = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  // Calcular ancho de columna dinámicamente
  const getColumnStyle = () => {
    if (Platform.OS === "web") {
      const gapTotal = (columns - 1) * 12;
      const padding = 24;
      const availableWidth = width - padding - gapTotal;
      const columnWidth = availableWidth / columns;

      return {
        width: Math.floor(columnWidth),
        minWidth: 180,
      };
    }
    return {
      width: width / columns - 24,
    };
  };

  return (
    <View style={styles.container}>
      {/* Header opcional */}
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Calendario Semanal</Text>
        </View>

      {/* Grid de días */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {diasSemana.map((diaKey) => {
            const dia = diaMap[diaKey];
            const cantidadCursos = cursosPorDia[diaKey]?.length || 0;

            return (
              <View key={diaKey} style={[styles.diaColumn, getColumnStyle()]}>
                <View style={styles.diaHeader}>
                  <Text style={styles.diaText}>{dia}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cantidadCursos}</Text>
                  </View>
                </View>

                <View style={styles.diaContent}>
                  {renderDaySchedule(diaKey)}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  diaColumn: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 200,
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
  diaHeader: {
    backgroundColor: COLORES.cobre,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diaText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  diaContent: {
    padding: 12,
    minHeight: 150,
  },
  emptyDay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyDayText: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  cursoItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cursoHora: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  horaText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  cursoNombre: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    lineHeight: 18,
  },
  cursoFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alumnosText: {
    fontSize: 11,
    color: "#6b7280",
  },
});

export default CalendarioSemanal;