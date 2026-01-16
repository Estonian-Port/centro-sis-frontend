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
import PagosScreen from "./pagos";
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
        name="drawer-dashboard"
        component={HomeScreen}
        options={{
          title: "Dashboard",
        }}
      />

      {selectedRole === "ADMINISTRADOR" && (
        <Drawer.Screen
          name="drawer-admin"
          component={AdminScreen}
          options={{
            title: "Administración",
          }}
        />
      )}

      <Drawer.Screen
        name="drawer-ingresos"
        component={IngresosScreen}
        options={{
          title: "Ingresos",
        }}
      />

      <Drawer.Screen
        name="drawer-pagos"
        component={PagosScreen}
        options={{
          title: "Pagos",
        }}
      />

      <Drawer.Screen
        name="drawer-profile"
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
  const [hasInitialized, setHasInitialized] = useState(false); // ✅ NUEVO

  useEffect(() => {
    // ✅ Solo ejecutar una vez cuando el usuario cambia
    if (!usuario || hasInitialized) return;

    if (hasMultipleRoles() && !selectedRole) {
      // Usuario con múltiples roles y sin rol seleccionado
      setShowRoleModal(true);
    } else if (!selectedRole && usuario.listaRol.length > 0) {
      // Usuario con un solo rol o ningún rol seleccionado
      setSelectedRole(usuario.listaRol[0]);
    }

    setHasInitialized(true); // ✅ Marcar como inicializado
  }, [usuario]); // ✅ Solo depende de usuario

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

        <Tabs.Screen
          name="ingresos"
          options={{
            title: "Ingresos",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="log-in-outline" size={size} color={color} />
            ),
          }}
        />

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
