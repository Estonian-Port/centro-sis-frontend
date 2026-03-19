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
import { getRolLabel } from "@/helper/funciones";

export const DrawerContent = (props: any) => {
  const { usuario, selectedRole, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: "home-outline",
      route: "/(tabs)",
      roles: null,
    },
    {
      label: "Administración",
      icon: "settings-outline",
      route: "/(tabs)/admin",
      roles: [Rol.ADMINISTRADOR, Rol.OFICINA],
    },
    {
      label: "Escanear QR",
      icon: "scan-outline",
      route: "/(tabs)/escanear-qr",
      roles: [Rol.PORTERIA],
    },
    {
      label: "Accesos",
      icon: "log-in-outline",
      route: "/(tabs)/accesos",
      roles: null,
    },
    {
      label: "Pagos",
      icon: "card-outline",
      route: "/(tabs)/pagos",
      roles: [Rol.ADMINISTRADOR, Rol.OFICINA, Rol.ALUMNO, Rol.PROFESOR],
    },
    {
      label: "Finanzas",
      icon: "stats-chart",
      route: "/(tabs)/finanzas",
      roles: [Rol.ADMINISTRADOR],
    },
    {
      label: "Mi QR",
      icon: "qr-code-outline",
      route: "/(tabs)/mi-qr",
      roles: null,
    },
    {
      label: "Perfil",
      icon: "person-outline",
      route: "/(tabs)/profile",
      roles: null,
    },
  ];

  const visibleItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return selectedRole && item.roles.includes(selectedRole);
  });

  const activeRoute = props.state?.routes[props.state?.index]?.name;

  return (
    <>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <Logo size={100} color={COLORES.dorado} />
          <Text 
            style={styles.userName}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {usuario?.nombre} {usuario?.apellido}
          </Text>
          <Text 
            style={styles.userRole}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selectedRole ? getRolLabel(selectedRole) : "Sin rol"}
          </Text>
        </View>

        <View style={styles.menu}>
          {visibleItems.map((item, index) => (
            <DrawerItem
              key={item.route}
              label={item.label}
              icon={({ color, size }) => (
                <Ionicons name={item.icon as any} size={size} color={color} />
              )}
              focused={activeRoute === item.route.split("/").pop()}
              onPress={() => {
                router.push(item.route as any);
                if (props.navigation?.closeDrawer) {
                  props.navigation.closeDrawer();
                }
              }}
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
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  userRole: {
    fontSize: 14,
    color: "#dbeafe",
    textAlign: "center",
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