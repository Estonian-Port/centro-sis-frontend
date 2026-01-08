import { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Curso, EstadoCurso } from "@/model/model";
import CourseItem from "@/components/cards/CourseItem";
import { FilterChips, FilterOption } from "@/components/ui/FilterChip";
import { ViewMode, ViewToggle } from "@/components/ui/ViewToggle";
import { SearchBar } from "@/components/ui/SearchBarCourse";
import { Card } from "@/components/ui/Card";
import { StatRow } from "@/components/cards/stats/StatRow";
import { TIPOGRAFIA } from "@/util/tipografia";
import { COLORES } from "@/util/colores";
import CalendarioSemanal from "@/app/calendario";
import { router } from "expo-router";

// Definir opciones de filtro por estado
const estadoFilterOptions: FilterOption<EstadoCurso>[] = [
  { value: EstadoCurso.POR_COMENZAR, label: "Por Comenzar", color: "#3b82f6" },
  { value: EstadoCurso.EN_CURSO, label: "En Curso", color: "#10b981" },
  { value: EstadoCurso.FINALIZADO, label: "Finalizado", color: "#6b7280" },
  { value: EstadoCurso.PENDIENTE, label: "Pendiente", color: "#f59e0b" },
];

export const DashboardProfesor = ({ cursos }: { cursos: Curso[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vistaActual, setVistaActual] = useState<ViewMode>("calendario");
  const [filtrosEstado, setFiltrosEstado] = useState<EstadoCurso[]>([]);

  // Toggle filtro de estado
  const toggleFiltroEstado = (estado: EstadoCurso) => {
    setFiltrosEstado((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado]
    );
  };

  // Cursos filtrados
  const filteredCourses = useMemo(() => {
    let filtered = cursos;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.profesores.some((p) =>
            p.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filtrar por estado
    if (filtrosEstado.length > 0) {
      filtered = filtered.filter((course) =>
        filtrosEstado.includes(course.estado)
      );
    }

    return filtered;
  }, [cursos, searchQuery, filtrosEstado]);

  const handleViewCourseDetails = (course: Curso) => {
    router.push(`/${course.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Cursos</Text>
          <Text style={styles.legendText}>
            {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
          </Text>
        </View>

        {/* Controls: Búsqueda + Toggle de vista + Chip de filtros */}
        <View style={styles.controls}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar cursos..."
          />

          <ViewToggle
            currentView={vistaActual}
            onViewChange={setVistaActual}
            availableViews={["calendario", "lista"]}
          />

          <FilterChips
            options={estadoFilterOptions}
            selectedValues={filtrosEstado}
            onToggle={toggleFiltroEstado}
          />
        </View>

        {/* Vista de lista o calendario */}
        {vistaActual === "lista" ? (
          <View style={styles.listView}>
            {filteredCourses.map((curso) => (
              <CourseItem
                key={curso.id}
                course={curso}
                handleCourseDetails={handleViewCourseDetails}
              />
            ))}
          </View>
        ) : (
          <CalendarioSemanal
            cursos={filteredCourses}
            onCursoPress={handleViewCourseDetails}
          />
        )}
        <View style={styles.resumenContainer}>
          <Text style={styles.cardTitle}>Resumen</Text>
          <Card>
            <View style={styles.statsRow}>
              <StatRow
                number={cursos.reduce(
                  (sum, curso) => sum + curso.alumnosInscriptos.length,
                  0
                )}
                label="Alumnos"
              />
              <StatRow number={cursos.length} label="Cursos" />
              <StatRow number="85%" label="Asistencia promedio" />
            </View>
          </Card>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  legendText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 8,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderRadius: 8,
    marginHorizontal: 12,
  },
  listView: {
    paddingHorizontal: 12,
    gap: 12,
    marginTop: 12,
  },
  resumenContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginHorizontal: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cardTitle: {
    ...TIPOGRAFIA.titleL,
    color: COLORES.textPrimary,
    marginBottom: 16,
  },
});
