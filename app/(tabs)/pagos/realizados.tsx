// app/(tabs)/pagos/realizados.tsx
import { PagoItem } from "@/components/pagos/PagoItem";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  Pago,
  PaginatedResponse,
  pagoToDisplay,
  TipoPagoConcepto,
  Rol,
  Estado,
  TipoCurso,
} from "@/model/model";
import { pagoService } from "@/services/pago.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useMemo } from "react";
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
import { useAuth } from "@/context/authContext";

type Mes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export default function PagosRealizadosScreen() {
  const { usuario } = useAuth(); // ✅ Corregido

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTipos, setSelectedTipos] = useState<TipoPagoConcepto[]>([]);
  const [selectedMeses, setSelectedMeses] = useState<Mes[]>([]);

  const PAGE_SIZE = 20;

  // 👤 MOCK PROFESOR
  const PROFESOR_GARCIA = {
    id: 100,
    nombre: "Ana",
    apellido: "García",
    dni: "55667788",
    email: "ana.garcia@mail.com",
    celular: "1144556677",
    fechaNacimiento: "1988-05-12",
    estado: "ACTIVO" as any,
    primerLogin: false,
    listaRol: ["PROFESOR" as any],
  };

  // 🎭 MOCK DATA - Pagos realizados según rol
  const MOCK_PAGOS: Pago[] = [
    // COMISION - Instituto → Profesor (Admin/Oficina realiza)
    {
      id: 1,
      monto: 25000,
      fecha: "2025-01-15T00:00:00",
      fechaBaja: null,
      observaciones: "Comisión mensual curso Taekwondo",
      tipo: TipoPagoConcepto.COMISION,
      curso: {
        id: 1,
        nombre: "Taekwondo Infantil",
        horarios: [],
        alumnosInscriptos: [],
        fechaInicio: "2025-01-01",
        fechaFin: "2025-12-31",
        estado: "EN_CURSO" as any,
        profesores: [PROFESOR_GARCIA],
        tiposPago: [],
        inscripciones: [],
        estadoAlta: Estado.ACTIVO,
        recargoPorAtraso: 0,
        tipoCurso: TipoCurso.ALQUILER,
      },
      profesor: PROFESOR_GARCIA,
    },
    // COMISION - Otra comisión
    {
      id: 2,
      monto: 30000,
      fecha: "2025-02-15T00:00:00",
      fechaBaja: null,
      observaciones: "Comisión mensual curso Yoga",
      tipo: TipoPagoConcepto.COMISION,
      curso: {
        id: 2,
        nombre: "Yoga Matutino",
        horarios: [],
        alumnosInscriptos: [],
        fechaInicio: "2025-01-01",
        fechaFin: "2025-12-31",
        estado: "EN_CURSO" as any,
        profesores: [PROFESOR_GARCIA],
        tiposPago: [],
        inscripciones: [],
        estadoAlta: Estado.ACTIVO,
        recargoPorAtraso: 0,
        tipoCurso: TipoCurso.COMISION,
      },
      profesor: PROFESOR_GARCIA,
    },
    // ALQUILER - Profesor → Instituto (Profesor realiza)
    {
      id: 3,
      monto: 50000,
      fecha: "2025-03-05T00:00:00",
      fechaBaja: null,
      observaciones: "Alquiler mensual sala Pilates",
      tipo: TipoPagoConcepto.ALQUILER,
      curso: {
        id: 3,
        nombre: "Pilates Avanzado",
        horarios: [],
        alumnosInscriptos: [],
        fechaInicio: "2025-01-01",
        fechaFin: "2025-12-31",
        estado: "EN_CURSO" as any,
        profesores: [PROFESOR_GARCIA],
        tiposPago: [],
        inscripciones: [],
        estadoAlta: Estado.ACTIVO,
        recargoPorAtraso: 0,
        tipoCurso: TipoCurso.ALQUILER,
      },
      profesor: PROFESOR_GARCIA,
    },
    // CURSO - Alumno → Instituto (curso comisión)
    {
      id: 4,
      monto: 15000,
      fecha: "2025-04-10T00:00:00",
      fechaBaja: null,
      observaciones: null,
      tipo: TipoPagoConcepto.CURSO,
      inscripcion: {
        id: 1,
        alumno: {
          id: 4,
          nombre: "Juan",
          apellido: "Pérez",
          dni: "12345678",
          email: "juan@mail.com",
          celular: "1122334455",
          fechaNacimiento: "1995-03-15",
          estado: "ACTIVO" as any,
          primerLogin: false,
          listaRol: ["ALUMNO" as any],
        },
        curso: {
          id: 1,
          nombre: "Taekwondo Infantil", // Curso comisión
          horarios: [],
          alumnosInscriptos: [],
          fechaInicio: "2025-01-01",
          fechaFin: "2025-12-31",
          estado: "EN_CURSO" as any,
          profesores: [PROFESOR_GARCIA],
          tiposPago: [],
          inscripciones: [],
          estadoAlta: Estado.ACTIVO,
          recargoPorAtraso: 0,
          tipoCurso: TipoCurso.COMISION,
        },
        tipoPagoSeleccionado: {
          tipo: "MENSUAL" as any,
          monto: 15000,
          cuotas: 1,
        },
      },
      retraso: false,
      beneficioAplicado: 10,
    },
    // CURSO - Alumno → Profesor (curso alquiler)
    {
      id: 5,
      monto: 18000,
      fecha: "2025-05-12T00:00:00",
      fechaBaja: null,
      observaciones: null,
      tipo: TipoPagoConcepto.CURSO,
      inscripcion: {
        id: 2,
        alumno: {
          id: 5,
          nombre: "María",
          apellido: "González",
          dni: "87654321",
          email: "maria@mail.com",
          celular: "1155667788",
          fechaNacimiento: "1992-07-22",
          estado: "ACTIVO" as any,
          primerLogin: false,
          listaRol: ["ALUMNO" as any],
        },
        curso: {
          id: 3,
          nombre: "Pilates Avanzado", // Curso alquiler
          horarios: [],
          alumnosInscriptos: [],
          fechaInicio: "2025-01-01",
          fechaFin: "2025-12-31",
          estado: "EN_CURSO" as any,
          profesores: [PROFESOR_GARCIA],
          tiposPago: [],
          inscripciones: [],
          estadoAlta: Estado.ACTIVO,
          recargoPorAtraso: 0,
          tipoCurso: TipoCurso.ALQUILER,
        },
        tipoPagoSeleccionado: {
          tipo: "MENSUAL" as any,
          monto: 18000,
          cuotas: 1,
        },
      },
      retraso: false,
      beneficioAplicado: 5,
    },
  ];

  // Determinar tipos de pago disponibles según rol
  const tiposPagoDisponibles = useMemo((): FilterOption<TipoPagoConcepto>[] => {
    if (!usuario) return [];

    const roles = usuario.listaRol;
    const isAdminOrOficina =
      roles.includes(Rol.ADMINISTRADOR) || roles.includes(Rol.OFICINA);
    const isProfesor = roles.includes(Rol.PROFESOR);
    const isAlumno = roles.includes(Rol.ALUMNO);

    if (isAdminOrOficina) {
      // Admin/Oficina realiza COMISION a profesores
      return [
        {
          value: TipoPagoConcepto.COMISION,
          label: "Comisión",
          color: "#8b5cf6",
        },
      ];
    }

    if (isProfesor) {
      // Profesor realiza ALQUILER al instituto
      return [
        {
          value: TipoPagoConcepto.ALQUILER,
          label: "Alquiler",
          color: "#10b981",
        },
      ];
    }

    if (isAlumno) {
      // Alumnos solo pagan CURSO (sin chips, siempre CURSO)
      return [];
    }

    return [];
  }, [usuario]);

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
    fetchPagos(0);
  }, [searchQuery, selectedTipos, selectedMeses]);

  const fetchPagos = async (pageNum: number = 0) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      let filtered = [...MOCK_PAGOS];

      // Filtrar por búsqueda
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

      // Filtrar por tipo de pago
      if (selectedTipos.length > 0) {
        filtered = filtered.filter((pago) => selectedTipos.includes(pago.tipo));
      }

      // Filtrar por mes
      if (selectedMeses.length > 0) {
        filtered = filtered.filter((pago) => {
          const fechaPago = new Date(pago.fecha);
          const mes = (fechaPago.getMonth() + 1) as Mes;
          return selectedMeses.includes(mes);
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
      //   tipos: selectedTipos,
      //   meses: selectedMeses,
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

  const handleToggleTipo = (tipo: TipoPagoConcepto) => {
    setSelectedTipos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
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

        {/* Filtros en una línea (Admin/Profesor) */}
        {tiposPagoDisponibles.length > 0 && (
          <View style={styles.filtersRow}>
            <Text style={styles.filterLabel}>Filtrar:</Text>

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
        )}

        {/* Solo filtro de meses (Alumno) */}
        {tiposPagoDisponibles.length === 0 && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filtrar por Mes:</Text>
            <MultiSelect
              options={mesFilterOptions}
              selectedValues={selectedMeses}
              onToggle={handleToggleMes}
              placeholder="Seleccionar meses"
            />
          </View>
        )}

        {pagos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay pagos realizados</Text>
            <Text style={styles.emptyText}>
              {searchQuery ||
              selectedTipos.length > 0 ||
              selectedMeses.length > 0
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
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginRight: 4,
  },
  multiSelectContainer: {
    flex: 1,
  },
  filterSection: {
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
