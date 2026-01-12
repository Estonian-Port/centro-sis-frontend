// app/(tabs)/pagos/realizados.tsx
// Es idéntico a recibidos.tsx pero cambia:
// - El título a "Pagos Realizados"
// - El servicio a pagoService.getPagosRealizados()
// - Los mocks representan pagos que el usuario hizo, no recibió

// Por brevedad, el código es el mismo que recibidos.tsx
// Solo cambia el fetch y el título
// Te lo entrego completo en el próximo paso

import { PagoItem } from "@/components/pagos/PagoItem";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pago, PaginatedResponse, pagoToDisplay, TipoPagoConcepto } from "@/model/model";
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

export default function PagosRealizadosScreen() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const PAGE_SIZE = 20;

  // 🎭 MOCK DATA - Pagos que YO realicé
  const MOCK_PAGOS: Pago[] = [
    {
      id: 4,
      monto: 180000,
      fecha: "2025-01-12T00:00:00",
      fechaBaja: null,
      observaciones: null,
      tipo: TipoPagoConcepto.CURSO,
      inscripcion: {
        id: 3,
        alumno: {
          id: 10,
          nombre: "Yo",
          apellido: "Usuario",
          dni: "99999999",
          email: "yo@mail.com",
          celular: "1166778899",
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
          tipo: "TOTAL" as any,
          monto: 180000,
        },
      },
      retraso: false,
      beneficioAplicado: 15,
    },
    {
      id: 5,
      monto: 15000,
      fecha: "2025-01-10T00:00:00",
      fechaBaja: null,
      observaciones: null,
      tipo: TipoPagoConcepto.CURSO,
      inscripcion: {
        id: 4,
        alumno: {
          id: 10,
          nombre: "Yo",
          apellido: "Usuario",
          dni: "99999999",
          email: "yo@mail.com",
          celular: "1166778899",
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
          profesores: ["Prof. López"],
          tiposPago: [],
          inscripciones: [],
        },
        tipoPagoSeleccionado: {
          tipo: "MENSUAL" as any,
          monto: 15000,
        },
      },
      retraso: false,
      beneficioAplicado: 0,
    },
    {
      id: 6,
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
        profesores: [],
        tiposPago: [],
        inscripciones: [],
      },
      profesor: {
        id: 10,
        nombre: "Yo",
        apellido: "Profesor",
        dni: "99999999",
        email: "yo@mail.com",
        celular: "1166778899",
        estado: "ACTIVO" as any,
        primerLogin: false,
        listaRol: ["PROFESOR" as any],
      },
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
      await new Promise((resolve) => setTimeout(resolve, 800));

      let filtered = [...MOCK_PAGOS];
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((pago) => {
          const display = pagoToDisplay(pago);
          return (
            display.curso.toLowerCase().includes(query) ||
            display.usuarioRecibe.toLowerCase().includes(query)
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
      // const response = await pagoService.getPagosRealizados({
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
        <View style={styles.header}>
          <Text style={styles.title}>Pagos Realizados</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalElements}</Text>
          </View>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por curso o destinatario..."
          style={styles.searchBar}
        />

        {pagos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay pagos realizados</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No se encontraron pagos con ese criterio"
                : "Los pagos que realices aparecerán aquí"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.pagosList}>
              {pagos.map((pago) => (
                <PagoItem key={pago.id} pago={pagoToDisplay(pago)} />
              ))}
            </View>

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