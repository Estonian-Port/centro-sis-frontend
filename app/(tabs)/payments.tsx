import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';
import { Course, User } from '../../types';

export default function PaymentsScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Mock data
  const courses: Course[] = [
    {
      id: 1,
      nombre: 'Matemáticas Básicas',
      dias: ['Lunes', 'Miércoles', 'Viernes'],
      horario: '14:00-16:00',
      arancel: 15000,
      tipoPago: 'MENSUAL',
      estado: 'ALTA',
    },
    {
      id: 2,
      nombre: 'Física Avanzada',
      dias: ['Martes', 'Jueves'],
      horario: '16:00-18:00',
      arancel: 20000,
      tipoPago: 'MENSUAL',
      estado: 'ALTA',
    },
  ];

  const students: User[] = [
    {
      id: 1,
      email: 'alumno1@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      roles: [{ id: 1, nombre: 'ALUMNO' }],
      estado: 'ALTA',
      beneficios: ['Pago total', 'Familiar'],
    },
    {
      id: 2,
      email: 'alumno2@test.com',
      nombre: 'María',
      apellido: 'González',
      dni: '87654321',
      roles: [{ id: 1, nombre: 'ALUMNO' }],
      estado: 'ALTA',
      beneficios: ['Descuento hermanos'],
    },
  ];

  const paymentMethods = [
    { id: 'efectivo', label: 'Efectivo', icon: 'cash-outline' },
    { id: 'transferencia', label: 'Transferencia', icon: 'card-outline' },
    {
      id: 'tarjeta_credito',
      label: 'Tarjeta de Crédito',
      icon: 'card-outline',
    },
    { id: 'tarjeta_debito', label: 'Tarjeta de Débito', icon: 'card-outline' },
  ];

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Paso 1: Seleccionar Curso</Text>
      {courses.map((course) => (
        <TouchableOpacity
          key={course.id}
          style={[
            styles.selectionItem,
            selectedCourse?.id === course.id && styles.selectedItem,
          ]}
          onPress={() => setSelectedCourse(course)}
        >
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{course.nombre}</Text>
            <Text style={styles.courseDetail}>
              {course.dias.join(', ')} - {course.horario}
            </Text>
            <Text style={styles.courseDetail}>
              Arancel: ${course.arancel.toLocaleString()}
            </Text>
          </View>
          <Ionicons
            name={
              selectedCourse?.id === course.id
                ? 'checkmark-circle'
                : 'ellipse-outline'
            }
            size={24}
            color={selectedCourse?.id === course.id ? '#3b82f6' : '#9ca3af'}
          />
        </TouchableOpacity>
      ))}

      <Button
        title="Continuar"
        onPress={() => setStep(2)}
        disabled={!selectedCourse}
        style={styles.stepButton}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Paso 2: Seleccionar Alumno</Text>
      {students.map((student) => (
        <TouchableOpacity
          key={student.id}
          style={[
            styles.selectionItem,
            selectedStudent?.id === student.id && styles.selectedItem,
          ]}
          onPress={() => setSelectedStudent(student)}
        >
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {student.nombre} {student.apellido}
            </Text>
            <Text style={styles.studentDetail}>DNI: {student.dni}</Text>
            <Text style={styles.studentDetail}>{student.email}</Text>

            {student.beneficios && student.beneficios.length > 0 && (
              <View style={styles.beneficiosContainer}>
                {student.beneficios.map((beneficio, index) => (
                  <Tag key={index} label={beneficio} variant="info" />
                ))}
              </View>
            )}
          </View>
          <Ionicons
            name={
              selectedStudent?.id === student.id
                ? 'checkmark-circle'
                : 'ellipse-outline'
            }
            size={24}
            color={selectedStudent?.id === student.id ? '#3b82f6' : '#9ca3af'}
          />
        </TouchableOpacity>
      ))}

      <View style={styles.stepButtons}>
        <Button
          title="Anterior"
          variant="outline"
          onPress={() => setStep(1)}
          style={styles.backButton}
        />
        <Button
          title="Continuar"
          onPress={() => setStep(3)}
          disabled={!selectedStudent}
          style={styles.nextButton}
        />
      </View>
    </View>
  );

  const renderStep3 = () => {
    const baseAmount = selectedCourse?.arancel || 0;
    const discount = 0.1; // 10% discount example
    const surcharge = 0.05; // 5% surcharge for late payment
    const finalAmount = baseAmount * (1 + surcharge - discount);

    return (
      <View>
        <Text style={styles.stepTitle}>Paso 3: Confirmar Pago</Text>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del Pago</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Curso:</Text>
            <Text style={styles.summaryValue}>{selectedCourse?.nombre}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Alumno:</Text>
            <Text style={styles.summaryValue}>
              {selectedStudent?.nombre} {selectedStudent?.apellido}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monto base:</Text>
            <Text style={styles.summaryValue}>
              ${baseAmount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Descuento (10%):</Text>
            <Text style={[styles.summaryValue, styles.discountText]}>
              -${(baseAmount * discount).toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Recargo por atraso (5%):</Text>
            <Text style={[styles.summaryValue, styles.surchargeText]}>
              +${(baseAmount * surcharge).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>
              ${finalAmount.toLocaleString()}
            </Text>
          </View>
        </Card>

        <Card style={styles.paymentMethodCard}>
          <Text style={styles.cardTitle}>Método de Pago</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity key={method.id} style={styles.paymentMethod}>
              <Ionicons name={method.icon as any} size={20} color="#3b82f6" />
              <Text style={styles.paymentMethodText}>{method.label}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <View style={styles.stepButtons}>
          <Button
            title="Anterior"
            variant="outline"
            onPress={() => setStep(2)}
            style={styles.backButton}
          />
          <Button
            title="Procesar Pago"
            variant="primary"
            onPress={() => {
              Alert.alert(
                'Pago Procesado',
                'El pago ha sido registrado exitosamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setStep(1);
                      setSelectedCourse(null);
                      setSelectedStudent(null);
                    },
                  },
                ]
              );
            }}
            style={styles.nextButton}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Procesar Pago</Text>

        <View style={styles.progressIndicator}>
          {[1, 2, 3].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.progressStep,
                stepNumber <= step && styles.activeProgressStep,
              ]}
            >
              <Text
                style={[
                  styles.progressStepText,
                  stepNumber <= step && styles.activeProgressStepText,
                ]}
              >
                {stepNumber}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
    marginBottom: 16,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeProgressStep: {
    backgroundColor: '#3b82f6',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeProgressStepText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  selectionItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItem: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  courseInfo: {
    flex: 1,
  },
  studentInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  beneficiosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  stepButton: {
    marginTop: 16,
  },
  stepButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  discountText: {
    color: '#059669',
  },
  surchargeText: {
    color: '#dc2626',
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
    color: '#3b82f6',
  },
  paymentMethodCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  paymentMethodText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
});
