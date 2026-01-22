import { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Curso, CursoAlumno, EstadoCurso } from "@/model/model";
import CourseItem from "@/components/cards/CourseItem";
import { FilterChips, FilterOption } from "@/components/ui/FilterChip";
import { ViewMode, ViewToggle } from "@/components/ui/ViewToggle";
import { SearchBar } from "@/components/ui/SearchBar";
import { CourseDetailModal } from "@/components/modals/CourseDetailsModal";
import CalendarioSemanal from "@/app/calendario";

// Definir opciones de filtro por estado
const estadoFilterOptions: FilterOption<EstadoCurso>[] = [
  { value: EstadoCurso.POR_COMENZAR, label: "Por Comenzar", color: "#3b82f6" },
  { value: EstadoCurso.EN_CURSO, label: "En Curso", color: "#10b981" },
  { value: EstadoCurso.FINALIZADO, label: "Finalizado", color: "#6b7280" },
];

export const DashboardAlumno = ({ cursos }: { cursos: CursoAlumno[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vistaActual, setVistaActual] = useState<ViewMode>("lista");
  const [filtrosEstado, setFiltrosEstado] = useState<EstadoCurso[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CursoAlumno | null>(null);
  const [showModalDetailsCourse, setShowModalDetailsCourse] = useState(false);

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
            p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleViewCourseDetails = (course: CursoAlumno | Curso) => {
    setSelectedCourse(course as CursoAlumno);
    setShowModalDetailsCourse(true);
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
            availableViews={["lista", "calendario"]}
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

        {selectedCourse && (
          <CourseDetailModal
            visible={showModalDetailsCourse}
            onClose={() => setShowModalDetailsCourse(false)}
            curso={selectedCourse}
          />
        )}
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
    marginBottom: 16,
  },
  listView: {
    paddingHorizontal: 12,
    gap: 12,
  },
});
