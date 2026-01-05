import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState, useMemo, useEffect } from "react";
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
  nuevoCursoAlquiler,
  nuevoCursoComision,
  DayOfWeek,
  HorarioDto,
  TipoPagoDto,
  TipoPago,
  ProfesorLista,
} from "@/model/model";
import { DatePickerWrapper } from "../pickers/DataPicker";
import { TimePickerModal } from "../pickers/TimePicker";
import { usuarioService } from "@/services/usuario.service";
import { cursoService } from "@/services/curso.service";
import Toast from "react-native-toast-message";

interface FormValues {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  profesoresId: number[];
  montoAlquiler?: number;
  horarios?: HorarioDto[];
  tipoPago?: TipoPagoDto[];
  recargo?: number | null;
  comisionProfesor?: number | null;
}

interface CreateCourseModalProps {
  visible: boolean;
  onClose: () => void;
}

type Modalidad = "ALQUILER" | "COMISION";

// Validación personalizada para horarios
const validarHorarios = (horarios: any[]): boolean => {
  if (!horarios || horarios.length === 0) return false;
  
  return horarios.every(horario => {
    if (!horario.horaInicio || !horario.horaFin) return false;
    
    const [horaIni, minIni] = horario.horaInicio.split(':').map(Number);
    const [horaFin, minFin] = horario.horaFin.split(':').map(Number);
    
    const inicioEnMinutos = horaIni * 60 + minIni;
    const finEnMinutos = horaFin * 60 + minFin;
    
    return finEnMinutos > inicioEnMinutos;
  });
};

