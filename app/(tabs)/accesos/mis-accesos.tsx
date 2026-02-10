import { MultiSelect, MultiSelectOption } from "@/components/ui/MultiSelect";
import { Acceso } from "@/model/model";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/authContext";
import { accesoService } from "@/services/acceso.service";
import { AccesoItem } from "@/components/accesos/AccesoItem";
import { getErrorMessage } from "@/helper/auth.interceptor";

type Mes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export default function MisAccesosScreen() {
  const { usuario } = useAuth();

  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtro
  const [selectedMeses, setSelectedMeses] = useState<Mes[]>([]);

  const PAGE_SIZE = 20;

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
    if (usuario) {
      fetchAccesos(0);
    }
  }, [selectedMeses, usuario]);

  const fetchAccesos = async (pageNum: number = 0) => {
    if (!usuario) return;

    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await accesoService.getMisAccesos(usuario.id, {
        page: pageNum,
        size: PAGE_SIZE,
        meses: selectedMeses.length > 0 ? selectedMeses : undefined,
      });

      if (pageNum === 0) {
        setAccesos(response.content);
      } else {
        setAccesos((prev) => [...prev, ...response.content]);
      }

      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching accesos:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron cargar los accesos",
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages - 1 && !loadingMore) {
      fetchAccesos(page + 1);
    }
  };

  const handleToggleMes = (mes: Mes) => {
    setSelectedMeses((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando accesos...</Text>
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
          <Text style={styles.title}>Mis Accesos</Text>
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

        {/* Lista de Accesos */}
        {accesos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={selectedMeses.length > 0 ? "search" : "log-in-outline"}
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>
              {selectedMeses.length > 0
                ? "No se encontraron accesos"
                : "No hay accesos registrados"}
            </Text>
            <Text style={styles.emptyText}>
              {selectedMeses.length > 0
                ? "Intenta con otros meses"
                : "Tus accesos al centro aparecerán aquí"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.accesosList}>
              {accesos.map((acc) => (
                <AccesoItem key={acc.id} acceso={acc} />
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
              Página {page + 1} de {totalPages} • {totalElements} accesos
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
  accesosList: {
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
