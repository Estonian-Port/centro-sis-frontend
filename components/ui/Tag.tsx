import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export type TagVariant =
  | 'default'
  // Roles
  | 'rolAlumno'
  | 'rolProfesor'
  | 'rolAdmin'
  | 'rolOficina'
  // Estados
  | 'activo'
  | 'inactivo'
  | 'pendiente'
  | 'baja'
  | 'finalizado'
  // Pagos
  | 'alDia'
  | 'atrasado'
  | 'moroso'
  // Otros
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

interface TagProps {
  label: string;
  variant?: TagVariant;
  style?: ViewStyle;
}

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'default',
  style,
}) => {
  return (
    <View style={[styles.tag, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Default
  default: { backgroundColor: '#f3f4f6' },
  defaultText: { color: '#374151' },

  /* =====================
     ROLES
     ===================== */
  rolAlumno: { backgroundColor: '#dbeafe' }, // Celeste
  rolAlumnoText: { color: '#1e40af' },

  rolProfesor: { backgroundColor: '#8BE378' }, // Verde
  rolProfesorText: { color: '#065f46' },

  rolAdmin: { backgroundColor: '#EB4242' }, // Rojo
  rolAdminText: { color: '#000' },

  rolOficina: { backgroundColor: '#fef3c7' }, // Amarillo/Naranja
  rolOficinaText: { color: '#92400e' },

  /* =====================
     ESTADOS
     ===================== */
  activo: { backgroundColor: '#CCF3C4' },
  activoText: { color: '#166534' },

  inactivo: { backgroundColor: '#e5e7eb' },
  inactivoText: { color: '#374151' },

  pendiente: { backgroundColor: '#fef3c7' },
  pendienteText: { color: '#92400e' },

  baja: { backgroundColor: '#fee2e2' },
  bajaText: { color: '#991b1b' },

  finalizado: { backgroundColor: '#e0e7ff' },
  finalizadoText: { color: '#3730a3' },

  /* =====================
     ESTADOS DE PAGO
     ===================== */
  alDia: { backgroundColor: '#d1fae5' },
  alDiaText: { color: '#065f46' },

  atrasado: { backgroundColor: '#ffedd5' },
  atrasadoText: { color: '#9a3412' },

  moroso: { backgroundColor: '#fecaca' },
  morosoText: { color: '#7f1d1d' },

  success: { backgroundColor: '#d1fae5' },
  successText: { color: '#065f46' },

  error: { backgroundColor: '#fecaca' },
  errorText: { color: '#7f1d1d' },

  warning: { backgroundColor: '#ffedd5' },
  warningText: { color: '#9a3412' },

  info: { backgroundColor: '#dbeafe' },
  infoText: { color: '#1e40af' },
});
