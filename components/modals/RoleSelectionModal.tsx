import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Role } from '../../model/model';

interface RoleSelectionModalProps {
  visible: boolean;
  roles: Role[];
  onSelectRole: (role: Role) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> =
  ({ visible, roles, onSelectRole }) => {
    const roleLabels: Record<Role, string> = {
      [Role.ALUMNO]: 'Alumno',
      [Role.PROFESOR]: 'Profesor',
      [Role.ADMINISTRADOR]: 'Administrador',
    };

    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Seleccionar Vista</Text>
            <Text style={styles.subtitle}>
              ¿Desde qué perspectiva deseas acceder?
            </Text>

            <View style={styles.options}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.option}
                  onPress={() => onSelectRole(role)}
                >
                  <Text style={styles.optionText}>
                    Ver vista como {roleLabels[role]}
                  </Text>
                </TouchableOpacity>
              ))}
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
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
    textAlign: 'center',
  },
});
