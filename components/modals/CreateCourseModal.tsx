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
  TextInput,
  ActivityIndicator,
} from "react-native";
import * as yup from "yup";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  nuevoCursoAlquilerAdmin,
  nuevoCursoComision,
  DayOfWeek,
  HorarioDto,
  TipoPago,
  PagoType,
  ProfesorLista,
} from "@/model/model";
import { TimePickerModal } from "../pickers/TimePicker";
import { usuarioService } from "@/services/usuario.service";
import { cursoService } from "@/services/curso.service";
import Toast from "react-native-toast-message";
import { DatePicker } from "../pickers/DatePicker";
import { CuotasCalculadas } from "../pagos/CuotasCalculadas";

interface FormValues {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  profesoresId: number[];
  montoAlquiler?: number;
  horarios?: HorarioDto[];
  tipoPago?: TipoPago[];
  recargo?: number | null;
  comisionProfesor?: number | null;
}

interface CreateCourseModalProps {
  visible: boolean;
  onClose: () => void;
}

type Modalidad = "ALQUILER" | "COMISION";

const calcularCuotas = (fechaInicio: string, fechaFin: string): number => {
  if (!fechaInicio || !fechaFin) return 0;

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  const inicioAnio = inicio.getFullYear();
  const inicioMes = inicio.getMonth();
  const finAnio = fin.getFullYear();
  const finMes = fin.getMonth();

  const meses = (finAnio - inicioAnio) * 12 + (finMes - inicioMes) + 1;

  return Math.max(1, meses);
};

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
        },
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
      // ✅ ELIMINADO: validación de cuotasAlquiler
    });
  } else {
    return yup.object().shape({
      ...baseSchema,
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
          }),
        )
        .min(1, "Debe agregar al menos un horario")
        .test(
          "horarios-validos",
          "La hora de fin debe ser posterior a la hora de inicio",
          (value) => {
            if (!value) return false;
            return validarHorarios(value);
          },
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
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .min(0, "El recargo no puede ser negativo"),
      comisionProfesor: yup
        .number()
        .nullable()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
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
  const [showTimePicker, setShowTimePicker] = useState<{
    horarioIndex: number;
    field: "horaInicio" | "horaFin";
  } | null>(null);

  // Estados para búsqueda de profesores
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProfesorLista[]>([]);
  const [searching, setSearching] = useState(false);
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState<
    ProfesorLista[]
  >([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(getValidationSchema(modalidad)) as any,
    defaultValues: {
      nombre: "",
      fechaInicio: "",
      fechaFin: "",
      profesoresId: [],
      montoAlquiler: undefined,
      horarios: [
        {
          dia: DayOfWeek.MONDAY,
          horaInicio: "",
          horaFin: "",
        },
      ],
      tipoPago: [],
      recargo: null,
      comisionProfesor: null,
    },
  });

  const horarios = watch("horarios") || [];
  const tiposPago = watch("tipoPago") || [];
  const fechaInicio = watch("fechaInicio");
  const fechaFin = watch("fechaFin");

  // ✅ Calcular cuotas automáticamente
  const cuotasCalculadas = useMemo(
    () => calcularCuotas(fechaInicio, fechaFin),
    [fechaInicio, fechaFin],
  );

  // Búsqueda con debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await usuarioService.searchByRol(
          searchQuery,
          "PROFESOR",
        );
        // Filtrar los que ya están seleccionados
        const filtered = results.filter(
          (r) => !profesoresSeleccionados.some((p) => p.id === r.id),
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error("Error buscando profesores:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, profesoresSeleccionados]);

  // Calcular duración mejorada en días, meses y días
  const duracion = useMemo(() => {
    if (!fechaInicio || !fechaFin) return null;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) return null;

    // Calcular diferencia en días
    const diferenciaMs = fin.getTime() - inicio.getTime();
    const totalDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    // Calcular meses y días restantes
    const meses = Math.floor(totalDias / 30);
    const diasRestantes = totalDias % 30;

    return { totalDias, meses, diasRestantes };
  }, [fechaInicio, fechaFin]);

  // ✅ ELIMINADO: useEffect que actualizaba cuotasAlquiler y cuotasMensual
  // Ya no es necesario porque se calcula en tiempo real

  // Verificar si un tipo de pago está seleccionado
  const tieneTipoPago = (tipo: PagoType): boolean => {
    return tiposPago.some((tp) => tp.tipo === tipo);
  };

  // Obtener monto de un tipo de pago
  const getMontoTipoPago = (tipo: PagoType): number => {
    const tipoPago = tiposPago.find((tp) => tp.tipo === tipo);
    return tipoPago?.monto || 0;
  };

  const handleAgregarProfesor = (profesor: ProfesorLista): void => {
    const nuevosProfs = [...profesoresSeleccionados, profesor];
    setProfesoresSeleccionados(nuevosProfs);
    setValue(
      "profesoresId",
      nuevosProfs.map((p) => p.id),
    );
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleEliminarProfesor = (profesorId: number): void => {
    const nuevosProfs = profesoresSeleccionados.filter(
      (p) => p.id !== profesorId,
    );
    setProfesoresSeleccionados(nuevosProfs);
    setValue(
      "profesoresId",
      nuevosProfs.map((p) => p.id),
    );
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
      horarios.filter((_, i) => i !== index),
    );
  };

  const updateHorario = (
    index: number,
    field: keyof HorarioDto,
    value: string | DayOfWeek,
  ): void => {
    const newHorarios = [...horarios];
    (newHorarios[index][field] as any) = value;
    setValue("horarios", newHorarios);
  };

  // ✅ ELIMINADO: updateCuotasTipoPago (ya no es necesario)

  const toggleTipoPago = (tipo: PagoType): void => {
    const tieneActualmente = tieneTipoPago(tipo);

    if (tieneActualmente) {
      setValue(
        "tipoPago",
        tiposPago.filter((tp) => tp.tipo !== tipo),
      );
    } else {
      // ✅ Las cuotas se calculan automáticamente según las fechas
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

  const crearCursoAlquiler = async (nuevoCurso: nuevoCursoAlquilerAdmin) => {
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

  const onSubmit = async (data: FormValues): Promise<void> => {
    try {
      let requestData: nuevoCursoAlquilerAdmin | nuevoCursoComision;

      if (modalidad === "ALQUILER") {
        requestData = {
          id: 0,
          nombre: data.nombre,
          montoAlquiler: data.montoAlquiler || 0,
          cuotasAlquiler: cuotasCalculadas, // ✅ Usar valor calculado
          profesoresId: data.profesoresId,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
        };
        await crearCursoAlquiler(requestData);
      } else {
        // ✅ Actualizar cuotas del tipo pago MENSUAL antes de enviar
        const tiposPagoConCuotas = (data.tipoPago || []).map((tp) => ({
          tipo: tp.tipo,
          monto: tp.monto,
          cuotas: tp.tipo === PagoType.MENSUAL ? cuotasCalculadas : 1,
        }));

        requestData = {
          id: 0,
          nombre: data.nombre,
          horarios: data.horarios || [],
          tipoPago: tiposPagoConCuotas, // ✅ Usar cuotas calculadas
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
    setShowTimePicker(null);
    setSearchQuery("");
    setSearchResults([]);
    setProfesoresSeleccionados([]);
    onClose();
  };

  const handleModalidadChange = (newModalidad: Modalidad): void => {
    setModalidad(newModalidad);
    if (newModalidad === "ALQUILER") {
      setValue("horarios", [
        {
          dia: DayOfWeek.MONDAY,
          horaInicio: "",
          horaFin: "",
        },
      ]);
      setValue("tipoPago", []);
      setValue("recargo", null);
      setValue("comisionProfesor", null);
      setValue("montoAlquiler", undefined);
      // ✅ ELIMINADO: setValue("cuotasAlquiler", ...)
    } else {
      setValue("montoAlquiler", undefined);
      // ✅ ELIMINADO: setValue("cuotasAlquiler", ...)
      setValue("horarios", [
        {
          dia: DayOfWeek.MONDAY,
          horaInicio: "",
          horaFin: "",
        },
      ]);
      setValue("tipoPago", []);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
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

            {/* Fechas */}
            <View style={Platform.OS === "web" ? styles.row : styles.column}>
              <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="fechaInicio"
                render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Fecha de Inicio"
                  value={value}
                  onChange={onChange}
                  error={errors.fechaInicio?.message}
                />
                )}
              />
              </View>

              <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="fechaFin"
                render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Fecha de Fin"
                  value={value}
                  onChange={onChange}
                  error={errors.fechaFin?.message}
                  maximumDate={new Date(2030, 11, 31)}
                />
                )}
              />
              </View>
            </View>

            {/* Mostrar duración del curso */}
            {duracion && (
              <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={styles.infoBannerText}>
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

            {/* Profesores con Búsqueda */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Profesores Asignados *</Text>

              {/* Profesores Seleccionados */}
              {profesoresSeleccionados.length > 0 && (
                <View style={styles.selectedProfesores}>
                  {profesoresSeleccionados.map((profesor) => (
                    <View key={profesor.id} style={styles.profesorChip}>
                      <View style={styles.profesorAvatar}>
                        <Text style={styles.profesorAvatarText}>
                          {profesor.nombre[0]}
                          {profesor.apellido[0]}
                        </Text>
                      </View>
                      <Text style={styles.profesorChipText}>
                        {profesor.nombre} {profesor.apellido}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleEliminarProfesor(profesor.id)}
                        style={styles.removeChip}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Búsqueda */}
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#9ca3af"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar por nombre, apellido, email o dni..."
                  placeholderTextColor="#9ca3af"
                />
                {searching && (
                  <ActivityIndicator size="small" color="#3b82f6" />
                )}
              </View>

              {/* Resultados de Búsqueda */}
              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  {searchResults.map((profesor) => (
                    <TouchableOpacity
                      key={profesor.id}
                      style={styles.searchResultItem}
                      onPress={() => handleAgregarProfesor(profesor)}
                    >
                      <View style={styles.resultAvatar}>
                        <Text style={styles.resultAvatarText}>
                          {profesor.nombre[0]}
                          {profesor.apellido[0]}
                        </Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>
                          {profesor.nombre} {profesor.apellido}
                        </Text>
                        <Text style={styles.resultEmail}>{profesor.email}</Text>
                      </View>
                      <Ionicons name="add-circle" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {searchQuery.trim() &&
                !searching &&
                searchResults.length === 0 && (
                  <View style={styles.noResults}>
                    <Ionicons name="search-outline" size={32} color="#d1d5db" />
                    <Text style={styles.noResultsText}>
                      No se encontraron profesores
                    </Text>
                  </View>
                )}

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

                {/* Banner de advertencia */}
                <View style={styles.warningBanner}>
                  <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                  <Text style={styles.warningBannerText}>
                    Un profesor a cargo debe completar los datos restantes
                    (horarios y modalidades de pago) para activar el curso.
                  </Text>
                </View>

                <Controller
                  control={control}
                  name="montoAlquiler"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Monto Mensual ($) *"
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

                {/* ✅ Componente CuotasCalculadas para Alquiler */}
                <CuotasCalculadas
                  fechaInicio={fechaInicio ? new Date(fechaInicio) : null}
                  fechaFin={fechaFin ? new Date(fechaFin) : null}
                  label="Cuotas de alquiler"
                  helpText="El profesor debe pagar esta cantidad de cuotas al instituto"
                />

                {/* Total de alquiler */}
                {watch("montoAlquiler") && cuotasCalculadas > 0 && (
                  <Text style={styles.totalInfo}>
                    Total de alquiler: $
                    {(
                      (watch("montoAlquiler") || 0) * cuotasCalculadas
                    ).toLocaleString()}
                  </Text>
                )}
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
                  {typeof errors.horarios?.message === "string" && (
                    <Text style={styles.errorText}>
                      {errors.horarios.message}
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
                            tieneTipoPago(PagoType.MENSUAL)
                              ? "#10b981"
                              : "#9ca3af"
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

                        {/* ✅ Componente CuotasCalculadas para Pago Mensual */}
                        <CuotasCalculadas
                          fechaInicio={
                            fechaInicio ? new Date(fechaInicio) : null
                          }
                          fechaFin={fechaFin ? new Date(fechaFin) : null}
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
                            tieneTipoPago(PagoType.TOTAL)
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

                    {tieneTipoPago(PagoType.TOTAL) && (
                      <View style={styles.tipoPagoInput}>
                        <Input
                          label="Monto total ($)"
                          value={
                            getMontoTipoPago(PagoType.TOTAL)?.toString() || ""
                          }
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
                    <Text style={styles.errorText}>
                      {errors.tipoPago.message}
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
                          label="Comisión Profresor (%)"
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

      {/* Modal para Time Picker */}
      <TimePickerModal
        visible={showTimePicker !== null}
        onClose={() => setShowTimePicker(null)}
        onSelect={(time) => {
          if (showTimePicker) {
            updateHorario(
              showTimePicker.horarioIndex,
              showTimePicker.field,
              time,
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
  height: 600,  
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
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
  column: {
    flexDirection: "column",
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
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  warningBannerText: {
    fontSize: 13,
    color: "#92400e",
    flex: 1,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  searchResults: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 12,
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  resultAvatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  resultEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  noResults: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginTop: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  selectedProfesores: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  profesorChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  profesorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  profesorAvatarText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  profesorChipText: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "500",
  },
  removeChip: {
    padding: 2,
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
  createButton: {
    flex: 2,
  },
});
