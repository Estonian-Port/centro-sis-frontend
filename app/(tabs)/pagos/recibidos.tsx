// app/(tabs)/pagos/recibidos.tsx
import { PagoItem } from "@/components/pagos/PagoItem";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pago, PaginatedResponse, pagoToDisplay, PagoType, TipoPagoConcepto } from "@/model/model";
import { pagoService } from "@/services/pago.service";
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

export default function PagosRecibidosScreen() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const PAGE_SIZE = 20;

  // 🎭 MOCK DATA
  const MOCK_PAGOS: Pago[] = [
    {
      id: 1,
      monto: 15000,
      fecha: "2025-01-10T00:00:00",
      fechaBaja: null,
      observaciones: null,
      tipo: TipoPagoConcepto.CURSO,
      inscripcion: {
        id: 1,
        alumno: {
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
        curso: {
          id: 1,
          nombre: "Taekwondo Infantil",
          horarios: [],
          alumnosInscriptos: [],
          fechaInicio: "2025-01-01",
          fechaFin: "2025-12-31",
          estado: "EN_CURSO" as any,
          profesores: ["Prof. García"],
          tiposPago: [],
          inscripciones: [],
        },
        tipoPagoSeleccionado: {
          tipo: "MENSUAL" as any,
          monto: 15000,
        },
      },
      retraso: false,
      beneficioAplicado: 10,
    },
    {
      id: 2,
      monto: 12000,
      fecha: "2025-01-08T00:00:00",
      fechaBaja: null,
      observaciones: null,
      tipo: TipoPagoConcepto.CURSO,
      inscripcion: {
        id: 2,
        alumno: {
          id: 2,
          nombre: "María",
          apellido: "González",
          dni: "87654321",
          email: "maria@mail.com",
          celular: "1155667788",
          estado: "ACTIVO" as any,
          primerLogin: false,
          listaRol: ["ALUMNO" as any],
        },
        curso: {
          id: 2,
          nombre: "Yoga Matutino",
          horarios: [],
          alumnosInscriptos: [],
          fechaInicio: "2025-01-01",
          fechaFin: "2025-12-31",
          estado: "EN_CURSO" as any,
          profesores: ["Prof. Martínez"],
          tiposPago: [],
          inscripciones: [],
        },
        tipoPagoSeleccionado: {
          tipo: "MENSUAL" as any,
          monto: 12000,
        },
      },
      retraso: true,
      beneficioAplicado: 0,
    },
    {
      id: 3,
      monto: 50000,
      fecha: "2025-01-05T00:00:00",
      fechaBaja: null,
      observaciones: null,
      tipo: TipoPagoConcepto.ALQUILER,
      curso: {
        id: 3,
        nombre: "Pilates Avanzado",
        horarios: [],
        alumnosInscriptos: [],
        fechaInicio: "2025-01-01",
        fechaFin: "2025-12-31",
        estado: "EN_CURSO" as any,
        profesores: ["Prof. López"],
        tiposPago: [],
        inscripciones: [],
      },
      profesor: {
        id: 3,
        nombre: "Carlos",
        apellido: "López",
        dni: "11223344",
        email: "carlos@mail.com",
        celular: "1199887766",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["PROFESOR" as any],
      },
    },
    {
      id: 7,
      monto: 20000,
      fecha: "2025-01-03T00:00:00",
      fechaBaja: null,
      observaciones: null,
      tipo: TipoPagoConcepto.CURSO,
      inscripcion: {
        id: 5,
        alumno: {
          id: 4,
          nombre: "Ana",
          apellido: "Martínez",
          dni: "55667788",
          email: "ana@mail.com",
          celular: "1144556677",
          estado: "ACTIVO" as any,
          primerLogin: false,
          listaRol: ["ALUMNO" as any],
        },
        curso: {
          id: 4,
          nombre: "Natación Adultos",
          horarios: [],
          alumnosInscriptos: [],
          fechaInicio: "2025-01-01",
          fechaFin: "2025-12-31",
          estado: "EN_CURSO" as any,
          profesores: ["Prof. Silva"],
          tiposPago: [],
          inscripciones: [],
        },
        tipoPagoSeleccionado: {
          tipo: "MENSUAL" as any,
          monto: 20000,
        },
      },
      retraso: false,
      beneficioAplicado: 5,
    },
  ];

  useEffect(() => {
    fetchPagos(0);
  }, [searchQuery]);

  const fetchPagos = async (pageNum: number = 0) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // 🎭 MOCK
      await new Promise((resolve) => setTimeout(resolve, 800));

      let filtered = [...MOCK_PAGOS];
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((pago) => {
          const display = pagoToDisplay(pago);
          return (
            display.curso.toLowerCase().includes(query) ||
            display.usuarioPago.toLowerCase().includes(query)
          );
        });
      }

      const mockResponse: PaginatedResponse<Pago> = {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        page: 0,
        size: 20,
      };

      // 🔥 REAL
      // const response = await pagoService.getPagosRecibidos({
      //   page: pageNum,
      //   size: PAGE_SIZE,
      //   search: searchQuery,
      // });

      const response = mockResponse;

      if (pageNum === 0) {
        setPagos(response.content);
      } else {
        setPagos((prev) => [...prev, ...response.content]);
      }

      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching pagos:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los pagos",
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages - 1 && !loadingMore) {
      fetchPagos(page + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando pagos...</Text>
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
          <Text style={styles.title}>Pagos Recibidos</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalElements}</Text>
          </View>
        </View>

        {/* Búsqueda */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por curso o usuario..."
          style={styles.searchBar}
        />

        {/* Lista de Pagos */}
        {pagos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay pagos recibidos</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No se encontraron pagos con ese criterio"
                : "Los pagos recibidos aparecerán aquí"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.pagosList}>
              {pagos.map((pago) => (
                <PagoItem key={pago.id} pago={pagoToDisplay(pago)} />
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

            <Text style={styles.pageInfo}>
              Página {page + 1} de {totalPages} • {totalElements} pagos totales
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
  searchBar: {
    marginBottom: 16,
  },
  pagosList: {
    gap: 0,
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