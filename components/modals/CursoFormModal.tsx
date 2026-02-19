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
  nuevoCursoAlquilerProfesor,
} from "@/model/model";
import { TimePickerModal } from "../pickers/TimePicker";
import { CuotasCalculadas } from "../pagos/CuotasCalculadas";
import { calcularCuotas } from "@/util/calcularCuotas";

interface FormValues {
  horarios: HorarioDto[];
  tipoPago: TipoPago[];
  recargo: number | null;
}

interface CursoFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (curso: nuevoCursoAlquilerProfesor) => void;
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
        cuotas: yup
          .number()
          .positive("Las cuotas deben ser mayor a 0")
          .required("Las cuotas son requeridas"),
      }),
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
    .max(100, "El recargo no puede ser mayor a 100%")
    .default(null),
});

// Función helper para formatear fechas a DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00"); // Forzar timezone local
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      tipoPago: [],
      recargo: null,
    },
  });

  const tiposPago = watch("tipoPago") || [];

  const cuotasCalculadas = useMemo(
    () => calcularCuotas(curso.fechaInicio, curso.fechaFin),
    [curso.fechaInicio, curso.fechaFin],
  );

  // Calcular duración del curso
  const duracion = useMemo(() => {
    if (!curso.fechaInicio || !curso.fechaFin) return null;

    // Forzar timezone local para evitar problemas de conversión
    const inicio = new Date(curso.fechaInicio + "T00:00:00");
    const fin = new Date(curso.fechaFin + "T00:00:00");

    if (fin <= inicio) return null;

    const diferenciaMs = fin.getTime() - inicio.getTime();
    const totalDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    const meses = Math.floor(totalDias / 30);
    const diasRestantes = totalDias % 30;

    return { totalDias, meses, diasRestantes };
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

  const toggleTipoPago = (tipo: PagoType): void => {
    const tieneActualmente = tieneTipoPago(tipo);

    if (tieneActualmente) {
      setValue(
        "tipoPago",
        tiposPago.filter((tp) => tp.tipo !== tipo),
      );
    } else {
      const cuotas = tipo === PagoType.MENSUAL ? cuotasCalculadas : 1;
      setValue("tipoPago", [...tiposPago, { tipo, monto: 0, cuotas }]);
    }
  };

  const updateMontoTipoPago = (tipo: PagoType, monto: number): void => {
    const newTiposPago = tiposPago.map((tp) =>
      tp.tipo === tipo ? { ...tp, monto } : tp,
    );
    setValue("tipoPago", newTiposPago);
  };


  const onSubmit = async (data: FormValues): Promise<void> => {
    try {
      const tiposPagoConCuotas = data.tipoPago.map((tp) => ({
        tipo: tp.tipo,
        monto: tp.monto,
        cuotas: tp.tipo === PagoType.MENSUAL ? cuotasCalculadas : 1,
      }));

      // Construir el objeto curso actualizado
      const cursoActualizado: nuevoCursoAlquilerProfesor = {
        id: curso.id,
        tiposPago: tiposPagoConCuotas,
        recargo: data.recargo || 0,
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
              <Text style={styles.title}>Alta de Curso</Text>
              <Text style={styles.subtitle}>{curso.nombre}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoBannerText}>
                Complete los horarios y modalidades de pago para activar el
                curso
              </Text>
            </View>

            {/* Información de Alquiler */}
            <View style={styles.alquilerInfoSection}>
              <View style={styles.alquilerInfoHeader}>
                <Ionicons name="cash-outline" size={20} color="#3b82f6" />
                <Text style={styles.alquilerInfoTitle}>
                  Información de Alquiler
                </Text>
              </View>

              <View style={styles.alquilerInfoContent}>
                <View style={styles.alquilerInfoRow}>
                  <Text style={styles.alquilerInfoLabel}>Monto Mensual:</Text>
                  <Text style={styles.alquilerInfoValue}>
                    ${curso.montoAlquiler?.toLocaleString() || "0"}
                  </Text>
                </View>

                <View style={styles.alquilerInfoRow}>
                  <Text style={styles.alquilerInfoLabel}>Cuotas:</Text>
                  <Text style={styles.alquilerInfoValue}>
                    {curso.cuotasAlquiler || 0}
                  </Text>
                </View>

                <View
                  style={[styles.alquilerInfoRow, styles.alquilerInfoTotal]}
                >
                  <Text style={styles.alquilerInfoLabelBold}>
                    Total Alquiler:
                  </Text>
                  <Text style={styles.alquilerInfoValueBold}>
                    $
                    {(
                      (curso.montoAlquiler || 0) * (curso.cuotasAlquiler || 0)
                    ).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Sección: Fechas y Duración (readonly) */}
            <View style={styles.section}>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Fecha de Inicio</Text>
                  <View style={styles.readonlyField}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.readonlyText}>
                      {formatDateToDDMMYYYY(curso.fechaInicio)}
                    </Text>
                  </View>
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Fecha de Fin</Text>
                  <View style={styles.readonlyField}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.readonlyText}>
                      {formatDateToDDMMYYYY(curso.fechaFin)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Mostrar duración del curso */}
              {duracion && (
                <View style={styles.duracionBanner}>
                  <Ionicons name="time-outline" size={18} color="#3b82f6" />
                  <Text style={styles.duracionText}>
                    Duración aproximada: ~{duracion.meses}{" "}
                    {duracion.meses === 1 ? "mes" : "meses"}
                    {duracion.diasRestantes > 0 &&
                      ` y ${duracion.diasRestantes} ${
                        duracion.diasRestantes === 1 ? "día" : "días"
                      }`}{" "}
                    ({duracion.totalDias} días)
                  </Text>
                </View>
              )}
            </View>

            {/* Horarios */}
            <View style={styles.section}>
  <Text style={styles.subsectionLabel}>Horarios del Curso</Text>
  
  {curso.horarios && curso.horarios.length > 0 ? (
    <View style={styles.horariosReadonlyContainer}>
      {curso.horarios.map((horario, index) => (
        <View key={index} style={styles.horarioReadonlyCard}>
          <View style={styles.horarioReadonlyHeader}>
            <Ionicons name="calendar" size={18} color="#3b82f6" />
            <Text style={styles.horarioReadonlyDia}>
              {horario.dia}
            </Text>
          </View>
          <View style={styles.horarioReadonlyTime}>
            <View style={styles.horarioReadonlyTimeItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.horarioReadonlyTimeText}>
                {horario.horaInicio}
              </Text>
            </View>
            <Text style={styles.horarioReadonlyTimeSeparator}>-</Text>
            <View style={styles.horarioReadonlyTimeItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.horarioReadonlyTimeText}>
                {horario.horaFin}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  ) : (
    <View style={styles.noHorariosContainer}>
      <Ionicons name="alert-circle" size={24} color="#f59e0b" />
      <Text style={styles.noHorariosText}>
        No hay horarios configurados para este curso
      </Text>
    </View>
  )}
</View>

            {/* Tipos de Pago */}
            <View style={styles.section}>
              <Text style={styles.subsectionLabel}>Modalidades de Pago *</Text>

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
                    </View>
                  </View>
                </TouchableOpacity>

                {tieneTipoPago(PagoType.MENSUAL) && (
                  <View style={styles.tipoPagoInput}>
                    <Input
                      label="Monto por cuota ($) *"
                      value={
                        getMontoTipoPago(PagoType.MENSUAL)?.toString() || ""
                      }
                      onChangeText={(text) =>
                        updateMontoTipoPago(
                          PagoType.MENSUAL,
                          parseFloat(text) || 0,
                        )
                      }
                      keyboardType="numeric"
                      placeholder="10000"
                    />

                    <CuotasCalculadas
                      fechaInicio={new Date(curso.fechaInicio + "T00:00:00")}
                      fechaFin={new Date(curso.fechaFin + "T00:00:00")}
                      label="Cuotas del curso"
                      helpText="Los alumnos pagarán esta cantidad de cuotas"
                    />

                    {cuotasCalculadas > 0 &&
                      getMontoTipoPago(PagoType.MENSUAL) > 0 && (
                        <Text style={styles.totalInfo}>
                          Total: $
                          {(
                            getMontoTipoPago(PagoType.MENSUAL) *
                            cuotasCalculadas
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
                          parseFloat(text) || 0,
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

            {/* Recargo por atraso */}
            <View style={styles.section}>
              <Controller
                control={control}
                name="recargo"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Recargo por Atraso (%) (Opcional)"
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
              title="Activar Curso"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
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
    height: 600,
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
  alquilerInfoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  alquilerInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  alquilerInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  alquilerInfoContent: {
    gap: 10,
  },
  alquilerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  alquilerInfoTotal: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  alquilerInfoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  alquilerInfoValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  alquilerInfoLabelBold: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
  },
  alquilerInfoValueBold: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 6,
  },
  readonlyField: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  readonlyText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  duracionBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  duracionText: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "500",
    flex: 1,
  },
  subsectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
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
    horariosReadonlyContainer: {
    gap: 10,
  },
  horarioReadonlyCard: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  horarioReadonlyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  horarioReadonlyDia: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  horarioReadonlyTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  horarioReadonlyTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  horarioReadonlyTimeText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  horarioReadonlyTimeSeparator: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "600",
  },
  noHorariosContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  noHorariosText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
});
