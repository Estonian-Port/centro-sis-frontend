import { CreateCourseModal } from '@/components/modals/CreateCourseModal';
import { CreateUserModal } from '@/components/modals/CreateUserModal';
import { useAuth } from '@/context/authContext';
import { Curso, Rol } from '@/model/model';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { CursoCardAlumno } from '@/components/cards/curso/CursoCardAlumno';
import { CursoCardProfesor } from '@/components/cards/curso/CursoCardProfesor';
import { StatCard } from '@/components/cards/stats/StatCard';
import { StatRow } from '@/components/cards/stats/StatRow';
import { AdminActionItem } from '@/components/cards/admin/AdminActionItem';
import { cursoService } from '@/services/curso.service';

export default function HomeScreen() {
  const { selectedRole, usuario } = useAuth();
  const navigation = useNavigation();
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [listaCurso, setListaCurso] = useState<Curso[]>();

  useEffect(() => {
    const fetchData = async () => {
      if (usuario != null) {
        const listaCursos = await cursoService.getAllByUsuario(usuario.id);
        console.log(listaCurso)
        setListaCurso(listaCursos);
      }
    };
    fetchData();
  }, [selectedRole]);

  const handleVerPagos = () => {
    Alert.alert('Ver Pagos', 'Navegando a historial de pagos...');
  };

  const handleVerAccesos = () => {
    Alert.alert('Ver Accesos', 'Navegando a control de accesos...');
  };

  const handleVerCursoDetalle = (cursoNombre: string, cantidadAlumnos: number) => {
    Alert.alert('Detalle del Curso', `${cursoNombre}\n${cantidadAlumnos} alumnos activos`);
  };

  const handleCrearUsuario = () => {
    setShowCreateUserModal(true);
  };

  const handleCrearCurso = () => {
    setShowCreateCourseModal(true);
  };

  const handleGestionarUsuarios = () => {
    //@ts-ignore - Navigation types
    navigation.navigate('Admin');
  };

  const handleModalSuccess = () => {
    Alert.alert('Éxito', 'Operación completada exitosamente');
  };

  const renderAlumnoView = () => (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>Mis Cursos</Text>
        {listaCurso?.map((curso) => (
          <CursoCardAlumno
            curso={curso}
            onVerPagos={handleVerPagos}
            onVerAccesos={handleVerAccesos}
          />
        ))}
      </SafeAreaView>
    </ScrollView>
  );

  const renderProfesorView = () => (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>Dashboard - Profesor</Text>
        <Card>
          <Text style={styles.cardTitle}>Mis Cursos</Text>
          <CursoCardProfesor
            nombre="Matemáticas Básicas"
            cantidadAlumnos={12}
            onPress={() => handleVerCursoDetalle('Matemáticas Básicas', 12)}
          />
          <CursoCardProfesor
            nombre="Física Avanzada"
            cantidadAlumnos={8}
            onPress={() => handleVerCursoDetalle('Física Avanzada', 8)}
          />
        </Card>
        <Card>
          <Text style={styles.cardTitle}>Resumen del Mes</Text>
          <View style={styles.statsRow}>
            <StatRow number={20} label="Alumnos" />
            <StatRow number="85%" label="Asistencia" />
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
          <StatCard number={156} label="Alumnos Activos" />
          <StatCard number={12} label="Cursos Activos" />
          <StatCard number={8} label="Profesores" />
          <StatCard number="$2.1M" label="Ingresos Mes" />
        </View>
        <Card>
          <Text style={styles.cardTitle}>Acciones Rápidas</Text>
          <AdminActionItem
            icon="person-add-outline"
            label="Crear Usuario"
            onPress={handleCrearUsuario}
          />
          <AdminActionItem
            icon="library-outline"
            label="Crear Curso"
            onPress={handleCrearCurso}
          />
          <AdminActionItem
            icon="people-outline"
            label="Gestionar Usuarios"
            onPress={handleGestionarUsuarios}
          />
        </Card>
        <CreateUserModal
          visible={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={handleModalSuccess}
        />
        <CreateCourseModal
          visible={showCreateCourseModal}
          onClose={() => setShowCreateCourseModal(false)}
          onSuccess={handleModalSuccess}
        />
      </SafeAreaView>
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
        return <View style={styles.emptyState}><Text>Selecciona un rol</Text></View>;
    }
  };

  return renderContent();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});