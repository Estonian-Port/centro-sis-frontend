import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES } from '@/util/colores';
import { TIPOGRAFIA } from '@/util/tipografia';
import { CursoInformacion } from '@/model/model';

interface CalendarioProfesorProps {
  cursos: CursoInformacion[];
  onCursoPress: (curso: CursoInformacion) => void;
}

export const CalendarioProfesor: React.FC<CalendarioProfesorProps> = ({ 
  cursos, 
  onCursoPress 
}) => {
  const [selectedDate, setSelectedDate] = useState('');

  // Mapear días a números (0 = Domingo, 1 = Lunes, etc.)
  const diaToNumber: Record<string, number> = {
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
  };

  // Agrupar cursos por día de la semana
  const cursosPorDia = cursos.reduce((acc, curso) => {
    curso.horarios.forEach(horario => {
      if (!acc[horario.dia]) {
        acc[horario.dia] = [];
      }
      acc[horario.dia].push({
        curso,
        horario
      });
    });
    return acc;
  }, {} as Record<string, Array<{ curso: CursoInformacion; horario: any }>>);

  // Marcar días con cursos en el calendario
  const markedDates = cursos.reduce((acc, curso) => {
    // Aquí marcarías los días específicos si tienes fechas concretas
    return acc;
  }, {} as any);

  const renderDaySchedule = (dia: string) => {
    const cursosDelDia = cursosPorDia[dia] || [];
    
    if (cursosDelDia.length === 0) {
      return (
        <View style={styles.emptyDay}>
          <Text style={styles.emptyDayText}>Sin clases</Text>
        </View>
      );
    }

    // Ordenar por hora de inicio
    const cursosOrdenados = cursosDelDia.sort((a, b) => 
      a.horario.horaInicio.localeCompare(b.horario.horaInicio)
    );

    return cursosOrdenados.map(({ curso, horario }, index) => (
      <TouchableOpacity
        key={`${curso.id}-${index}`}
        style={[
          styles.cursoItem,
          { borderLeftColor: getCursoColor(index) }
        ]}
        onPress={() => onCursoPress(curso)}
        activeOpacity={0.7}
      >
        <View style={styles.cursoHora}>
          <Ionicons name="time" size={14} color={COLORES.textSecondary} />
          <Text style={styles.horaText}>
            {horario.horaInicio} - {horario.horaFin}
          </Text>
        </View>
        <Text style={styles.cursoNombre} numberOfLines={1}>
          {curso.nombre}
        </Text>
        <View style={styles.cursoFooter}>
          <Ionicons name="people" size={12} color={COLORES.textSecondary} />
          <Text style={styles.alumnosText}>
            {curso.alumnosInscriptos} alumnos
          </Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const getCursoColor = (index: number) => {
    const colores = [COLORES.violeta, COLORES.rosa, COLORES.verde, COLORES.dorado];
    return colores[index % colores.length];
  };

  // Días laborables sin domingo
  const diasLaborables = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <View style={styles.container}>
      {/* Vista Semanal */}
      <View style={styles.weekView}>
        <Text style={styles.sectionTitle}>Horarios de la Semana</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {diasLaborables.map(dia => (
            <View key={dia} style={styles.diaColumn}>
              <View style={styles.diaHeader}>
                <Text style={styles.diaText}>{dia}</Text>
                <Text style={styles.cantidadCursos}>
                  {cursosPorDia[dia]?.length || 0}
                </Text>
              </View>
              <ScrollView style={styles.diaContent}>
                {renderDaySchedule(dia)}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    ...TIPOGRAFIA.titleM,
    color: COLORES.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  weekView: {
    flex: 1,
  },
  diaColumn: {
    width: 200,
    marginRight: 12,
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 16,
    marginBottom: 16,
  },
  diaHeader: {
    backgroundColor: COLORES.violeta,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diaText: {
    ...TIPOGRAFIA.subtitle,
    color: COLORES.blanco,
    fontWeight: '600',
  },
  cantidadCursos: {
    ...TIPOGRAFIA.body,
    color: COLORES.blanco,
    backgroundColor: `${COLORES.blanco}30`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
  },
  diaContent: {
    padding: 8,
    maxHeight: 500,
  },
  emptyDay: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDayText: {
    ...TIPOGRAFIA.body,
    color: COLORES.textSecondary,
    fontStyle: 'italic',
  },
  cursoItem: {
    backgroundColor: COLORES.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  cursoHora: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  horaText: {
    ...TIPOGRAFIA.caption,
    color: COLORES.textSecondary,
    fontWeight: '600',
  },
  cursoNombre: {
    ...TIPOGRAFIA.subtitle,
    color: COLORES.textPrimary,
    marginBottom: 6,
  },
  cursoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alumnosText: {
    ...TIPOGRAFIA.caption,
    color: COLORES.textSecondary,
  },
});