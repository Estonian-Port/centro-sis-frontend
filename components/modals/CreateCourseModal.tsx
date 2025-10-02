import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
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
import { Input } from '../ui/Input';

const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido'),
  dias: yup
    .array()
    .min(1, 'Debe seleccionar al menos un día')
    .required('Los días son requeridos'),
  horario: yup.string().required('El horario es requerido'),
  profesorId: yup.string().required('Debe seleccionar un profesor'),
  arancel: yup
    .number()
    .positive('El arancel debe ser mayor a 0')
    .required('El arancel es requerido'),
  tipoPago: yup.string().required('Debe seleccionar un tipo de pago'),
});

interface CreateCourseData {
  nombre: string;
  dias: string[];
  horario: string;
  profesorId: string;
  arancel: number;
  tipoPago: string;
}

interface CreateCourseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const availableDays = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const paymentTypes = [
  { id: 'MENSUAL', label: 'Mensual' },
  { id: 'POR_MESES', label: 'Por Meses' },
  { id: 'PAGO_UNICO', label: 'Pago Único' },
];

// Mock professors data
const mockProfessors = [
  { id: '1', nombre: 'María', apellido: 'García' },
  { id: '2', nombre: 'Carlos', apellido: 'López' },
  { id: '3', nombre: 'Ana', apellido: 'Martínez' },
];

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateCourseData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: '',
      dias: [],
      horario: '',
      profesorId: '',
      arancel: 0,
      tipoPago: '',
    },
  });

  const selectedDays = watch('dias');
  const selectedPaymentType = watch('tipoPago');
  const selectedProfessor = watch('profesorId');

  const toggleDay = (day: string) => {
    const currentDays = selectedDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setValue('dias', newDays);
  };

  const onSubmit = async (data: CreateCourseData) => {
    try {
      // Simulate API call
      console.log('Creating course:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Curso Creado',
        `Se ha creado el curso "${data.nombre}" exitosamente.`,
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al crear el curso.');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Crear Curso</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nombre del Curso"
                  value={value}
                  onChangeText={onChange}
                  error={errors.nombre?.message}
                />
              )}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Días de la Semana</Text>
              <View style={styles.daysContainer}>
                {availableDays.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayOption,
                      selectedDays?.includes(day) && styles.selectedDay
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[
                      styles.dayText,
                      selectedDays?.includes(day) && styles.selectedDayText
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.dias && (
                <Text style={styles.errorText}>{errors.dias.message}</Text>
              )}
            </View>

            <Controller
              control={control}
              name="horario"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Horario (ej: 14:00-16:00)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="14:00-16:00"
                  error={errors.horario?.message}
                />
              )}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Profesor Asignado</Text>
              {mockProfessors.map((professor) => (
                <TouchableOpacity
                  key={professor.id}
                  style={[
                    styles.professorOption,
                    selectedProfessor === professor.id && styles.selectedProfessor
                  ]}
                  onPress={() => setValue('profesorId', professor.id)}
                >
                  <Text style={[
                    styles.professorText,
                    selectedProfessor === professor.id && styles.selectedProfessorText
                  ]}>
                    {professor.nombre} {professor.apellido}
                  </Text>
                  <Ionicons
                    name={selectedProfessor === professor.id ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={selectedProfessor === professor.id ? '#3b82f6' : '#9ca3af'}
                  />
                </TouchableOpacity>
              ))}
              {errors.profesorId && (
                <Text style={styles.errorText}>{errors.profesorId.message}</Text>
              )}
            </View>

            <Controller
              control={control}
              name="arancel"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Arancel ($)"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  error={errors.arancel?.message}
                />
              )}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tipo de Pago</Text>
              {paymentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.paymentOption,
                    selectedPaymentType === type.id && styles.selectedPayment
                  ]}
                  onPress={() => setValue('tipoPago', type.id)}
                >
                  <Text style={[
                    styles.paymentText,
                    selectedPaymentType === type.id && styles.selectedPaymentText
                  ]}>
                    {type.label}
                  </Text>
                  <Ionicons
                    name={selectedPaymentType === type.id ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={selectedPaymentType === type.id ? '#3b82f6' : '#9ca3af'}
                  />
                </TouchableOpacity>
              ))}
              {errors.tipoPago && (
                <Text style={styles.errorText}>{errors.tipoPago.message}</Text>
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
              title="Crear Curso"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.createButton}
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
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  selectedDay: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedDayText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  professorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  selectedProfessor: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  professorText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedProfessorText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  paymentText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedPaymentText: {
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
  createButton: {
    flex: 2,
  },
});