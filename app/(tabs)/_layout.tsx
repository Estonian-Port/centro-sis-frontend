import { useAuth } from "@/context/authContext";
import { Rol } from "@/model/model";
import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { RoleSelectionModal } from "../../components/modals/RoleSelectionModal";
import { DrawerContent } from "../../components/navigation/DrawerContent";
import AdminScreen from "./admin";
import HomeScreen from "./index";
import IngresosScreen from "./ingresos";
import PagosScreen from "./pagos"; // ← NUEVO
import ProfileScreen from "./profile";

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const { selectedRole } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props: any) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          title: "Dashboard",
        }}
      />

      {selectedRole === "ADMINISTRADOR" && (
        <Drawer.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: "Administración",
          }}
        />
      )}

      {/* ← NUEVO: Ingresos para todos */}
      <Drawer.Screen
        name="Ingresos"
        component={IngresosScreen}
        options={{
          title: "Ingresos",
        }}
      />

      {/* ← NUEVO: Pagos para todos */}
      <Drawer.Screen
        name="Pagos"
        component={PagosScreen}
        options={{
          title: "Pagos",
        }}
      />

      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Perfil",
        }}
      />
    </Drawer.Navigator>
  );
}

export default function TabLayout() {
  const { usuario, selectedRole, setSelectedRole, hasMultipleRoles } =
    useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (hasMultipleRoles() && !selectedRole) {
      setShowRoleModal(true);
    } else {
      if (usuario?.listaRol[0] != null) {
        setSelectedRole(usuario?.listaRol[0]);
      }
    }
  }, [hasMultipleRoles, selectedRole]);

  const handleRoleSelection = (role: Rol) => {
    setSelectedRole(role);
    setShowRoleModal(false);
  };

  // Para web, usa el Drawer
  if (Platform.OS === "web") {
    return (
      <>
        <DrawerNavigator />
        <RoleSelectionModal
          visible={showRoleModal}
          roles={usuario?.listaRol || []}
          onSelectRole={handleRoleSelection}
        />
      </>
    );
  }

  // Para móvil, usa Tabs
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#3b82f6",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        {selectedRole === Rol.ADMINISTRADOR && (
          <Tabs.Screen
            name="admin"
            options={{
              title: "Admin",
              tabBarIcon: ({ size, color }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        )}

        {/* ← NUEVO: Tab Ingresos */}
        <Tabs.Screen
          name="ingresos"
          options={{
            title: "Ingresos",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="log-in-outline" size={size} color={color} />
            ),
          }}
        />

        {/* ← NUEVO: Tab Pagos */}
        <Tabs.Screen
          name="pagos"
          options={{
            title: "Pagos",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="card-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <RoleSelectionModal
        visible={showRoleModal}
        roles={usuario?.listaRol || []}
        onSelectRole={handleRoleSelection}
      />
    </>
  );
}