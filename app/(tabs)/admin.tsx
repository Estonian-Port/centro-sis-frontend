import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  EstadoCurso,
  NuevoUsuario,
  Rol,
  Usuario,
  Estado,
  CursoResumen,
} from "@/model/model";
import { ViewToggle, ViewMode } from "@/components/ui/ViewToggle";
import CourseItem from "@/components/cards/CourseItem";
import { Button } from "@/components/ui/Button";
import { FilterChips, FilterOption } from "@/components/ui/FilterChip";
import { SearchBar } from "@/components/ui/SearchBar";
import CalendarioSemanal from "../calendario";
import Toast from "react-native-toast-message";
import { usuarioService } from "@/services/usuario.service";
import { useAuth } from "@/context/authContext";
import { cursoService } from "@/services/curso.service";
import UserItem from "@/components/cards/UserItem";
import { UserDetailModal } from "@/components/modals/UserDetailsModal";
import { CreateUserModal } from "@/components/modals/CreateUserModal";
import { CreateCourseModal } from "@/components/modals/CreateCourseModal";
import { COLORES } from "@/util/colores";
import { router } from "expo-router";
import { AvisoInvitacionModal } from "@/components/modals/AvisoInvitacionModal";
import { Ionicons } from "@expo/vector-icons";
import { TIPOGRAFIA } from "@/util/tipografia";
import { SafeAreaView } from "react-native-safe-area-context";
import { getErrorMessage } from "@/helper/auth.interceptor";
import { EventBus } from "@/util/EventBus";
import { administracionService } from "@/services/administracion.service";

// ============================================
// OPCIONES DE FILTROS
// ============================================

// Filtros de ROL
const rolFilterOptions: FilterOption<Rol>[] = [
  { value: Rol.ALUMNO, label: "Alumno", color: "#3b82f6" },
  { value: Rol.PROFESOR, label: "Profesor", color: "#10b981" },
  { value: Rol.OFICINA, label: "Oficina", color: "#f59e0b" },
  { value: Rol.ADMINISTRADOR, label: "Admin", color: "#ef4444" },
  { value: Rol.PORTERIA, label: "Portería", color: "#6b7280" },
];

// Filtros de ESTADO DE USUARIO
const estadoUsuarioFilterOptions: FilterOption<Estado>[] = [
  { value: Estado.ACTIVO, label: "Activo", color: "#10b981" },
  { value: Estado.INACTIVO, label: "Inactivo", color: "#6b7280" },
  { value: Estado.PENDIENTE, label: "Pendiente", color: "#f59e0b" },
];

// Filtros de ESTADO DE CURSO
const estadoCursoFilterOptions: FilterOption<EstadoCurso>[] = [
  { value: EstadoCurso.POR_COMENZAR, label: "Por Comenzar", color: "#3b82f6" },
  { value: EstadoCurso.EN_CURSO, label: "En Curso", color: "#10b981" },
  { value: EstadoCurso.FINALIZADO, label: "Finalizado", color: "#6b7280" },
];

// Filtros de ESTADO DE ALTA (para cursos)
const estadoAltaFilterOptions: FilterOption<Estado>[] = [
  { value: Estado.ACTIVO, label: "Activo", color: "#10b981" },
  { value: Estado.PENDIENTE, label: "Pendiente", color: "#f59e0b" },
  { value: Estado.BAJA, label: "Baja", color: "#ef4444" },
];

const PAGE_SIZE = 10;

type PaginatedResponse<T> = {
  content: T[];
  page: number;
  totalPages: number;
  totalElements: number;
};

interface UsePaginatedResourceParams<T, F> {
  enabled: boolean;
  filters: F;
  fetchPage: (pageNum: number, filters: F) => Promise<PaginatedResponse<T>>;
  onError: (error: unknown) => void;
}

