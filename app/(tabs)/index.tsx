import { CreateCourseModal } from "@/components/modals/CreateCourseModal";
import { CreateUserModal } from "@/components/modals/CreateUserModal";
import { useAuth } from "@/context/authContext";
import {
  CursoAlumno,
  CursoProfesor,
  formatEstadoPago,
  Rol,
} from "@/model/model";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Tag } from "../../components/ui/Tag";
import { cursoService } from "../../services/curso.service";
import { SafeAreaView } from "react-native-safe-area-context";
import { administracionService } from "@/services/administracion.service";

export default function HomeScreen() {
  const { selectedRole, usuario } = useAuth();
  const navigation = useNavigation();
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [curso, setCurso] = useState<CursoAlumno>();
  const [cursoProfesor, setCursoProfesor] = useState<CursoProfesor[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    alumnosActivos: 0,
    cursos: 0,
    profesores: 0,
    ingresosMensuales: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (usuario != null && selectedRole === Rol.ALUMNO) {
        let listaCursos = await cursoService.getAllByAlumno(usuario.id);
        setCurso(listaCursos[0]);
      }
      if (usuario != null && selectedRole === Rol.PROFESOR) {
        let listaCursos = await cursoService.getAllByProfesor(usuario.id);
        setCursoProfesor(listaCursos);
      }
      if (selectedRole === Rol.ADMINISTRADOR) {
        const stats = await administracionService.getEstadisticas();
        setEstadisticas(stats);
      }
    };
    fetchData();
  }, [selectedRole, usuario]);

  const handleVerPagos = () => {
    Alert.alert("Ver Pagos", "Navegando a historial de pagos...");
    // navigation.navigate('Pagos'); // Descomentar cuando tengas la pantalla
  };

  const handleVerAccesos = () => {
    Alert.alert("Ver Accesos", "Navegando a control de accesos...");
    // navigation.navigate('Accesos'); // Descomentar cuando tengas la pantalla
  };

  const handleVerCursoDetalle = (
    cursoNombre: string,
    cantidadAlumnos: number
  ) => {
    Alert.alert(
      "Detalle del Curso",
      `${cursoNombre}\n${cantidadAlumnos} alumnos activos`
    );
    // navigation.navigate('CursoDetalle', { cursoId: id }); // Descomentar cuando tengas la pantalla
  };

  const handleCrearUsuario = () => {
    console.log("Opening create user modal");
    setShowCreateUserModal(true);
  };

  const handleCrearCurso = () => {
    console.log("Opening create course modal");
    setShowCreateCourseModal(true);
  };

  const handleGestionarUsuarios = () => {
    // @ts-ignore - Navigation types
    navigation.navigate("Admin");
  };

  const handleModalSuccess = () => {
    Alert.alert("Éxito", "Operación completada exitosamente");
    // Aquí podrías recargar datos si fuera necesario
  };

  const renderAlumnoView = () => (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>Mis Cursos</Text>
        {curso ? (
          <Card style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseName}>{curso?.nombre}</Text>
              <Tag label="ACTIVO" variant="success" />
            </View>
            <View style={styles.courseDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text style={styles.detailText}>
                  {curso?.horarios.map((h) => h.dia).join(", ")}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.detailText}>
                  {curso?.horarios
                    .map((h) => `${h.horaInicio} - ${h.horaFin}`)
                    .join(", ")}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={16} color="#6b7280" />
                <Text style={styles.detailText}>${curso?.arancel} / mes</Text>
              </View>
            </View>
            <View style={styles.beneficios}>
              <Text style={styles.beneficiosTitle}>Beneficios:</Text>
              <View style={styles.tagContainer}>
                <Tag label="Pago total" variant="info" />
                <Tag label="Familiar" variant="default" />
              </View>
            </View>
            <View style={styles.paymentStatus}>
              <Text style={styles.paymentText}>
                Estado de pago:{" "}
                <Text style={styles.paidText}>
                  {formatEstadoPago(curso?.estadoPago)}
                </Text>
              </Text>
            </View>
            <View style={styles.actions}>
              <Button
                title="Ver Pagos"
                variant="outline"
                size="small"
                onPress={handleVerPagos}
                style={styles.actionButton}
              />
              <Button
                title="Ver Accesos"
                variant="outline"
                size="small"
                onPress={handleVerAccesos}
                style={styles.actionButton}
              />
            </View>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons
                name="information-circle-outline"
                size={36}
                color="#6b7280"
              />
              <Text style={styles.emptyText}>
                No estás inscrito en ningún curso.
              </Text>
            </View>
          </Card>
        )}
      </SafeAreaView>
    </ScrollView>
  );

  const renderProfesorView = () => (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>Dashboard - Profesor</Text>
        {cursoProfesor.map((curso) => (
          <Card key={curso.id}>
            <Text style={styles.cardTitle}>Mis Cursos</Text>
            <TouchableOpacity
              style={styles.courseItem}
              onPress={() => handleVerCursoDetalle("Matemáticas Básicas", 12)}
            >
              <View>
                <Text style={styles.courseName}>{curso.nombre}</Text>
                <Text style={styles.courseInfo}>
                  {curso.alumnosInscriptos} alumnos activos
                </Text>
                <Text style={styles.courseInfo}>
                  {curso?.horarios.map((h) => h.dia).join(", ")}
                </Text>
                <Text style={styles.courseInfo}>
                  {curso.horarios
                    .map((h) => `${h.horaInicio} - ${h.horaFin}`)
                    .join(", ")}
                </Text>
                <Text style={styles.courseInfo}>
                  Inicio del curso: {curso.fechaInicio}
                </Text>
                <Text style={styles.courseInfo}>
                  Fin del curso: {curso.fechaFin}
                </Text>
                <Text style={styles.courseInfo}>{curso.estado}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </Card>
        ))}
        <Card>
          <Text style={styles.cardTitle}>Resumen del Mes</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>20</Text>
              <Text style={styles.statLabel}>Alumnos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Asistencia</Text>
            </View>
          </View>
        </Card>
      </SafeAreaView>
    </ScrollView>
  );

  const renderAdminView = () => (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>Dashboard - Administrador</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{estadisticas.alumnosActivos}</Text>
            <Text style={styles.statLabel}>Alumnos Activos</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{estadisticas.cursos}</Text>
            <Text style={styles.statLabel}>Cursos Activos</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{estadisticas.profesores}</Text>
            <Text style={styles.statLabel}>Profesores</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>
              ${estadisticas.ingresosMensuales}
            </Text>
            <Text style={styles.statLabel}>Ingresos Mes</Text>
          </Card>
        </View>
        <Card>
          <Text style={styles.cardTitle}>Acciones Rápidas</Text>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleCrearUsuario}
          >
            <Ionicons name="person-add-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Crear Usuario</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleCrearCurso}
          >
            <Ionicons name="library-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Crear Curso</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleGestionarUsuarios}
          >
            <Ionicons name="people-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Gestionar Usuarios</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </Card>
      </SafeAreaView>

      <CreateUserModal
        visible={showCreateUserModal}
        onClose={() => {
          console.log("Closing create user modal");
          setShowCreateUserModal(false);
        }}
        onSuccess={handleModalSuccess}
      />

      <CreateCourseModal
        visible={showCreateCourseModal}
        onClose={() => {
          console.log("Closing create course modal");
          setShowCreateCourseModal(false);
        }}
        onSuccess={handleModalSuccess}
      />
    </ScrollView>
  );

  const renderContent = () => {
    switch (selectedRole) {
      case Rol.ALUMNO:
        return renderAlumnoView();
      case Rol.PROFESOR:
        return renderProfesorView();
      case Rol.ADMINISTRADOR:
        return renderAdminView();
      default:
        return (
          <View style={styles.emptyState}>
            <Text>Selecciona un rol para continuar</Text>
          </View>
        );
    }
  };

  return renderContent();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  courseCard: {
    marginBottom: 16,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  courseDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  beneficios: {
    marginBottom: 12,
  },
  beneficiosTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paymentStatus: {
    marginBottom: 16,
  },
  paymentText: {
    fontSize: 14,
    color: "#6b7280",
  },
  paidText: {
    color: "#059669",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  courseInfo: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    alignItems: "center",
    paddingVertical: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCard: {
    marginTop: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});
