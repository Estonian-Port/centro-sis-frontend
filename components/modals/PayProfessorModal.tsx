import { Usuario } from '@/model/model';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as yup from 'yup';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

const schema = yup.object().shape({
  mes: yup.string().required('Debe seleccionar un mes'),
  monto: yup
    .number()
    .positive('El monto debe ser mayor a 0')
    .required('El monto es requerido'),
  metodoPago: yup.string().required('Debe seleccionar un método de pago'),
});

interface PayProfessorData {
  mes: string;
  monto: number;
  metodoPago: string;
}

interface PayProfessorModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  professor? : Usuario | null
}

const months = [
  { id: '2024-01', label: 'Enero 2024' },
  { id: '2024-02', label: 'Febrero 2024' },
  { id: '2024-03', label: 'Marzo 2024' },
  { id: '2024-04', label: 'Abril 2024' },
  { id: '2024-05', label: 'Mayo 2024' },
  { id: '2024-06', label: 'Junio 2024' },
  { id: '2024-07', label: 'Julio 2024' },
  { id: '2024-08', label: 'Agosto 2024' },
  { id: '2024-09', label: 'Septiembre 2024' },
  { id: '2024-10', label: 'Octubre 2024' },
  { id: '2024-11', label: 'Noviembre 2024' },
  { id: '2024-12', label: 'Diciembre 2024' },
];

const paymentMethods = [
  { id: 'efectivo', label: 'Efectivo', icon: 'cash-outline' },
  { id: 'transferencia', label: 'Transferencia', icon: 'card-outline' },
  { id: 'cheque', label: 'Cheque', icon: 'document-outline' },
];

// Mock payment calculation data
const mockPaymentData = {
  totalStudents: 25,
  percentage: 35,
  baseAmount: 15000,
  payments: [
    { studentName: 'Juan Pérez', amount: 15000, date: '2024-03-05' },
    { studentName: 'María González', amount: 15000, date: '2024-03-08' },
    { studentName: 'Carlos López', amount: 15000, date: '2024-03-12' },
  ],
};

export const PayProfessorModal: React.FC<PayProfessorModalProps> = ({
  visible,
  onClose,
  onSuccess,
  professor,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<PayProfessorData>({
    resolver: yupResolver(schema),
    defaultValues: {
      mes: '',
      monto: 0,
      metodoPago: '',
    },
  });

  const selectedPaymentMethod = watch('metodoPago');

  const handleMonthSelect = (monthId: string) => {
    setSelectedMonth(monthId);
    setValue('mes', monthId);
    
    // Calculate payment amount (mock calculation)
    const calculatedPayment = mockPaymentData.totalStudents * mockPaymentData.baseAmount * (mockPaymentData.percentage / 100);
    setCalculatedAmount(calculatedPayment);
    setValue('monto', calculatedPayment);
  };

  const onSubmit = async (data: PayProfessorData) => {
    try {
      // Simulate API call
      console.log('Processing professor payment:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Pago Registrado',
        `Se ha registrado el pago de $${data.monto.toLocaleString()} para ${professor?.nombre} ${professor?.apellido}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              setSelectedMonth('');
              setCalculatedAmount(0);
              onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al registrar el pago.');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedMonth('');
    setCalculatedAmount(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Pagar a Profesor</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {professor && (
              <Card style={styles.professorCard}>
                <Text style={styles.professorName}>
                  {professor.nombre} {professor.apellido}
                </Text>
                <Text style={styles.professorId}>ID: {professor.id}</Text>
              </Card>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Seleccionar Mes</Text>
              <View style={styles.monthsContainer}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month.id}
                    style={[
                      styles.monthOption,
                      selectedMonth === month.id && styles.selectedMonth
                    ]}
                    onPress={() => handleMonthSelect(month.id)}
                  >
                    <Text style={[
                      styles.monthText,
                      selectedMonth === month.id && styles.selectedMonthText
                    ]}>
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.mes && (
                <Text style={styles.errorText}>{errors.mes.message}</Text>
              )}
            </View>

            {selectedMonth && (
              <Card style={styles.calculationCard}>
                <Text style={styles.calculationTitle}>Cálculo del Pago</Text>
                
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Total de alumnos:</Text>
                  <Text style={styles.calculationValue}>{mockPaymentData.totalStudents}</Text>
                </View>
                
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Porcentaje del profesor:</Text>
                  <Text style={styles.calculationValue}>{mockPaymentData.percentage}%</Text>
                </View>
                
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Arancel base:</Text>
                  <Text style={styles.calculationValue}>${mockPaymentData.baseAmount.toLocaleString()}</Text>
                </View>
                
                <View style={[styles.calculationRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total a pagar:</Text>
                  <Text style={styles.totalValue}>${calculatedAmount.toLocaleString()}</Text>
                </View>

                <View style={styles.paymentsSection}>
                  <Text style={styles.paymentsTitle}>Pagos del Mes</Text>
                  {mockPaymentData.payments.map((payment, index) => (
                    <View key={index} style={styles.paymentRow}>
                      <Text style={styles.paymentStudent}>{payment.studentName}</Text>
                      <Text style={styles.paymentAmount}>${payment.amount.toLocaleString()}</Text>
                      <Text style={styles.paymentDate}>{payment.date}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            <Controller
              control={control}
              name="monto"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Monto a Pagar ($)"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  error={errors.monto?.message}
                />
              )}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Método de Pago</Text>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodOption,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setValue('metodoPago', method.id)}
                >
                  <View style={styles.paymentMethodContent}>
                    <Ionicons name={method.icon as any} size={20} color="#3b82f6" />
                    <Text style={[
                      styles.paymentMethodText,
                      selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
                    ]}>
                      {method.label}
                    </Text>
                  </View>
                  <Ionicons
                    name={selectedPaymentMethod === method.id ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={selectedPaymentMethod === method.id ? '#3b82f6' : '#9ca3af'}
                  />
                </TouchableOpacity>
              ))}
              {errors.metodoPago && (
                <Text style={styles.errorText}>{errors.metodoPago.message}</Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
            />
            <Button
              title="Registrar Pago"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.payButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  professorCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 1,
    marginBottom: 20,
  },
  professorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  professorId: {
    fontSize: 14,
    color: '#0369a1',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  monthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  selectedMonth: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  monthText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedMonthText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  calculationCard: {
    backgroundColor: '#f9fafb',
    marginBottom: 20,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  paymentsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  paymentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentStudent: {
    flex: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  paymentAmount: {
    flex: 1,
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
  },
  paymentDate: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  paymentMethodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  selectedPaymentMethodText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  payButton: {
    flex: 2,
  },
});