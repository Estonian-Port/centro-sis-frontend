import { CreateCourseModal } from "@/components/modals/CreateCourseModal";
import { CreateUserModal } from "@/components/modals/CreateUserModal";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { useAuth } from "@/context/authContext";
import {
  Curso,
  EstadoUsuario,
  NuevoUsuario,
  Rol,
  Usuario,
} from "@/model/model";
import { cursoService } from "@/services/curso.service";
import { usuarioService } from "@/services/usuario.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarioProfesor } from "../calendario";
import { COLORES } from "@/util/colores";
import Toast from "react-native-toast-message";
import { UserDetailModal } from "@/components/modals/UserDetailsModal";
import { estadoUsuarioToTagVariant, rolToTagVariant } from "@/helper/funciones";
import { CourseDetailModal } from "@/components/modals/CouseDetailsModal";
import CourseItem from "@/components/cards/CourseItem";

export default function AdminScreen() {
  const { usuario } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");
  const [users, setUsers] = useState<Usuario[]>([]);
  const [courses, setCourses] = useState<Curso[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showModalDetailsUser, setShowModalDetailsUser] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null);
  const [showModalDetailsCourse, setShowModalDetailsCourse] = useState(false);
  const [vistaActual, setVistaActual] = useState<"lista" | "calendario">(
    "lista"
  );

  // Nuevos estados para filtros
  const [filtrosRol, setFiltrosRol] = useState<Rol[]>([]);

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
    setSelectedCourse(course);
    setShowModalDetailsCourse(true);
  };

  const handleToggleUserStatus = async (user: Usuario) => {
    const newStatus =
      user.estado === EstadoUsuario.ACTIVO
        ? EstadoUsuario.INACTIVO
        : EstadoUsuario.ACTIVO;

    Alert.alert(
      "Cambiar Estado",
      `¿Estás seguro de ${
        newStatus === EstadoUsuario.ACTIVO ? "dar de alta" : "dar de baja"
      } a ${user.nombre} ${user.apellido}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await usuarioService.toggleEstadoUsuario(user.id);
              fetchUsers();
              Toast.show({
                type: "success",
                text1: "Estado actualizado",
                text2: `${user.nombre} ${user.apellido} ahora está ${newStatus}`,
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "No se pudo actualizar el estado",
              });
            }
          },
        },
      ]
    );
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

  // Cursos filtrados
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;

    return courses.filter(
      (course) =>
        course.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.profesores.some((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [courses, searchQuery]);

  // Render fila de usuario (tabla compacta)
  const renderUserRow = (user: Usuario) => (
    <TouchableOpacity
      key={user.id}
      style={styles.tableRow}
      onPress={() => handleViewUserDetails(user)}
      activeOpacity={0.7}
    >
      <View style={styles.userMainInfo}>
        <Text style={styles.userName}>
          {user.nombre} {user.apellido}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.userMetaInfo}>
        <View style={styles.tagsContainer}>
          <View style={styles.rolesContainer}>
            {user.listaRol.map((rol) => (
              <Tag key={rol} label={rol} variant={rolToTagVariant(rol)} />
            ))}
          </View>

          <Tag
            label={user.estado}
            variant={estadoUsuarioToTagVariant(user.estado)}
          />
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleToggleUserStatus(user);
          }}
        >
          <Ionicons
            name={
              user.estado === EstadoUsuario.ACTIVO
                ? "trash-outline"
                : "checkmark-circle-outline"
            }
            size={20}
            color={
              user.estado === EstadoUsuario.ACTIVO
                ? COLORES.error
                : COLORES.success
            }
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Administración</Text>

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

      {/* Filtros de Rol (solo en tab usuarios) */}
      {activeTab === "users" && (
        <View style={styles.filtrosContainer}>
          <Text style={styles.filtrosLabel}>Filtrar por rol:</Text>
          <View style={styles.filtrosChips}>
            {Object.values(Rol).map((rol) => (
              <TouchableOpacity
                key={rol}
                style={[
                  styles.filtroChip,
                  filtrosRol.includes(rol) && styles.filtroChipActive,
                ]}
                onPress={() => toggleFiltroRol(rol)}
              >
                <Text
                  style={[
                    styles.filtroChipText,
                    filtrosRol.includes(rol) && styles.filtroChipTextActive,
                  ]}
                >
                  {rol}
                </Text>
                {filtrosRol.includes(rol) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORES.violeta}
                    style={styles.filtroCheckIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar ${
              activeTab === "users" ? "usuarios" : "cursos"
            }...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Toggle vista (solo en cursos) */}
        {activeTab === "courses" && (
          <View style={styles.vistaToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                vistaActual === "lista" && styles.toggleButtonActive,
              ]}
              onPress={() => setVistaActual("lista")}
            >
              <Ionicons
                name="list"
                size={20}
                color={vistaActual === "lista" ? COLORES.blanco : "#6b7280"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                vistaActual === "calendario" && styles.toggleButtonActive,
              ]}
              onPress={() => setVistaActual("calendario")}
            >
              <Ionicons
                name="calendar"
                size={20}
                color={
                  vistaActual === "calendario" ? COLORES.blanco : "#6b7280"
                }
              />
            </TouchableOpacity>
          </View>
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
              filteredUsers.map(renderUserRow)
            ) : (
              <Text style={styles.emptyText}>No hay usuarios para mostrar</Text>
            )}
          </View>
        )}

        {activeTab === "courses" && (
          <>
            {vistaActual === "lista" ? (
              <View style={styles.tableContainer}>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((c) => (
                    <CourseItem
                      course={c}
                      handleCourseDetails={(c: Curso) =>
                        handleViewCourseDetails(c)
                      }
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No hay cursos para mostrar
                  </Text>
                )}
              </View>
            ) : (
              <CalendarioProfesor
                cursos={filteredCourses}
                onCursoPress={function (curso: Curso): void {
                  throw new Error("Function not implemented.");
                }}
              />
            )}
          </>
        )}
      </ScrollView>

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

      {selectedCourse && (
        <CourseDetailModal
          visible={showModalDetailsCourse}
          onClose={() => {
            setShowModalDetailsCourse(false);
            setSelectedCourse(null);
          }}
          cursoId={selectedCourse.id}
        />
      )}
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
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
    backgroundColor: "#3b82f6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
  },
  filtrosContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filtrosLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  filtrosChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filtroChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    gap: 4,
  },
  filtroChipActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  filtroChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  filtroChipTextActive: {
    color: "#3b82f6",
  },
  filtroCheckIcon: {
    marginLeft: 2,
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
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 8 : 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  vistaToggle: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#3b82f6",
  },
  content: {
    flex: 1,
  },
  tableContainer: {
    padding: 20,
    gap: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s",
      },
    }),
  },
  userMainInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
  userMetaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rolesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleTag: {
    marginRight: 0,
  },
  statusTag: {
    marginRight: 0,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f9fafb",
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  courseMainInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  courseHorarios: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  horarioChip: {
    fontSize: 12,
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontWeight: "500",
  },
  courseMetaInfo: {
    alignItems: "flex-end",
  },
  profesorName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 4,
  },
  alumnosCount: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 40,
  },
});
