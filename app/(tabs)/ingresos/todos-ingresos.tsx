// app/(tabs)/ingresos/todos.tsx
import { IngresoItem } from "@/components/ingresos/IngresoItem";
import { RegistrarIngresoModal } from "@/components/ingresos/RegistrarIngresoModal";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { Access, PaginatedResponse, Rol } from "@/model/model";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { FilterChips, FilterOption } from "@/components/ui/FilterChip";

export default function TodosIngresosScreen() {
  const [ingresos, setIngresos] = useState<Access[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Rol[]>([]);

  // Modal
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);

  const PAGE_SIZE = 20;

  // 🎭 MOCK DATA - Eliminar cuando tengas backend
  const MOCK_INGRESOS: Access[] = [
    {
      id: 1,
      usuario: {
        id: 1,
        nombre: "Juan",
        apellido: "Pérez",
        dni: "12345678",
        email: "juan@mail.com",
        celular: "1122334455",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-01-13T14:30:00",
    },
    {
      id: 2,
      usuario: {
        id: 2,
        nombre: "María",
        apellido: "García",
        dni: "87654321",
        email: "maria@mail.com",
        celular: "1155667788",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["PROFESOR" as any],
      },
      fecha: "2025-01-13T09:15:00",
    },
    {
      id: 3,
      usuario: {
        id: 3,
        nombre: "Carlos",
        apellido: "López",
        dni: "11223344",
        email: "carlos@mail.com",
        celular: "1199887766",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-01-13T08:00:00",
    },
    {
      id: 4,
      usuario: {
        id: 4,
        nombre: "Ana",
        apellido: "Martínez",
        dni: "55667788",
        email: "ana@mail.com",
        celular: "1144556677",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["PROFESOR" as any],
      },
      fecha: "2025-01-12T16:45:00",
    },
    {
      id: 5,
      usuario: {
        id: 5,
        nombre: "Pedro",
        apellido: "Sánchez",
        dni: "99887766",
        email: "pedro@mail.com",
        celular: "1133445566",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-01-12T14:20:00",
    },
    {
      id: 6,
      usuario: {
        id: 6,
        nombre: "Laura",
        apellido: "Torres",
        dni: "22334455",
        email: "laura@mail.com",
        celular: "1177889900",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["OFICINA" as any],
      },
      fecha: "2025-01-12T09:00:00",
    },
    {
      id: 7,
      usuario: {
        id: 7,
        nombre: "Diego",
        apellido: "Fernández",
        dni: "66778899",
        email: "diego@mail.com",
        celular: "1166778899",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-01-11T15:30:00",
    },
    {
      id: 8,
      usuario: {
        id: 8,
        nombre: "Sofia",
        apellido: "Ruiz",
        dni: "44556677",
        email: "sofia@mail.com",
        celular: "1188990011",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["PROFESOR" as any],
      },
      fecha: "2025-01-11T10:15:00",
    },
  ];

  const rolFilterOptions: FilterOption<Rol>[] = [
    { value: Rol.ALUMNO, label: "Alumno", color: "#3b82f6" },
    { value: Rol.PROFESOR, label: "Profesor", color: "#10b981" },
    { value: Rol.ADMINISTRADOR, label: "Admin", color: "#8b5cf6" },
    { value: Rol.OFICINA, label: "Oficina", color: "#f59e0b" },
  ];

  useEffect(() => {
    fetchIngresos(0);
  }, [searchQuery, selectedRoles]);

  const fetchIngresos = async (pageNum: number = 0) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // 🎭 MOCK - Simular llamada API
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 🎭 MOCK - Filtrar datos localmente
      let filtered = [...MOCK_INGRESOS];

      // Filtrar por búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((ingreso) => {
          const nombreCompleto = `${ingreso.usuario.nombre} ${ingreso.usuario.apellido}`.toLowerCase();
          const dni = ingreso.usuario.dni.toLowerCase();
          return nombreCompleto.includes(query) || dni.includes(query);
        });
      }

      // Filtrar por roles
      if (selectedRoles.length > 0) {
        filtered = filtered.filter((ingreso) =>
          selectedRoles.some((rol) => ingreso.usuario.listaRol.includes(rol as any))
        );
      }

      const mockResponse: PaginatedResponse<Access> = {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        page: 0,
        size: 20,
      };

      // 🔥 REAL - Descomentar cuando tengas backend
      // const response: PaginatedResponse<Access> =
      //   await ingresoService.getTodosIngresos({
      //     page: pageNum,
      //     size: PAGE_SIZE,
      //     search: searchQuery,
      //     roles: selectedRoles,
      //   });

      const response = mockResponse; // 🎭 MOCK

      if (pageNum === 0) {
        setIngresos(response.content);
      } else {
        setIngresos((prev) => [...prev, ...response.content]);
      }

      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching ingresos:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los ingresos",
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages - 1 && !loadingMore) {
      fetchIngresos(page + 1);
    }
  };

  const handleToggleRol = (rol: Rol) => {
    setSelectedRoles((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando ingresos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header con botón */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Todos los Ingresos</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalElements}</Text>
            </View>
          </View>
          <Button
            title="Registrar Ingreso"
            variant="primary"
            size="small"
            onPress={() => setShowRegistrarModal(true)}
          />
        </View>

        {/* Búsqueda */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nombre, apellido o DNI..."
          style={styles.searchBar}
        />

        {/* Filtros */}
        <FilterChips
          options={rolFilterOptions}
          selectedValues={selectedRoles}
          onToggle={handleToggleRol}
          style={styles.filterChips}
        />

        {/* Lista de Ingresos */}
        {ingresos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                searchQuery || selectedRoles.length > 0
                  ? "search"
                  : "log-in-outline"
              }
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedRoles.length > 0
                ? "No se encontraron ingresos"
                : "No hay ingresos registrados"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedRoles.length > 0
                ? "Intenta con otros filtros de búsqueda"
                : "Los ingresos aparecerán aquí"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.ingresosList}>
              {ingresos.map((ingreso) => (
                <IngresoItem
                  key={ingreso.id}
                  ingreso={ingreso}
                  showUserInfo={true}
                />
              ))}
            </View>

            {/* Botón Cargar Más */}
            {page < totalPages - 1 && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <>
                    <Text style={styles.loadMoreText}>Cargar más</Text>
                    <Ionicons name="chevron-down" size={20} color="#3b82f6" />
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Indicador de página */}
            <Text style={styles.pageInfo}>
              Página {page + 1} de {totalPages} • {totalElements} ingresos
              totales
            </Text>
          </>
        )}
      </ScrollView>

      {/* Modal Registrar Ingreso */}
      <RegistrarIngresoModal
        visible={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
        onSuccess={() => fetchIngresos(0)}
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  badge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3b82f6",
  },
  searchBar: {
    marginBottom: 12,
  },
  filterChips: {
    marginBottom: 16,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  ingresosList: {
    gap: 8,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    marginTop: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  pageInfo: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 48,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});