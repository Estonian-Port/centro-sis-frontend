import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Curso } from '@/model/model';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

interface CursoCardAlumnoProps {
  curso: Curso | undefined;
  onVerPagos: () => void;
  onVerAccesos: () => void;
}

export const CursoCardAlumno: React.FC<CursoCardAlumnoProps> = ({
  curso,
  onVerPagos,
  onVerAccesos,
}) => {
  return (
    <Card style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <Text style={styles.courseName}>{curso?.nombre}</Text>
        <Tag label="ACTIVO" variant="success" />
      </View>

      <View style={styles.courseDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{curso?.dias}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{curso?.horario}</Text>
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
          Estado de pago: <Text style={styles.paidText}>Al día</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Ver Pagos"
          variant="outline"
          size="small"
          onPress={onVerPagos}
          style={styles.actionButton}
        />
        <Button
          title="Ver Accesos"
          variant="outline"
          size="small"
          onPress={onVerAccesos}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
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
});