import { ModalLogout } from "@/components/modals/ModalLogout";
import { useAuth } from "@/context/authContext";
import { Rol } from "@/model/model";
import { COLORES } from "@/util/colores";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Logo } from "../ui/Logo";

// Configuración de labels de roles
const ROLE_LABELS = {
  [Rol.ALUMNO]: "Alumno",
  [Rol.PROFESOR]: "Profesor",
  [Rol.ADMINISTRADOR]: "Administrador",
  [Rol.OFICINA]: "Oficina",
} as const;

export const DrawerContent = (props: any) => {
  const { usuario, selectedRole, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      icon: "home-outline",
      onPress: () => props.navigation.navigate("Dashboard"),
    },
    {
      label: "Administración",
      icon: "settings-outline",
      onPress: () => props.navigation.navigate("Admin"),
      roles: [Rol.ADMINISTRADOR],
    },
    {
      label: "Pagos",
      icon: "card-outline",
      onPress: () => props.navigation.navigate("Payments"),
      roles: [Rol.ADMINISTRADOR],
    },
    {
      label: "Mis Pagos",
      icon: "card-outline",
      onPress: () => props.navigation.navigate("StudentPayments"),
      roles: [Rol.ALUMNO],
    },
    {
      label: "Mis Cobros",
      icon: "wallet-outline",
      onPress: () => props.navigation.navigate("ProfessorEarnings"),
      roles: [Rol.PROFESOR],
    },
    {
      label: "Accesos",
      icon: "time-outline",
      onPress: () => props.navigation.navigate("Accesses"),
    },
    {
      label: "Perfil",
      icon: "person-outline",
      onPress: () => props.navigation.navigate("Profile"),
    },
  ];

  const filteredItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return selectedRole && item.roles.includes(selectedRole);
  });

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      // Redirigir a login después de logout
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <Logo size={100} color={COLORES.dorado} />
          <Text style={styles.userName}>
            {usuario?.nombre} {usuario?.apellido}
          </Text>
          <Text style={styles.userRole}>
            {selectedRole ? ROLE_LABELS[selectedRole] : "Sin rol"}
          </Text>
        </View>
        <View style={styles.menu}>
          {filteredItems.map((item, index) => (
            <DrawerItem
              key={index}
              label={item.label}
              icon={({ color, size }) => (
                <Ionicons name={item.icon as any} color={color} size={size} />
              )}
              onPress={item.onPress}
            />
          ))}
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
      <ModalLogout
        visible={showLogoutModal}
        message="¿Estás seguro de que quieres cerrar sesión?"
        onClose={cancelLogout}
        onCerrarSesion={confirmLogout}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: COLORES.violeta,
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    margin: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#dbeafe",
  },
  menu: {
    flex: 1,
    paddingTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "500",
  },
});
