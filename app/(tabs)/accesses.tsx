import { CreateAccessModal } from '@/components/modals/CreateAccessModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/authContext';
import { Access, EstadoUsuario } from '@/model/model';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock accesses data
const mockAccesses: Access[] = [
  {
    id: 1,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-15T08:30:00Z',
  },
  {
    id: 2,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-15T12:45:00Z',
  },
  {
    id: 3,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-14T09:15:00Z',
  },
  {
    id: 4,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-14T13:20:00Z',
  },
  {
    id: 5,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-13T08:45:00Z',
  },
  {
    id: 6,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-13T12:30:00Z',
  },
  {
    id: 7,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-12T09:00:00Z',
  },
  {
    id: 8,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-12T13:15:00Z',
  },
  {
    id: 9,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-11T08:20:00Z',
  },
  {
    id: 10,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-11T12:50:00Z',
  },
  {
    id: 11,
    usuario: { id: 1, email: 'alumno@test.com', nombre: 'Juan', apellido: 'Pérez', dni: '12345678', listaRol: [], estado: EstadoUsuario.ALTA },
    fecha: '2024-03-11T12:50:00Z',
  },
];

export default function AccessesScreen() {
  const { usuario } = useAuth();
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    loadAccesses();
  }, [currentPage]);

  const loadAccesses = async () => {
    setLoading(true);
    try {
      // Simulate API call with pagination
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedAccesses = mockAccesses.slice(startIndex, endIndex);
      
      setAccesses(paginatedAccesses);
      setTotalPages(Math.ceil(mockAccesses.length / itemsPerPage));
    } catch (error) {
      Alert.alert('Error', 'Error al cargar los accesos');
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAccessItem = (access: Access) => (
    <Card key={access.id} style={styles.accessItem}>
      <View style={styles.accessHeader}>
        <View style={styles.accessInfo}>
          <Text style={styles.accessDate}>{formatDate(access.fecha)}</Text>
          <Text style={styles.accessTime}>{formatTime(access.fecha)}</Text>
        </View>
      </View>
    </Card>
  );

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleCreateAccessSuccess = () => {
    loadAccesses(); // Reload accesses after creating a new one
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Accesos</Text>
        <Button
          title="Registrar Acceso"
          variant="primary"
          size="small"
          onPress={() => setShowCreateModal(true)}
        />
      </View>

      <View style={styles.summary}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{mockAccesses.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
          </View>
        </Card>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando accesos...</Text>
          </View>
        ) : accesses.length > 0 ? (
          accesses.map(renderAccessItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No se encontraron accesos</Text>
          </View>
        )}
      </ScrollView>

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 0 && styles.disabledButton]}
            onPress={handlePreviousPage}
            disabled={currentPage === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? '#9ca3af' : '#3b82f6'} />
            <Text style={[styles.paginationText, currentPage === 0 && styles.disabledText]}>
              Anterior
            </Text>
          </TouchableOpacity>

          <View style={styles.pageInfo}>
            <Text style={styles.pageText}>
              Página {currentPage + 1} de {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages - 1 && styles.disabledButton]}
            onPress={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            <Text style={[styles.paginationText, currentPage === totalPages - 1 && styles.disabledText]}>
              Siguiente
            </Text>
            <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages - 1 ? '#9ca3af' : '#3b82f6'} />
          </TouchableOpacity>
        </View>
      )}

      <CreateAccessModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateAccessSuccess}
        usuario={usuario}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summary: {
    padding: 16,
  },
  summaryCard: {
    paddingVertical: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  accessItem: {
    marginBottom: 12,
  },
  accessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accessInfo: {
    flex: 1,
  },
  accessDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  accessTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  accessDetails: {
    marginTop: 8,
  },
  accessDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  accessDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginHorizontal: 4,
  },
  disabledText: {
    color: '#9ca3af',
  },
  pageInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    color: '#6b7280',
  },
});