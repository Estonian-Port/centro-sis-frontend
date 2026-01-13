// components/modals/CursoFormModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import * as yup from "yup";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Curso,
  DayOfWeek,
  HorarioDto,
  TipoPago,
  PagoType,
} from "@/model/model";
import { TimePickerModal } from "../pickers/TimePicker";

interface FormValues {
  horarios: HorarioDto[];
  tipoPago: TipoPago[];
  recargo: number | null;
}

interface CursoFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (curso: Curso) => void;
  curso: Curso;
}

// Validación personalizada para horarios
const validarHorarios = (horarios: any[]): boolean => {
  if (!horarios || horarios.length === 0) return false;

  return horarios.every((horario) => {
    if (!horario.horaInicio || !horario.horaFin) return false;

    const [horaIni, minIni] = horario.horaInicio.split(":").map(Number);
    const [horaFin, minFin] = horario.horaFin.split(":").map(Number);

    const inicioEnMinutos = horaIni * 60 + minIni;
    const finEnMinutos = horaFin * 60 + minFin;

    return finEnMinutos > inicioEnMinutos;
  });
};

// Esquema de validación
const validationSchema = yup.object().shape({
  horarios: yup
    .array()
    .of(
      yup.object().shape({
        dia: yup
          .string()
          .oneOf(Object.values(DayOfWeek), "Día inválido")
          .required("El día es requerido"),
        horaInicio: yup
          .string()
          .matches(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)")
          .required("La hora de inicio es requerida"),
        horaFin: yup
          .string()
          .matches(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)")
          .required("La hora de fin es requerida"),
      })
    )
    .min(1, "Debe agregar al menos un horario")
    .test(
      "horarios-validos",
      "La hora de fin debe ser posterior a la hora de inicio",
      (value) => {
        if (!value) return false;
        return validarHorarios(value);
      }
    )
    .required(),
  tipoPago: yup
    .array()
    .of(
      yup.object().shape({
        tipo: yup
          .string()
          .oneOf(Object.values(PagoType), "Tipo inválido")
          .required("El tipo es requerido"),
        monto: yup
          .number()
          .positive("El monto debe ser mayor a 0")
          .required("El monto es requerido"),
      })
    )
    .min(1, "Debe agregar al menos un tipo de pago")
    .max(2, "Solo puede agregar pago mensual y/o total")
    .required(),
  recargo: yup
    .number()
    .nullable()
    .typeError("El recargo debe ser un número")
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(0, "El recargo no puede ser negativo")
    .default(null),
});

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

