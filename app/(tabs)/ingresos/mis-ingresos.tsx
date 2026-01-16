// app/(tabs)/ingresos/mis-ingresos.tsx
import { IngresoItem } from "@/components/ingresos/IngresoItem";
import { MultiSelect, MultiSelectOption } from "@/components/ui/MultiSelect";
import { Access, PaginatedResponse } from "@/model/model";
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

type Mes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export default function MisIngresosScreen() {
  const [ingresos, setIngresos] = useState<Access[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtro
  const [selectedMeses, setSelectedMeses] = useState<Mes[]>([]);

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
      fecha: "2025-02-15T09:15:00",
    },
    {
      id: 3,
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
      fecha: "2025-03-20T16:45:00",
    },
    {
      id: 4,
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
      fecha: "2025-04-10T08:20:00",
    },
    {
      id: 5,
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
      fecha: "2025-05-25T14:00:00",
    },
    {
      id: 6,
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
      fecha: "2025-06-08T11:30:00",
    },
    {
      id: 7,
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
      fecha: "2025-07-18T13:45:00",
    },
    {
      id: 8,
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
      fecha: "2025-08-22T10:00:00",
    },
    {
      id: 9,
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
      fecha: "2025-09-05T15:20:00",
    },
    {
      id: 10,
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
      fecha: "2025-10-12T09:40:00",
    },
    {
      id: 11,
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
      fecha: "2025-11-28T14:15:00",
    },
    {
      id: 12,
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
      fecha: "2025-12-20T16:30:00",
    },
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
    fetchIngresos();
  }, [selectedMeses]);

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
      //   await ingresoService.getMisIngresos({
      //     page: pageNum,
      //     size: PAGE_SIZE,
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
        {/* Header con contador */}
        <View style={styles.header}>
          <Text style={styles.title}>Mis Ingresos</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalElements}</Text>
          </View>
        </View>

        {/* Filtros por Mes */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filtrar por Mes:</Text>
          <MultiSelect
            options={mesFilterOptions}
            selectedValues={selectedMeses}
            onToggle={handleToggleMes}
            placeholder="Seleccionar meses"
          />
        </View>

        {/* Lista de Ingresos */}
        {ingresos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={selectedMeses.length > 0 ? "search" : "log-in-outline"}
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>
              {selectedMeses.length > 0
                ? "No se encontraron ingresos"
                : "No hay ingresos registrados"}
            </Text>
            <Text style={styles.emptyText}>
              {selectedMeses.length > 0
                ? "Intenta con otros meses"
                : "Tus ingresos al centro aparecerán aquí"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.ingresosList}>
              {ingresos.map((ingreso) => (
                <IngresoItem key={ingreso.id} ingreso={ingreso} />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
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
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
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