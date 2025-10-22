import { Usuario } from '@/model/model';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const schema = yup.object().shape({
  fecha: yup.string().required('La fecha es requerida'),
  hora: yup.string().required('La hora es requerida'),
  tipo: yup.string().required('Debe seleccionar el tipo de acceso'),
});

interface CreateAccessData {
  fecha: string;
  hora: string;
  tipo: string;
}

interface CreateAccessModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: Usuario | null
}

export const CreateAccessModal: React.FC<CreateAccessModalProps> = ({
  visible,
  onClose,
  onSuccess,
  usuario,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateAccessData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0], // Today's date
      hora: new Date().toTimeString().slice(0, 5), // Current time
      tipo: '',
    },
  });

  const selectedType = watch('tipo');

  const onSubmit = async (data: CreateAccessData) => {
    try {
      // Simulate API call
      console.log('Creating manual access:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Acceso Registrado',
        `Se ha registrado el acceso manual para ${usuario?.nombre} ${usuario?.apellido}.`,
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
      Alert.alert('Error', 'Hubo un error al registrar el acceso.');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    setValue('fecha', now.toISOString().split('T')[0]);
    setValue('hora', now.toTimeString().slice(0, 5));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Acceso Manual</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {usuario && (
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {usuario.nombre} {usuario.apellido}
                </Text>
              </View>
            )}

            <Controller
              control={control}
              name="fecha"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Fecha"
                  value={value}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                  error={errors.fecha?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="hora"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Hora"
                  value={value}
                  onChangeText={onChange}
                  placeholder="HH:MM"
                  error={errors.hora?.message}
                />
              )}
            />

            <TouchableOpacity 
              style={styles.currentTimeButton}
              onPress={setCurrentDateTime}
            >
              <Ionicons name="time-outline" size={16} color="#3b82f6" />
              <Text style={styles.currentTimeText}>Usar fecha y hora actual</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
            />
            <Button
              title="Registrar Acceso"
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
    maxWidth: 400,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  userInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 2,
  },
  userId: {
    fontSize: 14,
    color: '#0369a1',
  },
  currentTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 20,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  currentTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  typeSection: {
    marginBottom: 20,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  selectedType: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  typeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  selectedTypeText: {
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