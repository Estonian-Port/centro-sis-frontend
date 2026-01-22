// app/(auth)/complete-profile.tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/authContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import * as yup from "yup";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { DatePicker } from "@/components/pickers/DatePicker";
import { COLORES } from "@/util/colores";
import { LinearGradient } from "expo-linear-gradient";

// Esquema de validación dinámico
const getValidationSchema = (esMenorDeEdad: boolean) => {
  const baseSchema = {
    nombre: yup.string().required("El nombre es requerido"),
    apellido: yup.string().required("El apellido es requerido"),
    dni: yup
      .string()
      .matches(/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos")
      .required("El DNI es requerido"),
    celular: yup
      .string()
      .matches(/^\d{10}$/, "El celular debe tener 10 dígitos")
      .required("El celular es requerido"),
    fechaNacimiento: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (YYYY-MM-DD)")
      .required("La fecha de nacimiento es requerida"),
    password: yup
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .required("La nueva contraseña es requerida"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
      .required("Confirma la nueva contraseña"),
    aceptaTerminos: yup
      .boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required("Debes aceptar los términos y condiciones"),
  };

  if (esMenorDeEdad) {
    return yup.object().shape({
      ...baseSchema,
      responsableNombre: yup
        .string()
        .required("El nombre del responsable es requerido"),
      responsableApellido: yup
        .string()
        .required("El apellido del responsable es requerido"),
      responsableDni: yup
        .string()
        .matches(/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos")
        .required("El DNI del responsable es requerido"),
      responsableCelular: yup
        .string()
        .matches(/^\d{10}$/, "El celular debe tener 10 dígitos")
        .required("El celular del responsable es requerido"),
      responsableRelacion: yup
        .string()
        .required("La relación con el responsable es requerida"),
    });
  }

  return yup.object().shape(baseSchema);
};

interface CompleteProfileData {
  nombre: string;
  apellido: string;
  dni: string;
  celular: string;
  fechaNacimiento: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
  // Responsable (solo si es menor)
  responsableNombre?: string;
  responsableApellido?: string;
  responsableDni?: string;
  responsableCelular?: string;
  responsableRelacion?: string;
}

export default function CompleteProfileScreen() {
  const { usuario, setUsuario, hasMultipleRoles } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CompleteProfileData>({
    resolver: yupResolver(getValidationSchema(false)) as any, // Se actualiza dinámicamente
    defaultValues: {
      nombre: usuario?.nombre || "",
      apellido: usuario?.apellido || "",
      dni: usuario?.dni || "",
      celular: usuario?.celular || "",
      fechaNacimiento: "",
      password: "",
      confirmPassword: "",
      aceptaTerminos: false,
      responsableNombre: "",
      responsableApellido: "",
      responsableDni: "",
      responsableCelular: "",
      responsableRelacion: "",
    },
  });

  const fechaNacimiento = watch("fechaNacimiento");
  const aceptaTerminos = watch("aceptaTerminos");

  // Calcular edad
  const edad = useMemo(() => {
    if (!fechaNacimiento) return null;

    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }, [fechaNacimiento]);

  const esMenorDeEdad = edad !== null && edad < 18;

  const handleOpenTerminos = async () => {
    // URL de la página de términos - CAMBIAR por tu URL real
    const url = "https://www.instagram.com/centro_cultural_tenri/?hl=es";

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Toast.show({
          type: "info",
          text1: "No se pudo abrir el enlace",
          text2: "Por favor, visita la página de términos en tu navegador",
          position: "bottom",
        });
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo abrir la página de términos",
        position: "bottom",
      });
    }
  };

  const onSubmit = async (data: CompleteProfileData) => {
    try {
      // VALIDACIÓN MANUAL: Si es menor de edad, validar campos del responsable
      if (esMenorDeEdad) {
        const errores: string[] = [];

        if (!data.responsableNombre?.trim()) {
          errores.push("El nombre del responsable es requerido");
        }
        if (!data.responsableApellido?.trim()) {
          errores.push("El apellido del responsable es requerido");
        }
        if (!data.responsableDni?.trim()) {
          errores.push("El DNI del responsable es requerido");
        } else if (!/^\d{7,8}$/.test(data.responsableDni)) {
          errores.push("El DNI del responsable debe tener 7 u 8 dígitos");
        }
        if (!data.responsableCelular?.trim()) {
          errores.push("El celular del responsable es requerido");
        } else if (!/^\d{10}$/.test(data.responsableCelular)) {
          errores.push("El celular del responsable debe tener 10 dígitos");
        }
        if (!data.responsableRelacion?.trim()) {
          errores.push("La relación con el responsable es requerida");
        }

        if (errores.length > 0) {
          Toast.show({
            type: "error",
            text1: "Datos del responsable incompletos",
            text2: errores[0],
            position: "bottom",
          });
          return;
        }
      }

      console.log("Updating profile:", data);

      // Preparar datos para enviar al backend
      const profileData: any = {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        celular: data.celular,
        fechaNacimiento: data.fechaNacimiento,
        password: data.password,
      };

      // Agregar adulto responsable si es menor
      if (esMenorDeEdad) {
        profileData.adultoResponsable = {
          nombre: data.responsableNombre,
          apellido: data.responsableApellido,
          dni: data.responsableDni,
          celular: parseInt(data.responsableCelular || "0", 10),
          relacion: data.responsableRelacion,
        };
      }

      // TODO: Llamar al endpoint del backend
      // await usuarioService.completarPerfil(usuario.id, profileData);

      // Simula API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar el usuario en el contexto
      if (usuario) {
        const updatedUser = {
          ...usuario,
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          celular: data.celular,
          firstLogin: false,
        };
        setUsuario(updatedUser);
      }

      Toast.show({
        type: "success",
        text1: "Perfil Completado",
        text2: "Tu perfil ha sido actualizado correctamente.",
        position: "bottom",
      });

      // Navegar según roles
      setTimeout(() => {
        if (hasMultipleRoles()) {
          router.replace("/(tabs)/" as any);
        } else {
          router.replace("/(tabs)/" as any);
        }
      }, 1000);
    } catch (error) {
      console.error("Error completando perfil:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Hubo un error al actualizar tu perfil.",
        position: "bottom",
      });
    }
  };

  return (
    <LinearGradient
      colors={[COLORES.violeta, COLORES.cobre]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Card style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-add" size={32} color="#3b82f6" />
              </View>
              <Text style={styles.title}>Completar Perfil</Text>
              <Text style={styles.subtitle}>
                Para continuar, necesitamos que completes tu información
                personal y cambies tu contraseña temporal.
              </Text>
            </View>

            <View style={styles.form}>
              {/* Email (solo lectura) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.emailDisplay}>
                  <Ionicons name="mail" size={20} color="#6b7280" />
                  <Text style={styles.emailText}>{usuario?.email}</Text>
                </View>
              </View>

              {/* Sección: Datos Personales */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos Personales</Text>

                <Controller
                  control={control}
                  name="nombre"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Nombre *"
                      value={value}
                      onChangeText={onChange}
                      error={errors.nombre?.message}
                      placeholder="Juan"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="apellido"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Apellido *"
                      value={value}
                      onChangeText={onChange}
                      error={errors.apellido?.message}
                      placeholder="Pérez"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="dni"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="DNI *"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      error={errors.dni?.message}
                      placeholder="12345678"
                      maxLength={8}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="celular"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Celular *"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                      error={errors.celular?.message}
                      placeholder="1123456789"
                      maxLength={10}
                    />
                  )}
                />

                {/* Fecha de Nacimiento */}
                <Controller
                  control={control}
                  name="fechaNacimiento"
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      label="Fecha de Nacimiento"
                      value={value}
                      onChange={onChange}
                      error={errors.fechaNacimiento?.message}
                      maximumDate={new Date()}
                    />
                  )}
                />

                {/* Mostrar edad */}
                {edad !== null && (
                  <View
                    style={[
                      styles.edadBanner,
                      esMenorDeEdad
                        ? styles.edadBannerWarning
                        : styles.edadBannerInfo,
                    ]}
                  >
                    <Ionicons
                      name={
                        esMenorDeEdad ? "alert-circle" : "information-circle"
                      }
                      size={20}
                      color={esMenorDeEdad ? "#f59e0b" : "#3b82f6"}
                    />
                    <Text
                      style={[
                        styles.edadBannerText,
                        esMenorDeEdad
                          ? styles.edadBannerTextWarning
                          : styles.edadBannerTextInfo,
                      ]}
                    >
                      {edad} años
                      {esMenorDeEdad &&
                        " - Se requieren datos del adulto responsable"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Sección: Adulto Responsable (solo si es menor) */}
              {esMenorDeEdad && (
                <View style={[styles.section, styles.responsableSection]}>
                  <View style={styles.responsableHeader}>
                    <Ionicons name="people" size={24} color="#f59e0b" />
                    <Text style={styles.sectionTitle}>
                      Datos del Adulto Responsable
                    </Text>
                  </View>

                  <Controller
                    control={control}
                    name="responsableNombre"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Nombre *"
                        value={value}
                        onChangeText={onChange}
                        error={errors.responsableNombre?.message}
                        placeholder="María"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="responsableApellido"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Apellido *"
                        value={value}
                        onChangeText={onChange}
                        error={errors.responsableApellido?.message}
                        placeholder="Pérez"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="responsableDni"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="DNI *"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                        error={errors.responsableDni?.message}
                        placeholder="87654321"
                        maxLength={8}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="responsableCelular"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Celular *"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="phone-pad"
                        error={errors.responsableCelular?.message}
                        placeholder="1123456789"
                        maxLength={10}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="responsableRelacion"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Relación *"
                        value={value}
                        onChangeText={onChange}
                        error={errors.responsableRelacion?.message}
                        placeholder="Madre / Padre / Tutor"
                      />
                    )}
                  />
                </View>
              )}

              {/* Sección: Seguridad */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seguridad</Text>

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Nueva Contraseña *"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                      error={errors.password?.message}
                      placeholder="Mínimo 6 caracteres"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Confirmar Contraseña *"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                      error={errors.confirmPassword?.message}
                      placeholder="Repetir contraseña"
                    />
                  )}
                />
              </View>

              {/* Términos y Condiciones */}
              <View style={styles.terminosSection}>
                <Controller
                  control={control}
                  name="aceptaTerminos"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.terminosCheckbox,
                          errors.aceptaTerminos && styles.terminosCheckboxError,
                        ]}
                        onPress={() => onChange(!value)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            value && styles.checkboxChecked,
                          ]}
                        >
                          {value && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#ffffff"
                            />
                          )}
                        </View>
                        <View style={styles.terminosTextContainer}>
                          <Text style={styles.terminosText}>
                            Acepto los{" "}
                            <Text
                              style={styles.terminosLink}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleOpenTerminos();
                              }}
                            >
                              términos y condiciones
                            </Text>
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {errors.aceptaTerminos && (
                        <Text style={styles.errorText}>
                          {errors.aceptaTerminos.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <Button
                title="Completar Perfil"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                style={styles.submitButton}
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emailDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emailText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 4,
  },
  edadBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  edadBannerInfo: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  edadBannerWarning: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  edadBannerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  edadBannerTextInfo: {
    color: "#1e40af",
  },
  edadBannerTextWarning: {
    color: "#92400e",
  },
  responsableSection: {
    backgroundColor: "#fffbeb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  responsableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  terminosSection: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  terminosCheckbox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  terminosCheckboxError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  terminosTextContainer: {
    flex: 1,
  },
  terminosText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  terminosLink: {
    color: "#3b82f6",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  submitButton: {
    marginTop: 8,
  },
});
