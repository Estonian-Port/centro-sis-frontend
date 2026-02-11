import { AddAlumnoModal } from "@/components/modals/AddAlumnoModal";
import { AlumnoItem } from "@/components/curso/AlumnoItem";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { Curso, EstadoPago } from "@/model/model";
import { cursoService } from "@/services/curso.service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import Toast from "react-native-toast-message";
import { FilterChips, FilterOption } from "@/components/ui/FilterChip";
import { TIPOGRAFIA } from "@/util/tipografia";
import { useAuth } from "@/context/authContext";
import { getErrorMessage } from "@/helper/auth.interceptor";

export default function AlumnosTab() {
  const { cursoId } = useLocalSearchParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedRole } = useAuth();

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstados, setSelectedEstados] = useState<EstadoPago[]>([]);

  // Estados de modales
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchCurso();
  }, [cursoId]);

  const fetchCurso = async () => {
    if (!cursoId) return;

    setLoading(true);
    try {
      const response = await cursoService.getById(Number(cursoId));
      setCurso(response);
    } catch (error) {
      console.error("Error fetching curso:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo cargar el curso",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  // Opciones de filtro
  const filterOptions: FilterOption<EstadoPago>[] = [
    { value: EstadoPago.AL_DIA, label: "Al día", color: "#10b981" },
    { value: EstadoPago.ATRASADO, label: "Atrasados", color: "#f59e0b" },
    { value: EstadoPago.PENDIENTE, label: "Pendientes", color: "#ef4444" },
    {
      value: EstadoPago.PAGO_COMPLETO,
      label: "Pago Completo",
      color: "#3b82f6",
    },
  ];

  // Handler para toggle de filtros
  const handleToggleEstado = (estado: EstadoPago) => {
    setSelectedEstados((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado],
    );
  };

  // Filtrado de inscripciones
  const getFilteredInscripciones = () => {
    if (!curso) return [];

    let filtered = curso.inscripciones || [];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((inscripcion) => {
        const alumno = inscripcion.alumno;
        const nombreCompleto =
          `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
        const dni = alumno.dni?.toLowerCase() || "";
        const email = alumno.email?.toLowerCase() || "";

        return (
          nombreCompleto.includes(query) ||
          dni.includes(query) ||
          email.includes(query)
        );
      });
    }

    // Filtrar por estado de pago
    if (selectedEstados.length > 0) {
      filtered = filtered.filter((inscripcion) =>
        selectedEstados.includes(inscripcion.estadoPago),
      );
    }

    return filtered;
  };

  const evaluarPorRol =
    (curso?.tipoCurso === "COMISION" &&
      selectedRole !== null &&
      (selectedRole === "ADMINISTRADOR" || selectedRole === "OFICINA")) ||
    (curso?.tipoCurso === "ALQUILER" &&
      selectedRole !== null &&
      (selectedRole === "ADMINISTRADOR" || selectedRole === "PROFESOR"));

  // Verificar si se puede agregar alumnos (solo EN_CURSO o POR_COMENZAR)
  const canAddAlumnos =
    (curso?.estado === "EN_CURSO" || curso?.estado === "POR_COMENZAR") &&
    evaluarPorRol;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!curso) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró el curso</Text>
      </View>
    );
  }

  const filteredInscripciones = getFilteredInscripciones();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Búsqueda */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nombre, apellido o DNI..."
          style={styles.searchBar}
        />
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {/* Filtros de Rol */}
            <View style={styles.filterGroup}>
              {/* Filtros */}
              <FilterChips
                options={filterOptions}
                selectedValues={selectedEstados}
                onToggle={handleToggleEstado}
                style={styles.filterChips}
              />
            </View>
          </ScrollView>
        </View>
        {/* Header con título y botón */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>
            Alumnos ({curso.inscripciones?.length || 0})
          </Text>
          <Button
            title="Agregar Alumno"
            variant="primary"
            onPress={() => setShowAddModal(true)}
            size="small"
            disabled={!canAddAlumnos}
          />
        </View>

        {/* Lista de Alumnos */}
        {filteredInscripciones.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                searchQuery || selectedEstados.length > 0
                  ? "search"
                  : "person-add-outline"
              }
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyStateTitle}>
              {searchQuery || selectedEstados.length > 0
                ? "No se encontraron alumnos"
                : "No hay alumnos inscriptos"}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedEstados.length > 0
                ? "Intenta con otros filtros de búsqueda"
                : "Comienza agregando alumnos a este curso"}
            </Text>
          </View>
        ) : (
          <View style={styles.alumnosList}>
            {filteredInscripciones.map((inscripcion) => (
              <AlumnoItem
                key={inscripcion.id}
                inscripcion={inscripcion}
                curso={curso}
                onRefresh={fetchCurso}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Agregar Alumno */}
      <AddAlumnoModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        curso={curso}
        onSuccess={() => {
          fetchCurso();
          setShowAddModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    ...TIPOGRAFIA.titleL,
    color: "#1f2937",
  },
  searchBar: {
    marginBottom: 12,
  },
  filterChips: {
    marginBottom: 16,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  alumnosList: {
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 48,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  filtersSection: {
    paddingHorizontal: 4,
  },
  filtersScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
