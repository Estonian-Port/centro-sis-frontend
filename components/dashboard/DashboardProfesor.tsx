// components/dashboard/DashboardProfesor.tsx - LAYOUT MÓVIL ARREGLADO

import { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Curso,
  Estado,
  EstadoCurso,
  nuevoCursoAlquilerProfesor,
} from "@/model/model";
import CourseItem from "@/components/cards/CourseItem";
import { FilterChips, FilterOption } from "@/components/ui/FilterChip";
import { ViewMode, ViewToggle } from "@/components/ui/ViewToggle";
import { SearchBar } from "@/components/ui/SearchBar";
import { Card } from "@/components/ui/Card";
import { StatRow } from "@/components/cards/stats/StatRow";
import { TIPOGRAFIA } from "@/util/tipografia";
import { COLORES } from "@/util/colores";
import CalendarioSemanal from "@/app/calendario";
import { router } from "expo-router";
import { cursoService } from "@/services/curso.service";
import Toast from "react-native-toast-message";
import { CursoFormModal } from "../modals/CursoFormModal";

const estadoFilterOptions: FilterOption<EstadoCurso>[] = [
  { value: EstadoCurso.POR_COMENZAR, label: "Por Comenzar", color: "#3b82f6" },
  { value: EstadoCurso.EN_CURSO, label: "En Curso", color: "#10b981" },
  { value: EstadoCurso.FINALIZADO, label: "Finalizado", color: "#6b7280" },
];

export const DashboardProfesor = ({
  cursos,
  onRefresh,
}: {
  cursos: Curso[];
  onRefresh: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vistaActual, setVistaActual] = useState<ViewMode>("lista");
  const [filtrosEstado, setFiltrosEstado] = useState<EstadoCurso[]>([]);
  const [cursoFormVisible, setCursoFormVisible] = useState(false);
  const [cursoPendienteSeleccionado, setCursoPendienteSeleccionado] =
    useState<Curso | null>(null);

  const toggleFiltroEstado = (estado: EstadoCurso) => {
    setFiltrosEstado((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado],
    );
  };

  const filteredCourses = useMemo(() => {
    let filtered = cursos;

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.profesores.some((p) =>
            p.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    if (filtrosEstado.length > 0) {
      filtered = filtered.filter((course) =>
        filtrosEstado.includes(course.estado),
      );
    }

    return filtered;
  }, [cursos, searchQuery, filtrosEstado]);

  const handleViewCourseDetails = (course: Curso) => {
    if (course.estadoAlta === Estado.PENDIENTE) {
      setCursoPendienteSeleccionado(course);
      setCursoFormVisible(true);
    } else {
      router.push(`/curso/${course.id}/alumnos`);
    }
  };

  const handleCursoForm = async (curso: nuevoCursoAlquilerProfesor) => {
    try {
      const response = await cursoService.completarCursoAlquiler(curso);
      onRefresh();
      setCursoFormVisible(false);
      setCursoPendienteSeleccionado(null);
      Toast.show({
        type: "success",
        text1: "Curso completado exitosamente",
        position: "bottom",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error al completar el curso",
        position: "bottom",
      });
    }
  };

  const handleCloseModal = () => {
    setCursoFormVisible(false);
    setCursoPendienteSeleccionado(null);
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

        {/* ✅ NUEVO LAYOUT: Búsqueda + Toggle arriba */}
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

        {/* ✅ NUEVO: Filtros en ScrollView horizontal */}
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

        {/* Vista de lista o calendario */}
        {vistaActual === "lista" ? (
          <View style={styles.listView}>
            {filteredCourses.map((curso) => (
              <CourseItem
                key={curso.id}
                course={curso}
                handleCourseDetails={handleViewCourseDetails}
                onEditPendingCourse={handleViewCourseDetails}
              />
            ))}
          </View>
        ) : (
          <CalendarioSemanal
            cursos={filteredCourses as any}
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
                  0,
                )}
                label="Alumnos"
              />
              <StatRow number={cursos.length} label="Cursos" />
              <StatRow number="85%" label="Asistencia promedio" />
            </View>
          </Card>
        </View>
      </SafeAreaView>

      {cursoPendienteSeleccionado && (
        <CursoFormModal
          visible={cursoFormVisible}
          onClose={handleCloseModal}
          onSuccess={handleCursoForm}
          curso={cursoPendienteSeleccionado}
        />
      )}
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
  // ✅ NUEVO: Controls superiores (búsqueda + toggle)
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
    flex: 1, // ✅ Ocupa el espacio disponible
  },
  // ✅ NUEVO: Scroll horizontal para filtros
  filtersScroll: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filtersScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChips: {
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    marginBottom: 0,
  },
  // ✅ ELIMINAR: controls (ya no se usa)
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