function usePaginatedResource<T, F>({
  enabled,
  filters,
  fetchPage,
  onError,
}: UsePaginatedResourceParams<T, F>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const requestIdRef = useRef(0);
  const fetchPageRef = useRef(fetchPage);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
    onErrorRef.current = onError;
  });

  const filtersKey = JSON.stringify(filters);

  const load = useCallback(
    async (pageNum: number = 0) => {
      if (!enabled) return;

      const requestId = ++requestIdRef.current;
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const response = await fetchPageRef.current(pageNum, filters);

        // Si mientras esperábamos esta respuesta se disparó otra request
        // más nueva (cambio de filtro, etc.), descartamos esta por obsoleta.
        if (requestId !== requestIdRef.current) return;

        setItems((prev) =>
          pageNum === 0 ? response.content : [...prev, ...response.content],
        );
        setPage(response.page);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        if (requestId === requestIdRef.current) onErrorRef.current(error);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [enabled, filtersKey],
  );

  useEffect(() => {
    if (enabled) load(0);
  }, [enabled, filtersKey]);

  return {
    items,
    page,
    totalPages,
    totalElements,
    loading,
    loadingMore,
    load,
  };
}

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [vistaActual, setVistaActual] = useState<ViewMode>("lista");
  const [showConfigMatricula, setShowConfigMatricula] = useState(false);

  // ── Filtros usuarios ──────────────────────────────────────────────────────
  const [filtrosRol, setFiltrosRol] = useState<Rol[]>([]);
  const [filtrosEstadoUsuario, setFiltrosEstadoUsuario] = useState<Estado[]>([]);

  // ── Filtros cursos ────────────────────────────────────────────────────────
  const [filtrosEstadoCurso, setFiltrosEstadoCurso] = useState<EstadoCurso[]>([]);
  const [filtrosEstadoAlta, setFiltrosEstadoAlta] = useState<Estado[]>([]);
  
  // ── Modales ───────────────────────────────────────────────────────────────
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showModalDetailsUser, setShowModalDetailsUser] = useState(false);
  const [modalInvitacionVisible, setModalInvitacionVisible] = useState(false);
  const [selectedPendingCourse, setSelectedPendingCourse] = useState<CursoResumen | null>(null);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [descargandoQr, setDescargandoQr] = useState(false);

  const { usuario, selectedRole, isLoading } = useAuth();

  // Debounce search para no disparar una request por cada tecla
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (
      !isLoading &&
      selectedRole !== Rol.ADMINISTRADOR &&
      selectedRole !== Rol.OFICINA
    ) {
      router.replace("/(tabs)");
    }
  }, [isLoading, selectedRole]);

  // ── Fetch usuarios paginado ───────────────────────────────────────────────
  const usersFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      roles: filtrosRol.length > 0 ? filtrosRol : undefined,
      estados: filtrosEstadoUsuario.length > 0 ? filtrosEstadoUsuario : undefined,
    }),
    [debouncedSearch, filtrosRol, filtrosEstadoUsuario],
  );

  const fetchUsersPage = useCallback(
    (pageNum: number, filters: typeof usersFilters) => {
      if (!usuario) {
        return Promise.resolve({ content: [], page: 0, totalPages: 0, totalElements: 0 });
      }
      return usuarioService.getAllUsuariosPaginado(usuario.id, {
        page: pageNum,
        size: PAGE_SIZE,
        ...filters,
      });
    },
    [usuario],
  );

  const {
    items: users,
    page: userPage,
    totalPages: userTotalPages,
    totalElements: userTotalElements,
    loading: loadingUsers,
    loadingMore: loadingMoreUsers,
    load: fetchUsers,
  } = usePaginatedResource<Usuario, typeof usersFilters>({
    enabled: !!usuario && activeTab === "users",
    filters: usersFilters,
    fetchPage: fetchUsersPage,
    onError: (error) =>
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron cargar los usuarios",
      }),
  });

  // ── Fetch cursos paginado ────────────────────────────────────────────────
  const coursesFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      estadoAlta: filtrosEstadoAlta.length === 1 ? filtrosEstadoAlta[0] : undefined,
      estadoCurso: filtrosEstadoCurso.length === 1 ? filtrosEstadoCurso[0] : undefined,
    }),
    [debouncedSearch, filtrosEstadoAlta, filtrosEstadoCurso],
  );

  const fetchCoursesPage = useCallback(
    (pageNum: number, filters: typeof coursesFilters) => {
      if (!usuario) {
        return Promise.resolve({ content: [], page: 0, totalPages: 0, totalElements: 0 });
      }
      return cursoService.getResumenPaginado({
        page: pageNum,
        size: PAGE_SIZE,
        ...filters,
      });
    },
    [usuario],
  );

  const {
    items: courses,
    page: coursePage,
    totalPages: courseTotalPages,
    totalElements: courseTotalElements,
    loading: loadingCourses,
    loadingMore: loadingMoreCourses,
    load: fetchCourses,
  } = usePaginatedResource<CursoResumen, typeof coursesFilters>({
    enabled: !!usuario && activeTab === "courses",
    filters: coursesFilters,
    fetchPage: fetchCoursesPage,
    onError: (error) =>
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron cargar los cursos",
      }),
  });

  // ── Limpiar filtros al cambiar de tab ────────────────────────────────────
  useEffect(() => {
    setSearchQuery("");

    // Limpiar filtros de usuarios
    setFiltrosRol([]);
    setFiltrosEstadoUsuario([]);

    // Limpiar filtros de cursos
    setFiltrosEstadoCurso([]);
    setFiltrosEstadoAlta([]);
  }, [activeTab]);

  useEffect(() => {
    const handler = () => {
      if (activeTab === "courses") fetchCourses();
    };
    EventBus.on("cursoUpdated", handler);
    return () => {
      EventBus.off("cursoUpdated", handler);
    };
  }, [activeTab, fetchCourses]);

  useEffect(() => {
    const handler = async ({ cursoId }: { cursoId: number }) => {
      try {
        fetchCourses(0);
      } catch (error) {
        console.error(error);
      }
    };
    EventBus.on("alumnoBaja", handler);
    return () => EventBus.off("alumnoBaja", handler);
  }, [fetchCourses]);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleViewUserDetails = (user: Usuario) => {
    if (user.estado !== Estado.PENDIENTE) {
      setSelectedUser(user);
      setShowModalDetailsUser(true);
    } else {
      setSelectedUser(user);
      setModalInvitacionVisible(true);
    }
  };

  const handleViewCourseDetails = (course: CursoResumen) => {
    router.push(`/curso/${course.id}/alumnos`);
  };

  const handleEditPendingCourse = (course: CursoResumen) => {
    setSelectedPendingCourse(course);
    setShowEditCourseModal(true);
  };

  const bajaCurso = async (cursoId: number) => {
    try {
      await cursoService.bajaCurso(cursoId);
      fetchCourses();
      Toast.show({
        type: "success",
        text1: "Curso dado de baja",
        text2: `El curso ha sido dado de baja del sistema.`,
        position: "bottom",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo dar de baja el curso.",
        position: "bottom",
      });
    }
  };

  const altaUsuario = async (nuevoUsuario: NuevoUsuario) => {
    try {
      const response = await usuarioService.altaUsuario(nuevoUsuario);
      Toast.show({
        type: "success",
        text1: "Invitación enviada",
        text2: `La invitación ha sido enviada a ${nuevoUsuario.email}.`,
        position: "bottom",
      });
      fetchUsers();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo crear el usuario.",
        position: "bottom",
      });
    }
  };

  const handleDescargarTodosQr = async () => {
    setDescargandoQr(true);
    try {
      await administracionService.descargarTodosQr();

      Toast.show({
        type: "success",
        text1: "✅ QR Descargados",
        text2: "Los códigos QR se están descargando",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error descargando QR:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron descargar los QR",
        position: "bottom",
      });
    } finally {
      setDescargandoQr(false);
    }
  };

  // ── Toggles de filtros ────────────────────────────────────────────────────
  const toggleFiltroRol = (rol: Rol) =>
    setFiltrosRol((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol],
    );

  const toggleFiltroEstadoUsuario = (estado: Estado) =>
    setFiltrosEstadoUsuario((prev) =>
      prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado],
    );

  const toggleFiltroEstadoCurso = (estado: EstadoCurso) =>
    setFiltrosEstadoCurso((prev) =>
      prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado],
    );

  const toggleFiltroEstadoAlta = (estado: Estado) =>
    setFiltrosEstadoAlta((prev) =>
      prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado],
    );

  // Limpiar filtros
  const limpiarFiltrosUsuarios = () => {
    setFiltrosRol([]);
    setFiltrosEstadoUsuario([]);
  };

  const limpiarFiltrosCursos = () => {
    setFiltrosEstadoCurso([]);
    setFiltrosEstadoAlta([]);
  };

  // ── Contadores de filtros activos ─────────────────────────────────────────
  const contadorFiltrosUsuarios = filtrosRol.length + filtrosEstadoUsuario.length;
  const contadorFiltrosCursos = filtrosEstadoCurso.length + filtrosEstadoAlta.length;

  if (!usuario) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Administración</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "users" && styles.activeTab]}
            onPress={() => setActiveTab("users")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "users" && styles.activeTabText,
              ]}
            >
              Usuarios
            </Text>
            {activeTab === "users" && contadorFiltrosUsuarios > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {contadorFiltrosUsuarios}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "courses" && styles.activeTab]}
            onPress={() => setActiveTab("courses")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "courses" && styles.activeTabText,
              ]}
            >
              Cursos
            </Text>
            {activeTab === "courses" && contadorFiltrosCursos > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {contadorFiltrosCursos}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Controls ───────────────────────────────────────────────────────── */}
      <View style={styles.controls}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Buscar ${activeTab === "users" ? "usuarios" : "cursos"}...`}
        />

        {/* Toggle vista solo en cursos */}
        {activeTab === "courses" && (
          <ViewToggle
            currentView={vistaActual}
            onViewChange={setVistaActual}
            availableViews={["lista", "calendario"]}
          />
        )}

        {activeTab === "users" && Platform.OS === "web" && (
          <TouchableOpacity
            style={styles.downloadQrButton}
            onPress={handleDescargarTodosQr}
            disabled={descargandoQr}
          >
            <Ionicons name="qr-code-outline" size={14} color="#fff" />
            <Text style={styles.downloadQrText}>
              {descargandoQr ? "Generando" : "Descargar QR"}
            </Text>
            {descargandoQr && <ActivityIndicator size="small" color="#fff" />}
          </TouchableOpacity>
        )}

        {activeTab === "users" && selectedRole === Rol.ADMINISTRADOR && (
          <Button
            title="Matrícula"
            variant="outline"
            size="small"
            onPress={() => setShowConfigMatricula(true)}
          />
        )}

        <Button
          title={`Crear ${activeTab === "users" ? "Usuario" : "Curso"}`}
          variant="primary"
          size="small"
          onPress={
            activeTab === "users"
              ? () => setShowCreateUserModal(true)
              : () => setShowCreateCourseModal(true)
          }
        />
      </View>

      {/* ── Filtros usuarios ────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {/* Filtros de Rol */}
            <View style={styles.filterGroup}>
              <FilterChips
                options={rolFilterOptions}
                selectedValues={filtrosRol}
                onToggle={toggleFiltroRol}
              />
            </View>

            {/* Separador */}
            <View style={styles.filterSeparator} />

            {/* Filtros de Estado */}
            <View style={styles.filterGroup}>
              <FilterChips
                options={estadoUsuarioFilterOptions}
                selectedValues={filtrosEstadoUsuario}
                onToggle={toggleFiltroEstadoUsuario}
              />
            </View>

            {/* Botón limpiar filtros */}
            {contadorFiltrosUsuarios > 0 && (
              <>
                <View style={styles.filterSeparator} />
                <TouchableOpacity
                  style={styles.clearFiltersButtonCompact}
                  onPress={limpiarFiltrosUsuarios}
                >
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      )}

      {/* ── Filtros cursos ──────────────────────────────────────────────────── */}
      {activeTab === "courses" && (
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {/* Filtros de Estado del Curso */}
            <View style={styles.filterGroup}>
              <FilterChips
                options={estadoCursoFilterOptions}
                selectedValues={filtrosEstadoCurso}
                onToggle={toggleFiltroEstadoCurso}
              />
            </View>

            {/* Separador */}
            <View style={styles.filterSeparator} />

            {/* Filtros de Estado de Alta */}
            <View style={styles.filterGroup}>
              <FilterChips
                options={estadoAltaFilterOptions}
                selectedValues={filtrosEstadoAlta}
                onToggle={toggleFiltroEstadoAlta}
              />
            </View>

            {/* Botón limpiar filtros */}
            {contadorFiltrosCursos > 0 && (
              <>
                <View style={styles.filterSeparator} />
                <TouchableOpacity
                  style={styles.clearFiltersButtonCompact}
                  onPress={limpiarFiltrosCursos}
                >
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      )}

      {/* ── Contenido ──────────────────────────────────────────────────────── */}
      <ScrollView style={styles.content}>
        {activeTab === "users" && (
          <View style={styles.tableContainer}>
            {loadingUsers ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Cargando usuarios...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultCount}>
                  {userTotalElements}{" "}
                  {userTotalElements === 1 ? "usuario" : "usuarios"}
                </Text>

                {users.length > 0 ? (
                  users.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      handleUserDetails={(u: Usuario) => handleViewUserDetails(u)}
                      onRefresh={() => fetchUsers(0)}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#9ca3af" />
                    <Text style={styles.emptyText}>
                      No hay usuarios que coincidan con los filtros
                    </Text>
                  </View>
                )}

                {/* Cargar más usuarios */}
                {userPage < userTotalPages - 1 && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => fetchUsers(userPage + 1)}
                    disabled={loadingMoreUsers}
                  >
                    {loadingMoreUsers ? (
                      <ActivityIndicator size="small" color="#3b82f6" />
                    ) : (
                      <>
                        <Text style={styles.loadMoreText}>Cargar más</Text>
                        <Ionicons name="chevron-down" size={20} color="#3b82f6" />
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {users.length > 0 && (
                  <Text style={styles.pageInfo}>
                    Página {userPage + 1} de {userTotalPages} •{" "}
                    {userTotalElements} usuarios
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === "courses" && (
          <>
            {vistaActual === "lista" ? (
              <View style={styles.tableContainer}>
                {loadingCourses ? (
                  <View style={styles.loadingInline}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Cargando cursos...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.resultCount}>
                      {courseTotalElements}{" "}
                      {courseTotalElements === 1 ? "curso" : "cursos"}
                    </Text>

                    {courses.length > 0 ? (
                      courses.map((curso) => (
                        <CourseItem
                          key={curso.id}
                          course={curso as any}
                          handleCourseDetails={() => handleViewCourseDetails(curso)}
                          onEditPendingCourse={() => handleEditPendingCourse(curso)}
                          onDarDeBaja={(cursoId: number) => bajaCurso(cursoId)}
                        />
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={48} color="#9ca3af" />
                        <Text style={styles.emptyText}>
                          No hay cursos que coincidan con los filtros
                        </Text>
                      </View>
                    )}

                    {/* Cargar más cursos */}
                    {coursePage < courseTotalPages - 1 && (
                      <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={() => fetchCourses(coursePage + 1)}
                        disabled={loadingMoreCourses}
                      >
                        {loadingMoreCourses ? (
                          <ActivityIndicator size="small" color="#3b82f6" />
                        ) : (
                          <>
                            <Text style={styles.loadMoreText}>Cargar más</Text>
                            <Ionicons
                              name="chevron-down"
                              size={20}
                              color="#3b82f6"
                            />
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {courses.length > 0 && (
                      <Text style={styles.pageInfo}>
                        Página {coursePage + 1} de {courseTotalPages} •{" "}
                        {courseTotalElements} cursos
                      </Text>
                    )}
                  </>
                )}
              </View>
            ) : (
              <CalendarioSemanal
                cursos={courses as any}
                onCursoPress={handleViewCourseDetails as any}
              />
            )}
          </>
        )}

        {/* Modals 
        <ConfigurarMatriculaModal
          visible={showConfigMatricula}
          onClose={() => setShowConfigMatricula(false)}
          usuarioId={usuario.id}
        />*/}

        <CreateUserModal
          visible={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={(nuevoUsuario) => altaUsuario(nuevoUsuario)}
        />

        <CreateCourseModal
          visible={showCreateCourseModal}
          onClose={() => {
            setShowCreateCourseModal(false);
            fetchCourses();
          }}
        />

        {selectedUser && selectedUser.estado !== Estado.PENDIENTE && (
          <UserDetailModal
            visible={showModalDetailsUser}
            onClose={() => {
              setShowModalDetailsUser(false);
              setSelectedUser(null);
            }}
            idUsuario={selectedUser.id}
            fetchUsers={fetchUsers}
          />
        )}

        {selectedUser && selectedUser.estado === Estado.PENDIENTE && (
          <AvisoInvitacionModal
            visible={modalInvitacionVisible}
            onClose={() => {
              setModalInvitacionVisible(false);
              setSelectedUser(null);
            }}
            usuario={selectedUser}
            onConfirmar={async () => {
              try {
                await usuarioService.reenviarInvitacion(
                  selectedUser.id,
                  usuario.id,
                );
              } catch (error) {
                console.error("Error reenviando mail de invitación:", error);
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filtersSection: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filtersScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 4,
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterSeparator: {
    width: 1,
    height: 32,
    backgroundColor: "#e5e7eb",
  },
  clearFiltersButtonCompact: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#fef2f2",
  },
  content: {
    flex: 1,
  },
  tableContainer: {
    padding: 20,
    gap: 8,
  },
  loadingInline: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORES.violeta,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
  },
  filterBadge: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.violeta,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#9ca3af",
  },
  title: {
    ...TIPOGRAFIA.titleL,
    color: COLORES.textPrimary,
    marginBottom: 8,
  },
  downloadQrButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORES.violeta,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadQrText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
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
    marginBottom: 8,
  },
});