// Esquema de validación dinámico
const getValidationSchema = (modalidad: Modalidad): any => {
  const baseSchema = {
    nombre: yup.string().required("El nombre es requerido"),
    fechaInicio: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (YYYY-MM-DD)")
      .required("La fecha de inicio es requerida"),
    fechaFin: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (YYYY-MM-DD)")
      .required("La fecha de fin es requerida")
      .test(
        "fecha-fin-mayor",
        "La fecha de fin debe ser posterior a la fecha de inicio",
        function (value) {
          const { fechaInicio } = this.parent;
          if (!fechaInicio || !value) return true;
          return new Date(value) > new Date(fechaInicio);
        }
      ),
    profesoresId: yup
      .array()
      .of(yup.number().required())
      .min(1, "Debe seleccionar al menos un profesor")
      .required("Los profesores son requeridos"),
  };

  if (modalidad === "ALQUILER") {
    return yup.object().shape({
      ...baseSchema,
      montoAlquiler: yup
        .number()
        .positive("El monto debe ser mayor a 0")
        .required("El monto de alquiler es requerido"),
    });
  } else {
    return yup.object().shape({
      ...baseSchema,
      horarios: yup
        .array()
        .of(
          yup.object().shape({
            diaSemana: yup
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
              .oneOf(Object.values(TipoPago), "Tipo inválido")
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
        .transform((value, originalValue) =>
          originalValue === "" ? null : value
        )
        .min(0, "El recargo no puede ser negativo"),
      comisionProfesor: yup
        .number()
        .nullable()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value
        )
        .min(0, "La comisión no puede ser negativa")
        .max(100, "La comisión no puede ser mayor al 100%"),
    });
  }
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

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  visible,
  onClose,
}) => {
  const [modalidad, setModalidad] = useState<Modalidad>("ALQUILER");
  const [showDatePicker, setShowDatePicker] = useState<"inicio" | "fin" | null>(
    null
  );
  const [showTimePicker, setShowTimePicker] = useState<{
    horarioIndex: number;
    field: "horaInicio" | "horaFin";
  } | null>(null);
  const [profesores, setProfesores] = useState<ProfesorLista[]>([]);

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const data = await usuarioService.getNombresProfesores();
        setProfesores(data);
      } catch (error) {
        console.error("Error fetching professors:", error);
      }
    };
    fetchProfesores();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(getValidationSchema(modalidad)),
    defaultValues: {
      nombre: "",
      fechaInicio: "",
      fechaFin: "",
      profesoresId: [],
      montoAlquiler: undefined,
      // CAMBIO: Agregar un horario por defecto
      horarios: [
        {
          diaSemana: DayOfWeek.MONDAY,
          horaInicio: "",
          horaFin: "",
        },
      ],
      tipoPago: [],
      recargo: null,
      comisionProfesor: null,
    },
  });

  const profesoresSeleccionados = watch("profesoresId");
  const horarios = watch("horarios") || [];
  const tiposPago = watch("tipoPago") || [];
  const fechaInicio = watch("fechaInicio");
  const fechaFin = watch("fechaFin");

  // Calcular cantidad de meses entre fechas
  const cantidadMeses = useMemo(() => {
    if (!fechaInicio || !fechaFin) return 0;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (fin <= inicio) return 0;
    
    const meses =
      (fin.getFullYear() - inicio.getFullYear()) * 12 +
      (fin.getMonth() - inicio.getMonth()) +
      (fin.getDate() >= inicio.getDate() ? 1 : 0);
    
    return Math.max(1, meses);
  }, [fechaInicio, fechaFin]);

  // Verificar si un tipo de pago está seleccionado
  const tieneTipoPago = (tipo: TipoPago): boolean => {
    return tiposPago.some((tp) => tp.tipo === tipo);
  };

  // Obtener monto de un tipo de pago
  const getMontoTipoPago = (tipo: TipoPago): number => {
    const tipoPago = tiposPago.find((tp) => tp.tipo === tipo);
    return tipoPago?.monto || 0;
  };

  const toggleProfesor = (profesorId: number): void => {
    const current = profesoresSeleccionados || [];
    const newSelection = current.includes(profesorId)
      ? current.filter((id) => id !== profesorId)
      : [...current, profesorId];
    setValue("profesoresId", newSelection);
  };

  const addHorario = (): void => {
    setValue("horarios", [
      ...horarios,
      {
        diaSemana: DayOfWeek.MONDAY,
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

  const toggleTipoPago = (tipo: TipoPago): void => {
    const tieneActualmente = tieneTipoPago(tipo);
    
    if (tieneActualmente) {
      // Remover el tipo de pago
      setValue(
        "tipoPago",
        tiposPago.filter((tp) => tp.tipo !== tipo)
      );
    } else {
      // Agregar el tipo de pago
      setValue("tipoPago", [
        ...tiposPago,
        { tipo, monto: 0 },
      ]);
    }
  };

  const updateMontoTipoPago = (tipo: TipoPago, monto: number): void => {
    const newTiposPago = tiposPago.map((tp) =>
      tp.tipo === tipo ? { ...tp, monto } : tp
    );
    setValue("tipoPago", newTiposPago);
  };

  // Función para formatear fecha a YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Función para parsear fecha desde string
  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Handlers para date picker
  const handleDateSelect = (field: "fechaInicio" | "fechaFin", date: Date) => {
    setValue(field, formatDate(date));
    setShowDatePicker(null);
  };

    const crearCursoAlquiler = async (nuevoCurso: nuevoCursoAlquiler) => {
      try {
        const response = await cursoService.altaCursoAlquiler(nuevoCurso);
        Toast.show({
          type: "success",
          text1: "Curso creado exitosamente",
          text2: `El curso ha sido creado correctamente.`,
          position: "bottom",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo crear el curso.",
          position: "bottom",
        });
      }
    };
  
      const crearCursoComision = async (nuevoCurso: nuevoCursoComision) => {
      try {
        const response = await cursoService.altaCursoComision(nuevoCurso);
        Toast.show({
          type: "success",
          text1: "Curso creado exitosamente",
          text2: `El curso ha sido creado correctamente.`,
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo crear el curso.",
        });
      }
    };

  const onSubmit = async (data: FormValues): Promise<void> => {
    try {
      let requestData: nuevoCursoAlquiler | nuevoCursoComision;

      if (modalidad === "ALQUILER") {
        requestData = {
          id: 0,
          nombre: data.nombre,
          montoAlquiler: data.montoAlquiler || 0,
          profesoresId: data.profesoresId,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
        };
        await crearCursoAlquiler(requestData);
      } else {
        requestData = {
          id: 0,
          nombre: data.nombre,
          horarios: data.horarios || [],
          tipoPago: data.tipoPago || [],
          recargo: data.recargo || null,
          comisionProfesor: data.comisionProfesor || null,
          profesoresId: data.profesoresId,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
        };
        await crearCursoComision(requestData);
      }
      handleClose();
    } catch (error) {
      console.error("Error al crear curso:", error);
    }
  };

  const handleClose = (): void => {
    reset();
    setModalidad("ALQUILER");
    setShowDatePicker(null);
    setShowTimePicker(null);
    onClose();
  };

  const handleModalidadChange = (newModalidad: Modalidad): void => {
    setModalidad(newModalidad);
    if (newModalidad === "ALQUILER") {
      setValue("horarios", [
        {
          diaSemana: DayOfWeek.MONDAY,
          horaInicio: "",
          horaFin: "",
        },
      ]);
      setValue("tipoPago", []);
      setValue("recargo", null);
      setValue("comisionProfesor", null);
      setValue("montoAlquiler", undefined);
    } else {
      setValue("montoAlquiler", undefined);
      // Mantener el horario por defecto cuando se cambia a comisión
      setValue("horarios", [
        {
          diaSemana: DayOfWeek.MONDAY,
          horaInicio: "",
          horaFin: "",
        },
      ]);
      setValue("tipoPago", []);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Nuevo Curso</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Nombre */}
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nombre del Curso"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ej: Yoga Principiantes"
                  error={errors.nombre?.message}
                />
              )}
            />

            {/* Fechas con Date Picker */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Fecha de Inicio *</Text>
                <Controller
                  control={control}
                  name="fechaInicio"
                  render={({ field: { value } }) => (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.datePickerButton,
                          errors.fechaInicio && styles.datePickerButtonError,
                        ]}
                        onPress={() => setShowDatePicker("inicio")}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#6b7280"
                        />
                        <Text
                          style={[
                            styles.datePickerButtonText,
                            !value && styles.datePickerPlaceholder,
                          ]}
                        >
                          {value || "Seleccionar"}
                        </Text>
                      </TouchableOpacity>
                      {errors.fechaInicio && (
                        <Text style={styles.errorText}>
                          {errors.fechaInicio.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Fecha de Fin *</Text>
                <Controller
                  control={control}
                  name="fechaFin"
                  render={({ field: { value } }) => (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.datePickerButton,
                          errors.fechaFin && styles.datePickerButtonError,
                        ]}
                        onPress={() => setShowDatePicker("fin")}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#6b7280"
                        />
                        <Text
                          style={[
                            styles.datePickerButtonText,
                            !value && styles.datePickerPlaceholder,
                          ]}
                        >
                          {value || "Seleccionar"}
                        </Text>
                      </TouchableOpacity>
                      {errors.fechaFin && (
                        <Text style={styles.errorText}>
                          {errors.fechaFin.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>
            </View>

            {/* Mostrar duración del curso */}
            {fechaInicio && fechaFin && cantidadMeses > 0 && (
              <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={styles.infoBannerText}>
                  Duración del curso: {cantidadMeses}{" "}
                  {cantidadMeses === 1 ? "mes" : "meses"}
                </Text>
              </View>
            )}

            {/* Profesores */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Profesores Asignados *</Text>
              {profesores.map((profesor) => (
                <TouchableOpacity
                  key={profesor.id}
                  style={[
                    styles.checkboxOption,
                    profesoresSeleccionados?.includes(profesor.id) &&
                      styles.checkboxSelected,
                  ]}
                  onPress={() => toggleProfesor(profesor.id)}
                >
                  <Text
                    style={[
                      styles.checkboxText,
                      profesoresSeleccionados?.includes(profesor.id) &&
                        styles.checkboxTextSelected,
                    ]}
                  >
                    {profesor.nombre} {profesor.apellido}
                  </Text>
                  <Ionicons
                    name={
                      profesoresSeleccionados?.includes(profesor.id)
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={20}
                    color={
                      profesoresSeleccionados?.includes(profesor.id)
                        ? "#3b82f6"
                        : "#9ca3af"
                    }
                  />
                </TouchableOpacity>
              ))}
              {errors.profesoresId && (
                <Text style={styles.errorText}>
                  {errors.profesoresId.message}
                </Text>
              )}
            </View>

            {/* Selector de Modalidad */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Modalidad del Curso *</Text>
              <View style={styles.modalidadContainer}>
                <TouchableOpacity
                  style={[
                    styles.modalidadButton,
                    modalidad === "ALQUILER" &&
                      styles.modalidadButtonActiveBlue,
                  ]}
                  onPress={() => handleModalidadChange("ALQUILER")}
                >
                  <Ionicons
                    name="home-outline"
                    size={24}
                    color={modalidad === "ALQUILER" ? "#3b82f6" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.modalidadText,
                      modalidad === "ALQUILER" &&
                        styles.modalidadTextActiveBlue,
                    ]}
                  >
                    Alquiler de Espacio
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalidadButton,
                    modalidad === "COMISION" &&
                      styles.modalidadButtonActiveGreen,
                  ]}
                  onPress={() => handleModalidadChange("COMISION")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={modalidad === "COMISION" ? "#10b981" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.modalidadText,
                      modalidad === "COMISION" &&
                        styles.modalidadTextActiveGreen,
                    ]}
                  >
                    Por Comisión
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campos específicos de ALQUILER */}
            {modalidad === "ALQUILER" && (
              <View style={[styles.specificSection, styles.alquilerSection]}>
                <View style={styles.specificHeader}>
                  <Ionicons name="home" size={20} color="#3b82f6" />
                  <Text style={styles.specificTitle}>Datos de Alquiler</Text>
                </View>

                <Controller
                  control={control}
                  name="montoAlquiler"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Monto de Alquiler ($) *"
                      value={value?.toString() || ""}
                      onChangeText={(text) =>
                        onChange(text ? parseFloat(text) : undefined)
                      }
                      keyboardType="numeric"
                      placeholder="10000"
                      error={errors.montoAlquiler?.message}
                    />
                  )}
                />
              </View>
            )}

            {/* Campos específicos de COMISION */}
            {modalidad === "COMISION" && (
              <View style={[styles.specificSection, styles.comisionSection]}>
                <View style={styles.specificHeader}>
                  <Ionicons name="cash" size={20} color="#10b981" />
                  <Text style={styles.specificTitle}>Datos de Comisión</Text>
                </View>

                {/* Horarios */}
                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Text style={styles.subsectionLabel}>Horarios *</Text>
                    <TouchableOpacity
                      onPress={addHorario}
                      style={styles.addButton}
                    >
                      <Ionicons name="add-circle" size={20} color="#10b981" />
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
                                horario.diaSemana === dia &&
                                  styles.dayButtonSelected,
                              ]}
                              onPress={() =>
                                updateHorario(index, "diaSemana", dia)
                              }
                            >
                              <Text
                                style={[
                                  styles.dayButtonText,
                                  horario.diaSemana === dia &&
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
                                !horario.horaInicio &&
                                  styles.timeButtonPlaceholder,
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
                                !horario.horaFin &&
                                  styles.timeButtonPlaceholder,
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
                  {errors.horarios && (
                    <Text style={styles.errorText}>
                      {typeof errors.horarios === 'string' 
                        ? errors.horarios 
                        : errors.horarios.message}
                    </Text>
                  )}
                </View>

                {/* Tipos de Pago */}
                <View style={styles.subsection}>
                  <Text style={styles.subsectionLabel}>
                    Modalidades de Pago *
                  </Text>

                  {/* Pago Mensual */}
                  <View style={styles.tipoPagoCard}>
                    <TouchableOpacity
                      style={[
                        styles.tipoPagoCheckbox,
                        tieneTipoPago(TipoPago.MENSUAL) &&
                          styles.tipoPagoCheckboxSelected,
                      ]}
                      onPress={() => toggleTipoPago(TipoPago.MENSUAL)}
                    >
                      <View style={styles.tipoPagoHeader}>
                        <Ionicons
                          name={
                            tieneTipoPago(TipoPago.MENSUAL)
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={24}
                          color={
                            tieneTipoPago(TipoPago.MENSUAL)
                              ? "#10b981"
                              : "#9ca3af"
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

                    {tieneTipoPago(TipoPago.MENSUAL) && (
                      <View style={styles.tipoPagoInput}>
                        <Input
                          label={`Monto por cuota ($)`}
                          value={getMontoTipoPago(TipoPago.MENSUAL)?.toString() || ""}
                          onChangeText={(text) =>
                            updateMontoTipoPago(
                              TipoPago.MENSUAL,
                              parseFloat(text) || 0
                            )
                          }
                          keyboardType="numeric"
                          placeholder="10000"
                        />
                        {cantidadMeses > 0 &&
                          getMontoTipoPago(TipoPago.MENSUAL) > 0 && (
                            <Text style={styles.totalInfo}>
                              Total:{" "}
                              $
                              {(
                                getMontoTipoPago(TipoPago.MENSUAL) *
                                cantidadMeses
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
                        tieneTipoPago(TipoPago.TOTAL) &&
                          styles.tipoPagoCheckboxSelected,
                      ]}
                      onPress={() => toggleTipoPago(TipoPago.TOTAL)}
                    >
                      <View style={styles.tipoPagoHeader}>
                        <Ionicons
                          name={
                            tieneTipoPago(TipoPago.TOTAL)
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={24}
                          color={
                            tieneTipoPago(TipoPago.TOTAL)
                              ? "#10b981"
                              : "#9ca3af"
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

                    {tieneTipoPago(TipoPago.TOTAL) && (
                      <View style={styles.tipoPagoInput}>
                        <Input
                          label="Monto total ($)"
                          value={getMontoTipoPago(TipoPago.TOTAL)?.toString() || ""}
                          onChangeText={(text) =>
                            updateMontoTipoPago(
                              TipoPago.TOTAL,
                              parseFloat(text) || 0
                            )
                          }
                          keyboardType="numeric"
                          placeholder="50000"
                        />
                      </View>
                    )}
                  </View>

                  {errors.tipoPago && (
                    <Text style={styles.errorText}>
                      {typeof errors.tipoPago === 'string'
                        ? errors.tipoPago
                        : errors.tipoPago.message}
                    </Text>
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
                  <View style={styles.halfWidth}>
                    <Controller
                      control={control}
                      name="comisionProfesor"
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="Comisión Prof. (%)"
                          value={value?.toString() || ""}
                          onChangeText={(text) =>
                            onChange(text ? parseFloat(text) : null)
                          }
                          keyboardType="numeric"
                          placeholder="50"
                          error={errors.comisionProfesor?.message}
                        />
                      )}
                    />
                  </View>
                </View>
              </View>
            )}
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
              title="Crear Curso"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.createButton}
            />
          </View>
        </View>
      </View>

      {/* Modal para Date Picker */}
      <DatePickerWrapper
        visible={showDatePicker !== null}
        onClose={() => setShowDatePicker(null)}
        onSelect={(date) => {
          if (showDatePicker) {
            handleDateSelect(
              showDatePicker === "inicio" ? "fechaInicio" : "fechaFin",
              date
            );
          }
        }}
        title={
          showDatePicker === "inicio"
            ? "Seleccionar Fecha de Inicio"
            : "Seleccionar Fecha de Fin"
        }
        initialDate={
          showDatePicker
            ? parseDate(
                showDatePicker === "inicio" ? fechaInicio : fechaFin
              )
            : new Date()
        }
        minimumDate={
          showDatePicker === "fin" && fechaInicio
            ? parseDate(fechaInicio)
            : undefined
        }
      />

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
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 700 : "100%",
    maxHeight: "90%",
    zIndex: 1001,
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
      web: {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
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
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    gap: 8,
  },
  datePickerButtonError: {
    borderColor: "#ef4444",
  },
  datePickerButtonText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  datePickerPlaceholder: {
    color: "#b0b0b0",
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
  },
  checkboxOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  checkboxSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  checkboxText: {
    fontSize: 16,
    color: "#374151",
  },
  checkboxTextSelected: {
    color: "#3b82f6",
    fontWeight: "500",
  },
  modalidadContainer: {
    flexDirection: "row",
    gap: 12,
  },
  modalidadButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  modalidadButtonActiveBlue: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  modalidadButtonActiveGreen: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  modalidadText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  modalidadTextActiveBlue: {
    color: "#3b82f6",
  },
  modalidadTextActiveGreen: {
    color: "#10b981",
  },
  specificSection: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  alquilerSection: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  comisionSection: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  specificHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  specificTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subsectionLabel: {
    fontSize: 15,
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
    fontWeight: "500",
    color: "#10b981",
  },
  horarioCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  daysContainer: {
    marginBottom: 16,
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
    borderColor: "#10b981",
    backgroundColor: "#d1fae5",
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  dayButtonTextSelected: {
    color: "#10b981",
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
  tipoPagoCheckboxSelected: {
    // No additional styles needed, handled by header
  },
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
    color: "#10b981",
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
  createButton: {
    flex: 2,
  },
});