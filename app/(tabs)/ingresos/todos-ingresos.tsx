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
import { MultiSelect, MultiSelectOption } from "@/components/ui/MultiSelect";

type Mes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

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
  const [selectedMeses, setSelectedMeses] = useState<Mes[]>([]);

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
        fechaNacimiento: "1990-05-15",
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
        fechaNacimiento: "1985-03-22",
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
        fechaNacimiento: "1995-11-08",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-02-18T08:00:00",
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
        fechaNacimiento: "1988-07-30",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["PROFESOR" as any],
      },
      fecha: "2025-03-12T16:45:00",
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
        fechaNacimiento: "1992-09-14",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-04-20T14:20:00",
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
        fechaNacimiento: "1987-12-05",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["OFICINA" as any],
      },
      fecha: "2025-05-15T09:00:00",
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
        fechaNacimiento: "1993-02-28",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-06-22T15:30:00",
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
        fechaNacimiento: "1991-04-17",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["PROFESOR" as any],
      },
      fecha: "2025-07-10T10:15:00",
    },
    {
      id: 9,
      usuario: {
        id: 9,
        nombre: "Roberto",
        apellido: "Gómez",
        dni: "33445566",
        email: "roberto@mail.com",
        celular: "1155443322",
        fechaNacimiento: "1989-06-25",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-08-05T13:00:00",
    },
    {
      id: 10,
      usuario: {
        id: 10,
        nombre: "Valentina",
        apellido: "Morales",
        dni: "77889900",
        email: "valentina@mail.com",
        celular: "1166554433",
        fechaNacimiento: "1994-10-12",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["PROFESOR" as any],
      },
      fecha: "2025-09-18T11:30:00",
    },
    {
      id: 11,
      usuario: {
        id: 11,
        nombre: "Martín",
        apellido: "Silva",
        dni: "88990011",
        email: "martin@mail.com",
        celular: "1177665544",
        fechaNacimiento: "1986-08-03",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-10-25T14:45:00",
    },
    {
      id: 12,
      usuario: {
        id: 12,
        nombre: "Carolina",
        apellido: "Ramírez",
        dni: "99001122",
        email: "carolina@mail.com",
        celular: "1188776655",
        fechaNacimiento: "1990-01-19",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["OFICINA" as any],
      },
      fecha: "2025-11-08T09:20:00",
    },
    {
      id: 13,
      usuario: {
        id: 13,
        nombre: "Federico",
        apellido: "Castro",
        dni: "00112233",
        email: "federico@mail.com",
        celular: "1199887766",
        fechaNacimiento: "1992-12-31",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-12-15T16:00:00",
    },
  ];

  const rolFilterOptions: FilterOption<Rol>[] = [
    { value: Rol.ALUMNO, label: "Alumno", color: "#3b82f6" },
    { value: Rol.PROFESOR, label: "Profesor", color: "#10b981" },
    { value: Rol.ADMINISTRADOR, label: "Admin", color: "#8b5cf6" },
    { value: Rol.OFICINA, label: "Oficina", color: "#f59e0b" },
  ];

  const mesFilterOptions: MultiSelectOption<Mes>[] = [
    { value: 1, label: "Enero", color: "#3b82f6" },
    { value: 2, label: "Febrero", color: "#8b5cf6" },
    { value: 3, label: "Marzo", color: "#10b981" },
    { value: 4, label: "Abril", color: "#f59e0b" },
    { value: 5, label: "Mayo", color: "#ef4444" },
    { value: 6, label: "Junio", color: "#06b6d4" },
    { value: 7, label: "Julio", color: "#6366f1" },
    { value: 8, label: "Agosto", color: "#84cc16" },
    { value: 9, label: "Septiembre", color: "#f97316" },
    { value: 10, label: "Octubre", color: "#ec4899" },
    { value: 11, label: "Noviembre", color: "#14b8a6" },
    { value: 12, label: "Diciembre", color: "#a855f7" },
  ];

  useEffect(() => {
    fetchIngresos(0);
  }, [searchQuery, selectedRoles, selectedMeses]);

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
          const nombreCompleto =
            `${ingreso.usuario.nombre} ${ingreso.usuario.apellido}`.toLowerCase();
          const dni = ingreso.usuario.dni.toLowerCase();
          return nombreCompleto.includes(query) || dni.includes(query);
        });
      }

      // Filtrar por roles
      if (selectedRoles.length > 0) {
        filtered = filtered.filter((ingreso) =>
          selectedRoles.some((rol) =>
            ingreso.usuario.listaRol.includes(rol as any)
          )
        );
      }

      // Filtrar por meses
      if (selectedMeses.length > 0) {
        filtered = filtered.filter((ingreso) => {
          const fechaIngreso = new Date(ingreso.fecha);
          const mes = (fechaIngreso.getMonth() + 1) as Mes;
          return selectedMeses.includes(mes);
        });
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
      //     meses: selectedMeses,
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

  const handleToggleMes = (mes: Mes) => {
    setSelectedMeses((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes]
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

        {/* Filtros Combinados */}
        <View style={styles.filtersRow}>
          {/* Chips de Rol */}
          <View style={styles.filterChipsContainer}>
            <FilterChips
              options={rolFilterOptions}
              selectedValues={selectedRoles}
              onToggle={handleToggleRol}
              style={styles.filterChips}
            />
          </View>

          {/* Dropdown de Meses */}
          <View style={styles.multiSelectContainer}>
            <MultiSelect
              options={mesFilterOptions}
              selectedValues={selectedMeses}
              onToggle={handleToggleMes}
              placeholder="Meses"
            />
          </View>
        </View>

        {/* Lista de Ingresos */}
        {ingresos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                searchQuery ||
                selectedRoles.length > 0 ||
                selectedMeses.length > 0
                  ? "search"
                  : "log-in-outline"
              }
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>
              {searchQuery ||
              selectedRoles.length > 0 ||
              selectedMeses.length > 0
                ? "No se encontraron ingresos"
                : "No hay ingresos registrados"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery ||
              selectedRoles.length > 0 ||
              selectedMeses.length > 0
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
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  filterChipsContainer: {
    flex: 1,
    minWidth: 200,
  },
  filterChips: {
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    marginBottom: 0,
  },
  multiSelectContainer: {
    minWidth: 500,
    maxWidth: 750,
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
