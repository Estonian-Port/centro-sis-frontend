import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Horario, DayOfWeek } from "@/model/model";
import { TimePickerModal } from "@/components/pickers/TimePicker";

interface EditarHorariosModalProps {
  visible: boolean;
  onClose: () => void;
  horariosActuales: Horario[];
  onGuardar: (horarios: Horario[]) => Promise<void>;
}

// Mapeo de días de la semana
const diasSemanaMap: { [key in DayOfWeek]: string } = {
  [DayOfWeek.MONDAY]: "Lunes",
  [DayOfWeek.TUESDAY]: "Martes",
  [DayOfWeek.WEDNESDAY]: "Miércoles",
  [DayOfWeek.THURSDAY]: "Jueves",
  [DayOfWeek.FRIDAY]: "Viernes",
  [DayOfWeek.SATURDAY]: "Sábado",
  [DayOfWeek.SUNDAY]: "Domingo",
};

// Días en orden
const diasOrdenados: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

export const EditarHorariosModal: React.FC<EditarHorariosModalProps> = ({
  visible,
  onClose,
  horariosActuales,
  onGuardar,
}) => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<"inicio" | "fin" | null>(null);

  // Nuevo horario
  const [nuevoDia, setNuevoDia] = useState<DayOfWeek>(DayOfWeek.MONDAY);
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState("");
  const [nuevaHoraFin, setNuevaHoraFin] = useState("");

  useEffect(() => {
    if (visible) {
      setHorarios([...horariosActuales]);
      setShowAddForm(false);
    }
  }, [visible, horariosActuales]);

  const handleAgregarHorario = () => {
    // Validar que las horas estén completas
    if (!nuevaHoraInicio || !nuevaHoraFin) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debe completar las horas de inicio y fin",
        position: "bottom",
      });
      return;
    }

    // Validar que hora fin sea mayor que hora inicio
    if (nuevaHoraFin <= nuevaHoraInicio) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La hora de fin debe ser posterior a la hora de inicio",
        position: "bottom",
      });
      return;
    }

    // Validar superposición
    const superposicion = horarios.some(
      (h) =>
        h.dia === nuevoDia &&
        ((nuevaHoraInicio >= h.horaInicio && nuevaHoraInicio < h.horaFin) ||
          (nuevaHoraFin > h.horaInicio && nuevaHoraFin <= h.horaFin) ||
          (nuevaHoraInicio <= h.horaInicio && nuevaHoraFin >= h.horaFin))
    );

    if (superposicion) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El horario se superpone con otro existente",
        position: "bottom",
      });
      return;
    }

    const nuevoHorario: Horario = {
      dia: nuevoDia,
      horaInicio: nuevaHoraInicio,
      horaFin: nuevaHoraFin,
    };

    setHorarios([...horarios, nuevoHorario]);
    setShowAddForm(false);
    // Reset form
    setNuevoDia(DayOfWeek.MONDAY);
    setNuevaHoraInicio("");
    setNuevaHoraFin("");
  };

  const handleEliminarHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    if (horarios.length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debe haber al menos un horario",
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      await onGuardar(horarios);
      Toast.show({
        type: "success",
        text1: "Horarios actualizados",
        text2: "Los horarios se actualizaron correctamente",
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error actualizando horarios:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron actualizar los horarios",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setHorarios([...horariosActuales]);
    setShowAddForm(false);
    setShowTimePicker(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="time" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.title}>Editar Horarios</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Lista de Horarios */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Horarios ({horarios.length})
                </Text>
                {!showAddForm && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddForm(true)}
                  >
                    <Ionicons name="add-circle" size={24} color="#8b5cf6" />
                    <Text style={styles.addButtonText}>Agregar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {horarios.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={32} color="#d1d5db" />
                  <Text style={styles.emptyText}>
                    No hay horarios configurados
                  </Text>
                </View>
              ) : (
                horarios.map((horario, index) => (
                  <View key={index} style={styles.horarioItem}>
                    <View style={styles.horarioInfo}>
                      <View style={styles.horarioDia}>
                        <Ionicons name="calendar" size={18} color="#8b5cf6" />
                        <Text style={styles.horarioDiaText}>
                          {diasSemanaMap[horario.dia as DayOfWeek] || horario.dia}
                        </Text>
                      </View>
                      <View style={styles.horarioHoras}>
                        <Ionicons name="time-outline" size={18} color="#6b7280" />
                        <Text style={styles.horarioHorasText}>
                          {horario.horaInicio} - {horario.horaFin}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleEliminarHorario(index)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Formulario Agregar Horario */}
            {showAddForm && (
              <View style={styles.addForm}>
                <View style={styles.addFormHeader}>
                  <Text style={styles.addFormTitle}>Nuevo Horario</Text>
                  <TouchableOpacity
                    onPress={() => setShowAddForm(false)}
                    style={styles.cancelAddButton}
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Selector de Días con Botones */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Día de la semana</Text>
                  <View style={styles.daysRow}>
                    {diasOrdenados.map((dia) => (
                      <TouchableOpacity
                        key={dia}
                        style={[
                          styles.dayButton,
                          nuevoDia === dia && styles.dayButtonSelected,
                        ]}
                        onPress={() => setNuevoDia(dia)}
                      >
                        <Text
                          style={[
                            styles.dayButtonText,
                            nuevoDia === dia && styles.dayButtonTextSelected,
                          ]}
                        >
                          {diasSemanaMap[dia].substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Inputs de Hora con TimePicker */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Hora Inicio</Text>
                  <TouchableOpacity
                    style={[
                      styles.timeButton,
                      !nuevaHoraInicio && styles.timeButtonEmpty,
                    ]}
                    onPress={() => setShowTimePicker("inicio")}
                  >
                    <Ionicons name="time-outline" size={20} color="#9ca3af" />
                    <Text
                      style={[
                        styles.timeButtonText,
                        !nuevaHoraInicio && styles.timeButtonPlaceholder,
                      ]}
                    >
                      {nuevaHoraInicio || "Ej: 14:00"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Hora Fin</Text>
                  <TouchableOpacity
                    style={[
                      styles.timeButton,
                      !nuevaHoraFin && styles.timeButtonEmpty,
                    ]}
                    onPress={() => setShowTimePicker("fin")}
                  >
                    <Ionicons name="time-outline" size={20} color="#9ca3af" />
                    <Text
                      style={[
                        styles.timeButtonText,
                        !nuevaHoraFin && styles.timeButtonPlaceholder,
                      ]}
                    >
                      {nuevaHoraFin || "Ej: 16:00"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Botón Agregar */}
                <TouchableOpacity
                  style={styles.addHorarioButton}
                  onPress={handleAgregarHorario}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.addHorarioButtonText}>Agregar Horario</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleGuardar}
              disabled={loading || horarios.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal para Time Picker */}
      <TimePickerModal
        visible={showTimePicker !== null}
        onClose={() => setShowTimePicker(null)}
        onSelect={(time) => {
          if (showTimePicker === "inicio") {
            setNuevaHoraInicio(time);
          } else if (showTimePicker === "fin") {
            setNuevaHoraFin(time);
          }
          setShowTimePicker(null);
        }}
        title={
          showTimePicker === "inicio"
            ? "Seleccionar Hora de Inicio"
            : "Seleccionar Hora de Fin"
        }
        selectedTime={showTimePicker === "inicio" ? nuevaHoraInicio : nuevaHoraFin}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3e8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  horarioItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  horarioInfo: {
    flex: 1,
    gap: 6,
  },
  horarioDia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  horarioDiaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  horarioHoras: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  horarioHorasText: {
    fontSize: 13,
    color: "#6b7280",
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  addForm: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addFormTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  cancelAddButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    minWidth: 50,
    alignItems: "center",
  },
  dayButtonSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "#f3e8ff",
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  dayButtonTextSelected: {
    color: "#8b5cf6",
    fontWeight: "600",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    gap: 8,
  },
  timeButtonEmpty: {
    borderColor: "#e5e7eb",
  },
  timeButtonText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  timeButtonPlaceholder: {
    color: "#9ca3af",
  },
  addHorarioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#8b5cf6",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addHorarioButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  confirmButton: {
    backgroundColor: "#8b5cf6",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});