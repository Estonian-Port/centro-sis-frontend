import { useAuth } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';

export default function HomeScreen() {
  const { selectedRole } = useAuth();

  const renderAlumnoView = () => (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>Mis Cursos</Text>

        <Card style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseName}>Matemáticas Básicas</Text>
            <Tag label="ACTIVO" variant="success" />
          </View>

          <View style={styles.courseDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>Lunes, Miércoles, Viernes</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>14:00 - 16:00</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>$15,000 / mes</Text>
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
              Estado de pago: <Text style={styles.paidText}>Al día</Text>
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              title="Ver Pagos"
              variant="outline"
              size="small"
              onPress={() => {}}
              style={styles.actionButton}
            />
            <Button
              title="Ver Accesos"
              variant="outline"
              size="small"
              onPress={() => {}}
              style={styles.actionButton}
            />
          </View>
        </Card>
      </SafeAreaView>
    </ScrollView>
  );

  const renderProfesorView = () => (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>Dashboard - Profesor</Text>

        <Card>
          <Text style={styles.cardTitle}>Mis Cursos</Text>

          <TouchableOpacity style={styles.courseItem}>
            <View>
              <Text style={styles.courseName}>Matemáticas Básicas</Text>
              <Text style={styles.courseInfo}>12 alumnos activos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.courseItem}>
            <View>
              <Text style={styles.courseName}>Física Avanzada</Text>
              <Text style={styles.courseInfo}>8 alumnos activos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </Card>

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
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Alumnos Activos</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Cursos Activos</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Profesores</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>$2.1M</Text>
            <Text style={styles.statLabel}>Ingresos Mes</Text>
          </Card>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Acciones Rápidas</Text>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="person-add-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Crear Usuario</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="library-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Crear Curso</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="people-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Gestionar Usuarios</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </Card>
      </SafeAreaView>
    </ScrollView>
  );

  const renderContent = () => {
    switch (selectedRole) {
      case 'ALUMNO':
        return renderAlumnoView();
      case 'PROFESOR':
        return renderProfesorView();
      case 'ADMINISTRADOR':
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
  courseCard: {
    marginBottom: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  courseDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  beneficios: {
    marginBottom: 12,
  },
  beneficiosTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentStatus: {
    marginBottom: 16,
  },
  paymentText: {
    fontSize: 14,
    color: '#6b7280',
  },
  paidText: {
    color: '#059669',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  courseInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
