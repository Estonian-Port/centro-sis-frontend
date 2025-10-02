import { useAuth } from '@/context/authContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';

interface ProfessorEarning {
  id: number;
  mes: string;
  año: number;
  curso: {
    id: number;
    nombre: string;
  };
  totalAlumnos: number;
  montoBase: number;
  porcentaje: number;
  montoTotal: number;
  estado: 'PENDIENTE' | 'PAGADO';
  fechaPago?: string;
  metodoPago?: string;
}

// Mock earnings data for professor
const mockProfessorEarnings: ProfessorEarning[] = [
  {
    id: 1,
    mes: 'Marzo',
    año: 2024,
    curso: { id: 1, nombre: 'Matemáticas Básicas' },
    totalAlumnos: 12,
    montoBase: 15000,
    porcentaje: 35,
    montoTotal: 63000, // 12 * 15000 * 0.35
    estado: 'PAGADO',
    fechaPago: '2024-04-05T10:00:00Z',
    metodoPago: 'TRANSFERENCIA',
  },
  {
    id: 2,
    mes: 'Febrero',
    año: 2024,
    curso: { id: 1, nombre: 'Matemáticas Básicas' },
    totalAlumnos: 11,
    montoBase: 15000,
    porcentaje: 35,
    montoTotal: 57750,
    estado: 'PAGADO',
    fechaPago: '2024-03-05T10:00:00Z',
    metodoPago: 'EFECTIVO',
  },
  {
    id: 3,
    mes: 'Enero',
    año: 2024,
    curso: { id: 1, nombre: 'Matemáticas Básicas' },
    totalAlumnos: 10,
    montoBase: 15000,
    porcentaje: 35,
    montoTotal: 52500,
    estado: 'PENDIENTE',
  },
  {
    id: 4,
    mes: 'Marzo',
    año: 2024,
    curso: { id: 2, nombre: 'Física Avanzada' },
    totalAlumnos: 8,
    montoBase: 20000,
    porcentaje: 35,
    montoTotal: 56000,
    estado: 'PAGADO',
    fechaPago: '2024-04-05T10:00:00Z',
    metodoPago: 'TRANSFERENCIA',
  },
  {
    id: 5,
    mes: 'Febrero',
    año: 2024,
    curso: { id: 2, nombre: 'Física Avanzada' },
    totalAlumnos: 7,
    montoBase: 20000,
    porcentaje: 35,
    montoTotal: 49000,
    estado: 'PENDIENTE',
  },
];

export default function ProfessorEarningsScreen() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<ProfessorEarning[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'TODOS' | 'PENDIENTE' | 'PAGADO'>('TODOS');

  useEffect(() => {
    loadEarnings();
  }, [selectedFilter]);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredEarnings = [...mockProfessorEarnings];
      
      if (selectedFilter !== 'TODOS') {
        filteredEarnings = filteredEarnings.filter(earning => earning.estado === selectedFilter);
      }
      
      setEarnings(filteredEarnings);
    } catch (error) {
      console.error('Error loading earnings:', error);
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

  const handleRequestPayment = (earning: ProfessorEarning) => {
    Alert.alert(
      'Solicitar Pago',
      `¿Deseas solicitar el pago de $${earning.montoTotal.toLocaleString()} correspondiente a ${earning.mes} ${earning.año} del curso ${earning.curso.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Solicitar', 
          onPress: () => {
            Alert.alert('Solicitud Enviada', 'Se ha enviado la solicitud de pago al administrador.');
          }
        },
      ]
    );
  };

  const renderEarningItem = (earning: ProfessorEarning) => (
    <Card key={earning.id} style={styles.earningItem}>
      <View style={styles.earningHeader}>
        <View style={styles.earningInfo}>
          <Text style={styles.courseName}>{earning.curso.nombre}</Text>
          <Text style={styles.period}>{earning.mes} {earning.año}</Text>
        </View>
        <View style={styles.earningAmount}>
          <Text style={styles.amount}>${earning.montoTotal.toLocaleString()}</Text>
          <Tag 
            label={earning.estado} 
            variant={earning.estado === 'PAGADO' ? 'success' : 'warning'} 
          />
        </View>
      </View>
      
      <View style={styles.earningDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {earning.totalAlumnos} alumnos
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calculator-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {earning.porcentaje}% de ${earning.montoBase.toLocaleString()} por alumno
          </Text>
        </View>

        {earning.estado === 'PAGADO' && earning.fechaPago && (
          <>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#059669" />
              <Text style={[styles.detailText, styles.paidText]}>
                Pagado el {formatDate(earning.fechaPago)}
              </Text>
            </View>
            
            {earning.metodoPago && (
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={16} color="#059669" />
                <Text style={[styles.detailText, styles.paidText]}>
                  Método: {earning.metodoPago}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {earning.estado === 'PENDIENTE' && (
        <View style={styles.actions}>
          <Button
            title="Solicitar Pago"
            variant="primary"
            size="small"
            onPress={() => handleRequestPayment(earning)}
          />
        </View>
      )}
    </Card>
  );

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.montoTotal, 0);
  const pendingEarnings = earnings.filter(e => e.estado === 'PENDIENTE').reduce((sum, earning) => sum + earning.montoTotal, 0);
  const paidEarnings = earnings.filter(e => e.estado === 'PAGADO').reduce((sum, earning) => sum + earning.montoTotal, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Cobros</Text>
      </View>

      <View style={styles.summary}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>${totalEarnings.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, styles.paidAmount]}>${paidEarnings.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Cobrado</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, styles.pendingAmount]}>${pendingEarnings.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Pendiente</Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['TODOS', 'PENDIENTE', 'PAGADO'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilter
              ]}
              onPress={() => setSelectedFilter(filter as any)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText
              ]}>
                {filter === 'TODOS' ? 'Todos' : filter === 'PENDIENTE' ? 'Pendientes' : 'Pagados'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando cobros...</Text>
          </View>
        ) : earnings.length > 0 ? (
          earnings.map(renderEarningItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No se encontraron cobros</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  paidAmount: {
    color: '#059669',
  },
  pendingAmount: {
    color: '#f59e0b',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  earningItem: {
    marginBottom: 12,
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  earningInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  period: {
    fontSize: 14,
    color: '#6b7280',
  },
  earningAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  earningDetails: {
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
  paidText: {
    color: '#059669',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
});