import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/authContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as yup from "yup";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { DatePicker } from "@/components/pickers/DatePicker";
import { COLORES } from "@/util/colores";
import { LinearGradient } from "expo-linear-gradient";
import TerminosCondicionesModal from "@/components/modals/TerminosCondiciones";
import { usuarioService } from "@/services/usuario.service";
import { CompleteProfileData } from "@/model/model";

// ✅ HELPER PARA EXTRAER MENSAJE DE ERROR
const getErrorMessage = (error: any): string | undefined => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string') return error.message;
  return undefined;
};

// Esquema de validación
const getValidationSchema = (esMenorDeEdad: boolean, terminosLeidos: boolean) => {
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
      .required("La nueva contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Debe contener mayúscula, minúscula y número",
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
      .required("Confirma la nueva contraseña"),
    aceptaTerminos: yup
      .boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required("Debes aceptar los términos y condiciones")
      .test(
        "terminos-leidos",
        "Debes leer los términos y condiciones antes de aceptarlos",
        () => terminosLeidos
      ),
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

// Helper para detectar datos temporales
const isDatoTemporal = (valor: string | number): boolean => {
  if (typeof valor === "string") {
    return (
      valor === "PENDIENTE" ||
      valor === "TEMPORAL" ||
      valor.startsWith("0000000") ||
      valor === ""
    );
  }
  if (typeof valor === "number") {
    return valor === 0 || valor === 1100000000;
  }
  return false;
};

export default function CompleteProfileScreen() {
  const { usuario, setUsuario } = useAuth();

  const [showTerminosModal, setShowTerminosModal] = useState(false);
  const [terminosLeidos, setTerminosLeidos] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm<any>({
    resolver: yupResolver(getValidationSchema(false, terminosLeidos)) as any,
    defaultValues: {
      nombre: isDatoTemporal(usuario?.nombre || "") ? "" : usuario?.nombre || "",
      apellido: isDatoTemporal(usuario?.apellido || "") ? "" : usuario?.apellido || "",
      dni: isDatoTemporal(usuario?.dni || "") ? "" : usuario?.dni || "",
      celular: isDatoTemporal(usuario?.celular || 0) ? "" : String(usuario?.celular || ""),
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
  const password = watch("password");

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

  // Fuerza de contraseña
  const getPasswordStrength = () => {
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;

    if (strength <= 2) return { label: "Débil", color: "#ef4444" };
    if (strength <= 3) return { label: "Media", color: "#f59e0b" };
    return { label: "Fuerte", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength();

  const handleCloseTerminos = () => {
    setShowTerminosModal(false);
    setTerminosLeidos(true);
    setTimeout(() => {
      trigger("aceptaTerminos");
    }, 100);
  };

  const onSubmit = async (data: any) => {
    try {
      if (!terminosLeidos) {
        Toast.show({
          type: "error",
          text1: "Términos no leídos",
          text2: "Debes abrir y leer los términos antes de aceptarlos",
          position: "bottom",
        });
        return;
      }

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

      const profileData: CompleteProfileData = {
        id: usuario!.id,
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        celular: parseInt(data.celular, 10),
        fechaNacimiento: data.fechaNacimiento,
        password: data.password,
        aceptaTerminos: data.aceptaTerminos,
      };

      if (esMenorDeEdad) {
        profileData.adultoResponsable = {
          nombre: data.responsableNombre!,
          apellido: data.responsableApellido!,
          dni: data.responsableDni!,
          celular: parseInt(data.responsableCelular || "0", 10),
          relacion: data.responsableRelacion!,
        };
      }

      const usuarioActualizado = await usuarioService.completarPerfil(profileData);
      Toast.show({
        type: "success",
        text1: "Perfil Completado",
        text2: "Tu perfil ha sido actualizado correctamente.",
        position: "bottom",
      });

      setUsuario(usuarioActualizado);

      setTimeout(() => {
        router.replace("/(tabs)/" as any);
      }, 1000);
    } catch (error: any) {
      console.error("Error completando perfil:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message || "Hubo un error al actualizar tu perfil.",
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
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

                {/* Datos Personales */}
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
                        error={getErrorMessage(errors.nombre)}
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
                        error={getErrorMessage(errors.apellido)}
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
                        error={getErrorMessage(errors.dni)}
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
                        error={getErrorMessage(errors.celular)}
                        placeholder="1123456789"
                        maxLength={10}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="fechaNacimiento"
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        label="Fecha de Nacimiento *"
                        value={value}
                        onChange={onChange}
                        error={getErrorMessage(errors.fechaNacimiento)}
                        maximumDate={new Date()}
                      />
                    )}
                  />

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

                {/* Adulto Responsable */}
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
                          error={getErrorMessage(errors.responsableNombre)}
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
                          error={getErrorMessage(errors.responsableApellido)}
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
                          error={getErrorMessage(errors.responsableDni)}
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
                          error={getErrorMessage(errors.responsableCelular)}
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
                          error={getErrorMessage(errors.responsableRelacion)}
                          placeholder="Madre / Padre / Tutor"
                        />
                      )}
                    />
                  </View>
                )}

                {/* Seguridad */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Seguridad</Text>

                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Input
                          label="Nueva Contraseña *"
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showPassword}
                          error={getErrorMessage(errors.password)}
                          placeholder="Mínimo 8 caracteres"
                          leftIcon="lock-closed-outline"
                          rightIcon={
                            showPassword ? "eye-off-outline" : "eye-outline"
                          }
                          onRightIconPress={() =>
                            setShowPassword(!showPassword)
                          }
                        />

                        {passwordStrength && (
                          <View style={styles.strengthContainer}>
                            <View style={styles.strengthBar}>
                              <View
                                style={[
                                  styles.strengthFill,
                                  {
                                    width:
                                      passwordStrength.label === "Débil"
                                        ? "33%"
                                        : passwordStrength.label === "Media"
                                          ? "66%"
                                          : "100%",
                                    backgroundColor: passwordStrength.color,
                                  },
                                ]}
                              />
                            </View>
                            <Text
                              style={[
                                styles.strengthText,
                                { color: passwordStrength.color },
                              ]}
                            >
                              {passwordStrength.label}
                            </Text>
                          </View>
                        )}

                        <View style={styles.requirementsContainer}>
                          <Text style={styles.requirementsTitle}>
                            La contraseña debe contener:
                          </Text>
                          <View style={styles.requirement}>
                            <Ionicons
                              name={
                                password.length >= 8
                                  ? "checkmark-circle"
                                  : "ellipse-outline"
                              }
                              size={16}
                              color={
                                password.length >= 8 ? "#10b981" : "#9ca3af"
                              }
                            />
                            <Text style={styles.requirementText}>
                              Al menos 8 caracteres
                            </Text>
                          </View>
                          <View style={styles.requirement}>
                            <Ionicons
                              name={
                                /[A-Z]/.test(password)
                                  ? "checkmark-circle"
                                  : "ellipse-outline"
                              }
                              size={16}
                              color={
                                /[A-Z]/.test(password) ? "#10b981" : "#9ca3af"
                              }
                            />
                            <Text style={styles.requirementText}>
                              Una mayúscula
                            </Text>
                          </View>
                          <View style={styles.requirement}>
                            <Ionicons
                              name={
                                /[a-z]/.test(password)
                                  ? "checkmark-circle"
                                  : "ellipse-outline"
                              }
                              size={16}
                              color={
                                /[a-z]/.test(password) ? "#10b981" : "#9ca3af"
                              }
                            />
                            <Text style={styles.requirementText}>
                              Una minúscula
                            </Text>
                          </View>
                          <View style={styles.requirement}>
                            <Ionicons
                              name={
                                /\d/.test(password)
                                  ? "checkmark-circle"
                                  : "ellipse-outline"
                              }
                              size={16}
                              color={
                                /\d/.test(password) ? "#10b981" : "#9ca3af"
                              }
                            />
                            <Text style={styles.requirementText}>
                              Un número
                            </Text>
                          </View>
                        </View>
                      </>
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
                        secureTextEntry={!showConfirmPassword}
                        error={getErrorMessage(errors.confirmPassword)}
                        placeholder="Repetir contraseña"
                        leftIcon="lock-closed-outline"
                        rightIcon={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        onRightIconPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                            errors.aceptaTerminos &&
                              styles.terminosCheckboxError,
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
                                  setShowTerminosModal(true);
                                }}
                              >
                                términos y condiciones
                              </Text>
                              {terminosLeidos && (
                                <Text style={styles.terminosLeidos}>
                                  {" "}✓ Leídos
                                </Text>
                              )}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        {errors.aceptaTerminos && (
                          <Text style={styles.errorText}>
                            {getErrorMessage(errors.aceptaTerminos)}
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
        </KeyboardAvoidingView>
        
        <TerminosCondicionesModal
          visible={showTerminosModal}
          onClose={handleCloseTerminos}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ... (todos los estilos igual que antes)
const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
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
  header: { alignItems: "center", marginBottom: 24 },
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
  form: { width: "100%" },
  inputGroup: { marginBottom: 16 },
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
  strengthContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requirementsContainer: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 13,
    color: "#6b7280",
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
  terminosLeidos: {
    color: "#10b981",
    fontWeight: "600",
    fontSize: 12,
  },
  submitButton: {
    marginTop: 8,
  },
});