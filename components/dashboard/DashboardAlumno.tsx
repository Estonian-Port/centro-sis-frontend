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

  const toggleFiltroEstado = (estado: EstadoCurso) => {
    setFiltrosEstado((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado]
    );
  };

  const filteredCourses = useMemo(() => {
    let filtered = cursos;

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.profesores.some((p) =>
            p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Cursos</Text>
          <Text style={styles.legendText}>
            {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
          </Text>
        </View>

        {/* Búsqueda + Toggle */}
        <View style={styles.topControls}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar cursos..."
            style={styles.searchBar}
          />

          <ViewToggle
            currentView={vistaActual}
            onViewChange={setVistaActual}
            availableViews={["lista", "calendario"]}
          />
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
            style={styles.filtersScroll}
          >
            <FilterChips
              options={estadoFilterOptions}
              selectedValues={filtrosEstado}
              onToggle={toggleFiltroEstado}
              style={styles.filterChips}
            />
          </ScrollView>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
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
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchBar: {
    flex: 1,
  },
  filtersContainer: {
    height: 80,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filtersScroll: {
    flex: 1,
  },
  filtersScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 60,
  },
  filterChips: {
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    marginBottom: 0,
  },
  listView: {
    paddingHorizontal: 12,
    gap: 12,
    marginTop: 12,
  },
});