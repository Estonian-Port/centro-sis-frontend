// app/(tabs)/ingresos/mis-ingresos.tsx
import { IngresoItem } from "@/components/ingresos/IngresoItem";
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

export default function MisIngresosScreen() {
  const [ingresos, setIngresos] = useState<Access[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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
      fecha: "2025-01-12T09:15:00",
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
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-01-11T16:45:00",
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
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-01-10T08:20:00",
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
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["ALUMNO" as any],
      },
      fecha: "2025-01-09T14:00:00",
    },
  ];

  useEffect(() => {
    fetchIngresos();
  }, []);

  const fetchIngresos = async (pageNum: number = 0) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // 🎭 MOCK - Simular llamada API
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 🎭 MOCK - Usar datos mockeados
      const mockResponse: PaginatedResponse<Access> = {
        content: MOCK_INGRESOS,
        totalElements: MOCK_INGRESOS.length,
        totalPages: 1,
        page: 0,
        size: 20,
      };

      // 🔥 REAL - Descomentar cuando tengas backend
      // const response: PaginatedResponse<Access> =
      //   await ingresoService.getMisIngresos(pageNum, PAGE_SIZE);

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

        {/* Lista de Ingresos */}
        {ingresos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="log-in-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay ingresos registrados</Text>
            <Text style={styles.emptyText}>
              Tus ingresos al centro aparecerán aquí
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