import { EstadoUsuario, Payment, PaymentType, TipoPago } from '@/model/model';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock payments data for student
const mockStudentPayments: Payment[] = [
  {
    id: 1,
    curso: {
      id: 1,
      nombre: 'Matemáticas Básicas',
      dias: ['Lunes', 'Miércoles', 'Viernes'],
      horario: '14:00-16:00',
      arancel: 15000,
      tipoPago: TipoPago.MENSUAL,
      estado: EstadoUsuario.ALTA
    },
    alumno: {
      id: 1,
      email: 'alumno@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      listaRol: [],
      estado: EstadoUsuario.ALTA,
    },
    monto: 13500, // Con descuento
    tipo: PaymentType.EFECTIVO,
    fecha: '2024-03-15T10:30:00Z',
    beneficios: ['Pago total', 'Familiar'],
  },
  {
    id: 2,
    curso: {
      id: 1,
      nombre: 'Matemáticas Básicas',
      dias: ['Lunes', 'Miércoles', 'Viernes'],
      horario: '14:00-16:00',
      arancel: 15000,
      tipoPago: TipoPago.MENSUAL,
      estado: EstadoUsuario.ALTA,
    },
    alumno: {
      id: 1,
      email: 'alumno@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      listaRol: [],
      estado: EstadoUsuario.ALTA,
    },
    monto: 13500,
    tipo: PaymentType.EFECTIVO,
    fecha: '2024-02-15T09:15:00Z',
    beneficios: ['Pago total', 'Familiar'],
  },
  {
    id: 3,
    curso: {
      id: 1,
      nombre: 'Matemáticas Básicas',
      dias: ['Lunes', 'Miércoles', 'Viernes'],
      horario: '14:00-16:00',
      arancel: 15000,
      tipoPago: TipoPago.MENSUAL,
      estado: EstadoUsuario.ALTA,
    },
    alumno: {
      id: 1,
      email: 'alumno@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      listaRol: [],
      estado: EstadoUsuario.ALTA,
    },
    monto: 15750, // Con recargo
    tipo: PaymentType.TARJETA,
    fecha: '2024-01-20T14:45:00Z',
    recargo: 750,
  },
];

export default function StudentPaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    loadPayments();
  }, [currentPage]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Simulate API call with pagination
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPayments = mockStudentPayments.slice(startIndex, endIndex);
      
      setPayments(paginatedPayments);
      setTotalPages(Math.ceil(mockStudentPayments.length / itemsPerPage));
    } catch (error) {
      console.error('Error loading payments:', error);
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


  const getPaymentTypeIcon = (type: PaymentType) => {
  switch (type) {
    case PaymentType.EFECTIVO:
      return 'cash-outline';
    case PaymentType.TRANSFERENCIA:
      return 'card-outline';
    case PaymentType.TARJETA:
      return 'card-outline';
    default:
      return 'card-outline';
  }
};

  const renderPaymentItem = (payment: Payment) => (
    <Card key={payment.id} style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.courseName}>{payment.curso.nombre}</Text>
          <Text style={styles.paymentDate}>{formatDate(payment.fecha)}</Text>
        </View>
        <View style={styles.paymentAmount}>
          <Text style={styles.amount}>${payment.monto.toLocaleString()}</Text>
          <Tag label="PAGADO" variant="success" />
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Ionicons 
            name={getPaymentTypeIcon(payment.tipo) as any} 
            size={16} 
            color="#6b7280" 
          />
          <Text style={styles.detailText}>
            {payment.tipo}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {payment.curso.dias.join(', ')} - {payment.curso.horario}
          </Text>
        </View>

        {payment.recargo && (
          <View style={styles.detailRow}>
            <Ionicons name="warning-outline" size={16} color="#f59e0b" />
            <Text style={[styles.detailText, styles.surchargeText]}>
              Recargo por atraso: +${payment.recargo.toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {payment.beneficios && payment.beneficios.length > 0 && (
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Beneficios aplicados:</Text>
          <View style={styles.tagContainer}>
            {payment.beneficios.map((beneficio, index) => (
              <Tag key={index} label={beneficio} variant="info" />
            ))}
          </View>
        </View>
      )}
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

  const totalPaid = mockStudentPayments.reduce((sum, payment) => sum + payment.monto, 0);
  const averagePayment = totalPaid / mockStudentPayments.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pagos</Text>
      </View>

      <View style={styles.summary}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{mockStudentPayments.length}</Text>
              <Text style={styles.summaryLabel}>Pagos Realizados</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>${totalPaid.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total Pagado</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>${Math.round(averagePayment).toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Promedio</Text>
            </View>
          </View>
        </Card>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando pagos...</Text>
          </View>
        ) : payments.length > 0 ? (
          payments.map(renderPaymentItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No se encontraron pagos</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
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
  content: {
    flex: 1,
    padding: 16,
  },
  paymentItem: {
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  paymentDetails: {
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
  surchargeText: {
    color: '#f59e0b',
  },
  benefitsContainer: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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