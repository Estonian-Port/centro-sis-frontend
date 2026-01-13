import { ModalLogout } from "@/components/modals/ModalLogout";
import { useAuth } from "@/context/authContext";
import { Rol, UpdatePerfilUsuario, UsuarioUpdatePassword } from "@/model/model";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Tag } from "../../components/ui/Tag";
import { SafeAreaView } from "react-native-safe-area-context";
import { usuarioService } from "@/services/usuario.service";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { EditProfileModal } from "@/components/modals/EditProfileModal";
import { COLORES } from "@/util/colores";
import Toast from "react-native-toast-message";

// Configuración de roles
const ROLE_CONFIG = {
  [Rol.ALUMNO]: {
    variant: "rolAlumno" as const,
    label: "ALUMNO",
  },
  [Rol.PROFESOR]: {
    variant: "rolProfesor" as const,
    label: "PROFESOR",
  },
  [Rol.ADMINISTRADOR]: {
    variant: "rolAdmin" as const,
    label: "ADMINISTRADOR",
  },
  [Rol.OFICINA]: {
    variant: "rolOficina" as const,
    label: "OFICINA",
  },
} as const;

// Helper para obtener configuración del rol
const getRoleConfig = (roleName: Rol) => {
  return ROLE_CONFIG[roleName] || { variant: "info" as const, label: roleName };
};

export default function ProfileScreen() {
  const { usuario, logout, setUsuario } = useAuth();
  const { width } = useWindowDimensions();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Verificar si el usuario tiene múltiples roles
  const hasMultipleRoles = (usuario?.listaRol.length || 0) > 1;

  // Determinar si usar layout de 2 columnas
  const isWideScreen = width >= 768;

  // Datos iniciales para el modal de editar
  const editProfileData: UpdatePerfilUsuario = {
    nombre: usuario?.nombre || "",
    apellido: usuario?.apellido || "",
    email: usuario?.email || "",
    dni: usuario?.dni || "",
    celular: usuario?.celular || "",
  };

  // Handler para editar perfil
  const handleEditProfile = async (userUpdate: UpdatePerfilUsuario) => {
    try {
      const response = await usuarioService.updateProfile(
        usuario!.id,
        userUpdate
      );
      setUsuario(response);
      Toast.show({
        type: "success",
        text1: "Perfil actualizado",
        position: "bottom",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error al actualizar el perfil",
        position: "bottom",
      });
    }
  };

  // Handler para cambiar contraseña
  const handleChangePassword = async (userUpdate: UsuarioUpdatePassword) => {
    try {
      await usuarioService.changePassword(userUpdate, usuario!.id);
      Toast.show({
        type: "success",
        text1: "Contraseña actualizada",
        position: "bottom",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error al actualizar la contraseña",
        position: "bottom",
      });
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "Hubo un problema al cerrar sesión");
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const actionItems = [
    {
      icon: "person-outline",
      title: "Editar Perfil",
      subtitle: "Actualizar información personal",
      onPress: () => setShowEditModal(true),
      disabled: false,
    },
    {
      icon: "key-outline",
      title: "Cambiar Contraseña",
      subtitle: "Actualizar credenciales de acceso",
      onPress: () => setShowChangePasswordModal(true),
      disabled: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con info del usuario */}
      <View style={styles.header}>
        <Text style={styles.userName}>
          {usuario?.nombre} {usuario?.apellido}
        </Text>
        <Text style={styles.userEmail}>{usuario?.email}</Text>

        {/* Tags de roles en el header */}
        <View style={styles.headerRoles}>
          {usuario?.listaRol.map((role) => {
            const config = getRoleConfig(role);
            return (
              <Tag
                key={role}
                label={config.label}
                variant={config.variant}
                style={styles.headerRoleTag}
              />
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isWideScreen && styles.contentContainerWide,
        ]}
      >
        {/* Layout de 2 columnas en web */}
        <View
          style={[styles.gridContainer, isWideScreen && styles.gridTwoColumns]}
        >
          {/* Columna Izquierda: Información Personal */}
          <View
            style={[
              styles.card,
              styles.section,
              isWideScreen && styles.sectionWide,
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color="#3b82f6"
              />
              <Text style={styles.sectionTitle}>Información Personal</Text>
            </View>

            <View style={styles.infoGrid}>
              <InfoItem
                label="Nombre completo"
                value={`${usuario?.nombre} ${usuario?.apellido}`}
              />
              <InfoItem label="Email" value={usuario?.email} />
              <InfoItem label="DNI" value={usuario?.dni} />
              <InfoItem label="Celular" value={usuario?.celular} />
              <InfoItem
                label="Fecha de Nacimiento"
                value={usuario?.fechaNacimiento}
              />
              <InfoItem label="Último ingreso" value={usuario?.ultimoIngreso} />
            </View>
          </View>

          {/* Columna Derecha: Acciones */}
          <View
            style={[
              styles.card,
              styles.section,
              isWideScreen && styles.sectionWide,
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={24} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>Acciones</Text>
            </View>

            {actionItems.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionItem,
                  action.disabled && styles.actionItemDisabled,
                ]}
                onPress={action.onPress}
                disabled={action.disabled}
                activeOpacity={action.disabled ? 1 : 0.7}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    action.disabled && styles.actionIconContainerDisabled,
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={22}
                    color={action.disabled ? "#9ca3af" : "#3b82f6"}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[
                      styles.actionTitle,
                      action.disabled && styles.actionTitleDisabled,
                    ]}
                  >
                    {action.title}
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtitle,
                      action.disabled && styles.actionSubtitleDisabled,
                    ]}
                  >
                    {action.subtitle}
                  </Text>
                </View>
                {!action.disabled && (
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            ))}

            {/* Separador */}
            <View style={styles.divider} />

            {/* Botón de Cerrar Sesión */}
            <TouchableOpacity
              style={styles.logoutAction}
              onPress={handleLogout}
            >
              <View
                style={[styles.actionIconContainer, styles.logoutIconContainer]}
              >
                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.logoutText]}>
                  Cerrar Sesión
                </Text>
                <Text style={styles.actionSubtitle}>Salir de tu cuenta</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Editar Perfil */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditProfile}
        initialData={editProfileData}
      />

      {/* Modal de Cambiar Contraseña */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={handleChangePassword}
      />

      {/* Modal de Logout */}
      <ModalLogout
        visible={showLogoutModal}
        message="¿Estás seguro de que quieres cerrar sesión?"
        onClose={cancelLogout}
        onCerrarSesion={confirmLogout}
      />
    </SafeAreaView>
  );
}

// Componente helper para items de info
const InfoItem = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "No disponible"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  header: {
    backgroundColor: COLORES.violeta,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#dbeafe",
    marginBottom: 12,
  },
  headerRoles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    justifyContent: "center",
  },
  headerRoleTag: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  contentContainerWide: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  gridContainer: {
    gap: 16,
  },
  gridTwoColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  section: {
    marginBottom: 16,
  },
  sectionWide: {
    flex: 1,
    minWidth: 300,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "right",
    flex: 1,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  actionItemDisabled: {
    opacity: 0.5,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionIconContainerDisabled: {
    backgroundColor: "#f3f4f6",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 2,
  },
  actionTitleDisabled: {
    color: "#9ca3af",
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  actionSubtitleDisabled: {
    color: "#d1d5db",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  logoutAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  logoutIconContainer: {
    backgroundColor: "#fee2e2",
  },
  logoutText: {
    color: "#ef4444",
  },
});
