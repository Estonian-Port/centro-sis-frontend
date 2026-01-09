import { useState, useMemo, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Curso, EstadoCurso, NuevoUsuario, Rol, Usuario } from "@/model/model";
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

// Definir opciones de filtro por rol (para usuarios)
const rolFilterOptions: FilterOption<Rol>[] = [
  { value: Rol.ALUMNO, label: "Alumno", color: "#3b82f6" },
  { value: Rol.PROFESOR, label: "Profesor", color: "#10b981" },
  { value: Rol.ADMINISTRADOR, label: "Admin", color: "#8b5cf6" },
  { value: Rol.OFICINA, label: "Oficina", color: "#f59e0b" },
];

// Definir opciones de filtro por estado
const estadoFilterOptions: FilterOption<EstadoCurso>[] = [
  { value: EstadoCurso.POR_COMENZAR, label: "Por Comenzar", color: "#3b82f6" },
  { value: EstadoCurso.EN_CURSO, label: "En Curso", color: "#10b981" },
  { value: EstadoCurso.FINALIZADO, label: "Finalizado", color: "#6b7280" },
  { value: EstadoCurso.PENDIENTE, label: "Pendiente", color: "#f59e0b" },
];

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [vistaActual, setVistaActual] = useState<ViewMode>("calendario");
  const [filtrosRol, setFiltrosRol] = useState<Rol[]>([]);
  const [filtrosEstado, setFiltrosEstado] = useState<EstadoCurso[]>([]);
  const [courses, setCourses] = useState<Curso[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showModalDetailsUser, setShowModalDetailsUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();

  // Cargar datos
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchCourses();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usuarioService.getAllUsuarios(usuario!.id);
      setUsers(data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await cursoService.getAllCursos();
      setCourses(data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los cursos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetails = (user: Usuario) => {
    setSelectedUser(user);
    setShowModalDetailsUser(true);
  };

  const handleViewCourseDetails = (course: Curso) => {
    router.push(`/curso/${course.id}/alumnos`);
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
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo crear el usuario.",
        position: "bottom",
      });
    }
  };
  // Toggle filtro de rol
  const toggleFiltroRol = (rol: Rol) => {
    setFiltrosRol((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  // Usuarios filtrados
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.dni.includes(searchQuery)
      );
    }

    // Filtrar por rol
    if (filtrosRol.length > 0) {
      filtered = filtered.filter((user) =>
        filtrosRol.some((rol) => user.listaRol.includes(rol))
      );
    }

    return filtered;
  }, [users, searchQuery, filtrosRol]);

  // Toggle filtro de estado
  const toggleFiltroEstado = (estado: EstadoCurso) => {
    setFiltrosEstado((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado]
    );
  };

  // Cursos filtrados
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.profesores.some((p) =>
            p.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filtrar por estado
    if (filtrosEstado.length > 0) {
      filtered = filtered.filter((course) =>
        filtrosEstado.includes(course.estado)
      );
    }

    return filtered;
  }, [courses, searchQuery, filtrosEstado]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con tabs */}
      <View style={styles.header}>
        {/* Tabs */}
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

        {/* Filtros por rol (solo en usuarios) */}
        {activeTab === "users" && (
          <FilterChips
            options={rolFilterOptions}
            selectedValues={filtrosRol}
            onToggle={toggleFiltroRol}
          />
        )}

        {/* Toggle vista solo en cursos */}
        {activeTab === "courses" && (
          <>
            <ViewToggle
              currentView={vistaActual}
              onViewChange={setVistaActual}
              availableViews={["calendario", "lista"]}
            />

            <FilterChips
              options={estadoFilterOptions}
              selectedValues={filtrosEstado}
              onToggle={toggleFiltroEstado}
            />
          </>
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

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === "users" && (
          <View style={styles.tableContainer}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserItem
                  key={user.id}
                  user={user}
                  handleUserDetails={(u: Usuario) => handleViewUserDetails(u)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No hay usuarios para mostrar</Text>
            )}
          </View>
        )}

        {activeTab === "courses" && (
          <>
            {vistaActual === "lista" ? (
              <View style={styles.tableContainer}>
                {filteredCourses.map((curso) => (
                  <CourseItem
                    key={curso.id}
                    course={curso}
                    handleCourseDetails={handleViewCourseDetails}
                  />
                ))}
              </View>
            ) : (
              <CalendarioSemanal
                cursos={filteredCourses}
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

        {selectedUser && (
          <UserDetailModal
            visible={showModalDetailsUser}
            onClose={() => {
              setShowModalDetailsUser(false);
              setSelectedUser(null);
            }}
            idUsuario={selectedUser.id}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
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
  content: {
    flex: 1,
  },
  tableContainer: {
    padding: 20,
    gap: 8,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
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
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 40,
  },
});
