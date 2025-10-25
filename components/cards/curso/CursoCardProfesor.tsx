import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CursoCardProfesorProps {
  nombre: string;
  cantidadAlumnos: number;
  onPress: () => void;
}

export const CursoCardProfesor: React.FC<CursoCardProfesorProps> = ({
  nombre,
  cantidadAlumnos,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.courseItem} onPress={onPress}>
      <View>
        <Text style={styles.courseName}>{nombre}</Text>
        <Text style={styles.courseInfo}>{cantidadAlumnos} alumnos activos</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  courseInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});