export const CursoFormModal: React.FC<CursoFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  curso,
}) => {
  const [showTimePicker, setShowTimePicker] = useState<{
    horarioIndex: number;
    field: "horaInicio" | "horaFin";
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      horarios: [
        {
          dia: DayOfWeek.MONDAY,
          horaInicio: "",
          horaFin: "",
        },
      ],
      tipoPago: [],
      recargo: null,
    },
  });

  const horarios = watch("horarios") || [];
  const tiposPago = watch("tipoPago") || [];

  // Calcular cantidad de meses entre fechas del curso
  const cantidadMeses = useMemo(() => {
    if (!curso.fechaInicio || !curso.fechaFin) return 0;

    const inicio = new Date(curso.fechaInicio);
    const fin = new Date(curso.fechaFin);

    if (fin <= inicio) return 0;

    const meses =
      (fin.getFullYear() - inicio.getFullYear()) * 12 +
      (fin.getMonth() - inicio.getMonth()) +
      (fin.getDate() >= inicio.getDate() ? 1 : 0);

    return Math.max(1, meses);
  }, [curso.fechaInicio, curso.fechaFin]);

  // Verificar si un tipo de pago está seleccionado
  const tieneTipoPago = (tipo: PagoType): boolean => {
    return tiposPago.some((tp) => tp.tipo === tipo);
  };

  // Obtener monto de un tipo de pago
  const getMontoTipoPago = (tipo: PagoType): number => {
    const tipoPago = tiposPago.find((tp) => tp.tipo === tipo);
    return tipoPago?.monto || 0;
  };

  const addHorario = (): void => {
    setValue("horarios", [
      ...horarios,
      {
        dia: DayOfWeek.MONDAY,
        horaInicio: "",
        horaFin: "",
      },
    ]);
  };

  const removeHorario = (index: number): void => {
    setValue(
      "horarios",
      horarios.filter((_, i) => i !== index)
    );
  };

  const updateHorario = (
    index: number,
    field: keyof HorarioDto,
    value: string | DayOfWeek
  ): void => {
    const newHorarios = [...horarios];
    (newHorarios[index][field] as any) = value;
    setValue("horarios", newHorarios);
  };

  const toggleTipoPago = (tipo: PagoType): void => {
    const tieneActualmente = tieneTipoPago(tipo);

    if (tieneActualmente) {
      setValue(
        "tipoPago",
        tiposPago.filter((tp) => tp.tipo !== tipo)
      );
    } else {
      setValue("tipoPago", [...tiposPago, { tipo, monto: 0 }]);
    }
  };

  const updateMontoTipoPago = (tipo: PagoType, monto: number): void => {
    const newTiposPago = tiposPago.map((tp) =>
      tp.tipo === tipo ? { ...tp, monto } : tp
    );
    setValue("tipoPago", newTiposPago);
  };

  const onSubmit = async (data: FormValues): Promise<void> => {
    try {
      // Construir el objeto curso actualizado
      const cursoActualizado: Curso = {
        ...curso,
        horarios: data.horarios,
        tiposPago: data.tipoPago,
        recargoPorAtraso: data.recargo || 0,
      };

      onSuccess(cursoActualizado);
    } catch (error) {
      console.error("Error al completar curso:", error);
    }
  };

  const handleClose = (): void => {
    reset();
    setShowTimePicker(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Completar Curso</Text>
              <Text style={styles.subtitle}>{curso.nombre}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoBannerText}>
                Complete los datos faltantes para activar el curso
              </Text>
            </View>

            {/* Datos del curso (readonly) */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha de inicio:</Text>
                <Text style={styles.infoValue}>{curso.fechaInicio}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha de fin:</Text>
                <Text style={styles.infoValue}>{curso.fechaFin}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duración:</Text>
                <Text style={styles.infoValue}>
                  {cantidadMeses} {cantidadMeses === 1 ? "mes" : "meses"}
                </Text>
              </View>
            </View>

            {/* Horarios */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Horarios *</Text>
                <TouchableOpacity onPress={addHorario} style={styles.addButton}>
                  <Ionicons name="add-circle" size={20} color="#3b82f6" />
                  <Text style={styles.addButtonText}>Agregar</Text>
                </TouchableOpacity>
              </View>

              {horarios.map((horario, index) => (
                <View key={index} style={styles.horarioCard}>
                  {/* Selector de Días */}
                  <View style={styles.daysContainer}>
                    <Text style={styles.inputLabel}>Día de la semana</Text>
                    <View style={styles.daysRow}>
                      {diasOrdenados.map((dia) => (
                        <TouchableOpacity
                          key={dia}
                          style={[
                            styles.dayButton,
                            horario.dia === dia && styles.dayButtonSelected,
                          ]}
                          onPress={() => updateHorario(index, "dia", dia)}
                        >
                          <Text
                            style={[
                              styles.dayButtonText,
                              horario.dia === dia &&
                                styles.dayButtonTextSelected,
                            ]}
                          >
                            {diasSemanaMap[dia].substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Horarios */}
                  <View style={styles.timeRow}>
                    <View style={styles.timeInput}>
                      <Text style={styles.inputLabel}>Hora Inicio</Text>
                      <TouchableOpacity
                        style={[
                          styles.timeButton,
                          !horario.horaInicio && styles.timeButtonEmpty,
                        ]}
                        onPress={() =>
                          setShowTimePicker({
                            horarioIndex: index,
                            field: "horaInicio",
                          })
                        }
                      >
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color="#9ca3af"
                        />
                        <Text
                          style={[
                            styles.timeButtonText,
                            !horario.horaInicio && styles.timeButtonPlaceholder,
                          ]}
                        >
                          {horario.horaInicio || "Ej: 14:00"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.timeInput}>
                      <Text style={styles.inputLabel}>Hora Fin</Text>
                      <TouchableOpacity
                        style={[
                          styles.timeButton,
                          !horario.horaFin && styles.timeButtonEmpty,
                        ]}
                        onPress={() =>
                          setShowTimePicker({
                            horarioIndex: index,
                            field: "horaFin",
                          })
                        }
                      >
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color="#9ca3af"
                        />
                        <Text
                          style={[
                            styles.timeButtonText,
                            !horario.horaFin && styles.timeButtonPlaceholder,
                          ]}
                        >
                          {horario.horaFin || "Ej: 16:00"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {horarios.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeHorario(index)}
                      style={styles.removeButtonCard}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ef4444"
                      />
                      <Text style={styles.removeButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {typeof errors.horarios?.message === "string" && (
                <Text style={styles.errorText}>{errors.horarios.message}</Text>
              )}
            </View>

            {/* Tipos de Pago */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Modalidades de Pago *</Text>

              {/* Pago Mensual */}
              <View style={styles.tipoPagoCard}>
                <TouchableOpacity
                  style={[
                    styles.tipoPagoCheckbox,
                    tieneTipoPago(PagoType.MENSUAL) &&
                      styles.tipoPagoCheckboxSelected,
                  ]}
                  onPress={() => toggleTipoPago(PagoType.MENSUAL)}
                >
                  <View style={styles.tipoPagoHeader}>
                    <Ionicons
                      name={
                        tieneTipoPago(PagoType.MENSUAL)
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={24}
                      color={
                        tieneTipoPago(PagoType.MENSUAL) ? "#3b82f6" : "#9ca3af"
                      }
                    />
                    <View style={styles.tipoPagoHeaderText}>
                      <Text style={styles.tipoPagoTitle}>Pago Mensual</Text>
                      {cantidadMeses > 0 && (
                        <Text style={styles.tipoPagoSubtitle}>
                          {cantidadMeses}{" "}
                          {cantidadMeses === 1 ? "cuota" : "cuotas"}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {tieneTipoPago(PagoType.MENSUAL) && (
                  <View style={styles.tipoPagoInput}>
                    <Input
                      label={`Monto por cuota ($)`}
                      value={
                        getMontoTipoPago(PagoType.MENSUAL)?.toString() || ""
                      }
                      onChangeText={(text) =>
                        updateMontoTipoPago(
                          PagoType.MENSUAL,
                          parseFloat(text) || 0
                        )
                      }
                      keyboardType="numeric"
                      placeholder="10000"
                    />
                    {cantidadMeses > 0 &&
                      getMontoTipoPago(PagoType.MENSUAL) > 0 && (
                        <Text style={styles.totalInfo}>
                          Total: $
                          {(
                            getMontoTipoPago(PagoType.MENSUAL) * cantidadMeses
                          ).toLocaleString()}
                        </Text>
                      )}
                  </View>
                )}
              </View>

              {/* Pago Total */}
              <View style={styles.tipoPagoCard}>
                <TouchableOpacity
                  style={[
                    styles.tipoPagoCheckbox,
                    tieneTipoPago(PagoType.TOTAL) &&
                      styles.tipoPagoCheckboxSelected,
                  ]}
                  onPress={() => toggleTipoPago(PagoType.TOTAL)}
                >
                  <View style={styles.tipoPagoHeader}>
                    <Ionicons
                      name={
                        tieneTipoPago(PagoType.TOTAL)
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={24}
                      color={
                        tieneTipoPago(PagoType.TOTAL) ? "#3b82f6" : "#9ca3af"
                      }
                    />
                    <View style={styles.tipoPagoHeaderText}>
                      <Text style={styles.tipoPagoTitle}>Pago Total</Text>
                      <Text style={styles.tipoPagoSubtitle}>
                        Pago único del curso completo
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {tieneTipoPago(PagoType.TOTAL) && (
                  <View style={styles.tipoPagoInput}>
                    <Input
                      label="Monto total ($)"
                      value={getMontoTipoPago(PagoType.TOTAL)?.toString() || ""}
                      onChangeText={(text) =>
                        updateMontoTipoPago(
                          PagoType.TOTAL,
                          parseFloat(text) || 0
                        )
                      }
                      keyboardType="numeric"
                      placeholder="50000"
                    />
                  </View>
                )}
              </View>
              {typeof errors.tipoPago?.message === "string" && (
                <Text style={styles.errorText}>{errors.tipoPago.message}</Text>
              )}
            </View>

            {/* Campos opcionales */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="recargo"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Recargo Atraso (%)"
                      value={value?.toString() || ""}
                      onChangeText={(text) =>
                        onChange(text ? parseFloat(text) : null)
                      }
                      keyboardType="numeric"
                      placeholder="10"
                      error={errors.recargo?.message}
                    />
                  )}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
            />
            <Button
              title="Completar Curso"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </View>
        </View>
      </View>

      {/* Modal para Time Picker */}
      <TimePickerModal
        visible={showTimePicker !== null}
        onClose={() => setShowTimePicker(null)}
        onSelect={(time) => {
          if (showTimePicker) {
            updateHorario(
              showTimePicker.horarioIndex,
              showTimePicker.field,
              time
            );
          }
        }}
        title={
          showTimePicker?.field === "horaInicio"
            ? "Seleccionar Hora de Inicio"
            : "Seleccionar Hora de Fin"
        }
        selectedTime={
          showTimePicker
            ? horarios[showTimePicker.horarioIndex]?.[showTimePicker.field]
            : undefined
        }
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
    borderRadius: 12,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 700 : "100%",
    maxHeight: "90%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
    flex: 1,
  },
  infoSection: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
  },
  horarioCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  daysContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 6,
  },
  daysRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    minWidth: 45,
    alignItems: "center",
  },
  dayButtonSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#dbeafe",
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  dayButtonTextSelected: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    color: "#b0b0b0",
  },
  removeButtonCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 8,
    gap: 6,
  },
  removeButtonText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500",
  },
  tipoPagoCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tipoPagoCheckbox: {
    marginBottom: 12,
  },
  tipoPagoCheckboxSelected: {},
  tipoPagoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipoPagoHeaderText: {
    flex: 1,
  },
  tipoPagoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  tipoPagoSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  tipoPagoInput: {
    marginTop: 8,
  },
  totalInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
