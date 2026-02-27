import { useState, useMemo, useEffect } from "react";
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
  Curso,
  EstadoCurso,
  NuevoUsuario,
  Rol,
  Usuario,
  Estado,
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
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
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

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [vistaActual, setVistaActual] = useState<ViewMode>("lista");

  // Filtros para USUARIOS
  const [filtrosRol, setFiltrosRol] = useState<Rol[]>([]);
  const [filtrosEstadoUsuario, setFiltrosEstadoUsuario] = useState<Estado[]>(
    [],
  );

  // Filtros para CURSOS
  const [filtrosEstadoCurso, setFiltrosEstadoCurso] = useState<EstadoCurso[]>(
    [],
  );
  const [filtrosEstadoAlta, setFiltrosEstadoAlta] = useState<Estado[]>([]);

  const [courses, setCourses] = useState<Curso[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showModalDetailsUser, setShowModalDetailsUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();
  const [modalInvitacionVisible, setModalInvitacionVisible] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [selectedPendingCourse, setSelectedPendingCourse] =
    useState<Curso | null>(null);
  const [descargandoQr, setDescargandoQr] = useState(false);

  useEffect(() => {
    if (!usuario) {
      return;
    }
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchCourses();
    }
  }, [activeTab, usuario]);

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
  }, [activeTab]);

  useEffect(() => {
    const handler = async ({ cursoId }: { cursoId: number }) => {
      // Busca el curso actualizado
      const updatedCurso = await cursoService.getById(cursoId);
      // Actualiza solo ese curso en el array de courses
      setCourses((prevCourses) =>
        prevCourses.map((c) => (c.id === updatedCurso.id ? updatedCurso : c)),
      );
    };
    EventBus.on("alumnoBaja", handler);
    return () => EventBus.off("alumnoBaja", handler);
  }, []);

  const fetchUsers = async () => {
    if (!usuario) {
      return;
    }

    setLoading(true);
    try {
      const data = await usuarioService.getAllUsuarios(usuario.id);
      setUsers(data);
    } catch (error) {
      console.error("[fetchUsers] Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!usuario) {
      return;
    }

    setLoading(true);
    try {
      const data = await cursoService.getAllCursos();
      setCourses(data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron cargar los cursos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetails = (user: Usuario) => {
    if (user.estado !== "PENDIENTE") {
      setSelectedUser(user);
      setShowModalDetailsUser(true);
    } else {
      setSelectedUser(user);
      setModalInvitacionVisible(true);
    }
  };

  const handleViewCourseDetails = (course: Curso) => {
    router.push(`/curso/${course.id}/alumnos`);
  };

  const handleEditPendingCourse = (course: Curso) => {
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

  // ============================================
  // TOGGLES DE FILTROS
  // ============================================

  const toggleFiltroRol = (rol: Rol) => {
    setFiltrosRol((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol],
    );
  };

  const toggleFiltroEstadoUsuario = (estado: Estado) => {
    setFiltrosEstadoUsuario((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado],
    );
  };

  const toggleFiltroEstadoCurso = (estado: EstadoCurso) => {
    setFiltrosEstadoCurso((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado],
    );
  };

  const toggleFiltroEstadoAlta = (estado: Estado) => {
    setFiltrosEstadoAlta((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado],
    );
  };

  // Limpiar filtros
  const limpiarFiltrosUsuarios = () => {
    setFiltrosRol([]);
    setFiltrosEstadoUsuario([]);
  };

  const limpiarFiltrosCursos = () => {
    setFiltrosEstadoCurso([]);
    setFiltrosEstadoAlta([]);
  };

  // ============================================
  // FILTRADO DE USUARIOS
  // ============================================

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.dni.includes(searchQuery),
      );
    }

    // Filtrar por rol
    if (filtrosRol.length > 0) {
      filtered = filtered.filter((user) =>
        filtrosRol.some((rol) => user.listaRol.includes(rol)),
      );
    }

    // Filtrar por estado de usuario
    if (filtrosEstadoUsuario.length > 0) {
      filtered = filtered.filter((user) =>
        filtrosEstadoUsuario.includes(user.estado),
      );
    }

    return filtered;
  }, [users, searchQuery, filtrosRol, filtrosEstadoUsuario]);

  // ============================================
  // FILTRADO DE CURSOS
  // ============================================

  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.profesores.some((p) =>
            p.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Filtrar por estado de curso
    if (filtrosEstadoCurso.length > 0) {
      filtered = filtered.filter((course) =>
        filtrosEstadoCurso.includes(course.estado),
      );
    }

    // Filtrar por estado de alta
    if (filtrosEstadoAlta.length > 0) {
      filtered = filtered.filter((course) =>
        filtrosEstadoAlta.includes(course.estadoAlta),
      );
    }

    return filtered;
  }, [courses, searchQuery, filtrosEstadoCurso, filtrosEstadoAlta]);

  // Contador de filtros activos
  const contadorFiltrosUsuarios =
    filtrosRol.length + filtrosEstadoUsuario.length;
  const contadorFiltrosCursos =
    filtrosEstadoCurso.length + filtrosEstadoAlta.length;

  if (!usuario) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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

      {/* Controls: Búsqueda + Toggle vista + Botón crear */}
      <View style={styles.controls}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Buscar ${
            activeTab === "users" ? "usuarios" : "cursos"
          }...`}
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

      {/* Filtros para USUARIOS - Una línea horizontal */}
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

      {/* Filtros para CURSOS - Una línea horizontal */}
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

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === "users" && (
          <View style={styles.tableContainer}>
            {/* Contador de resultados */}
            <Text style={styles.resultCount}>
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "usuario" : "usuarios"}
            </Text>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserItem
                  key={user.id}
                  user={user}
                  handleUserDetails={(u: Usuario) => handleViewUserDetails(u)}
                  onRefresh={fetchUsers}
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
          </View>
        )}

        {activeTab === "courses" && (
          <>
            {vistaActual === "lista" ? (
              <View style={styles.tableContainer}>
                {/* Contador de resultados */}
                <Text style={styles.resultCount}>
                  {filteredCourses.length}{" "}
                  {filteredCourses.length === 1 ? "curso" : "cursos"}
                </Text>

                {filteredCourses.length > 0 ? (
                  filteredCourses.map((curso) => (
                    <CourseItem
                      key={curso.id}
                      course={curso}
                      handleCourseDetails={handleViewCourseDetails}
                      onEditPendingCourse={handleEditPendingCourse}
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
              </View>
            ) : (
              <CalendarioSemanal
                cursos={filteredCourses as any}
                onCursoPress={handleViewCourseDetails}
              />
            )}
          </>
        )}

        {/* Modals */}
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

        {selectedUser && selectedUser.estado !== "PENDIENTE" && (
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

        {selectedUser && selectedUser.estado === "PENDIENTE" && (
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
});
