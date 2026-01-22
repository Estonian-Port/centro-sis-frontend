import { useAuth } from "@/context/authContext";
import { Rol } from "@/model/model";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { RoleSelectionModal } from "../../components/modals/RoleSelectionModal";
import { DrawerContent } from "../../components/navigation/DrawerContent";
import { CustomDrawerHeader } from "../../components/navigation/CustomDrawerHeader";

// ✅ Wrapper que maneja el modal sin interferir con el layout
function DrawerWithModal({ children }: { children: React.ReactNode }) {
  const { usuario, selectedRole, setSelectedRole, hasMultipleRoles } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!usuario || hasInitialized) return;

    if (hasMultipleRoles() && !selectedRole) {
      setShowRoleModal(true);
    } else if (!selectedRole && usuario.listaRol.length > 0) {
      setSelectedRole(usuario.listaRol[0]);
    }

    setHasInitialized(true);
  }, [usuario]);

  const handleRoleSelection = (role: Rol) => {
    setSelectedRole(role);
    setShowRoleModal(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      <RoleSelectionModal
        visible={showRoleModal}
        roles={usuario?.listaRol || []}
        onSelectRole={handleRoleSelection}
      />
    </View>
  );
}

export default function TabLayout() {
  const { selectedRole } = useAuth();
  const isAdminOrOficina = selectedRole === Rol.ADMINISTRADOR || selectedRole === Rol.OFICINA;

  // Para web, usa el Drawer de expo-router
  if (Platform.OS === "web") {
    return (
      <DrawerWithModal>
        <Drawer
          key={selectedRole || 'no-role'}
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              width: 280,
            },
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              headerShown: true,
              header: () => <CustomDrawerHeader title="Dashboard" />,
              drawerLabel: "Dashboard",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />

          {isAdminOrOficina && (
            <Drawer.Screen
              name="admin"
              options={{
                headerShown: true,
                header: () => <CustomDrawerHeader title="Administración" />,
                drawerLabel: "Administración",
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="settings-outline" size={size} color={color} />
                ),
              }}
            />
          )}

          <Drawer.Screen
            name="accesos"
            options={{
              headerShown: false,
              drawerLabel: "Accesos",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="log-in-outline" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="pagos"
            options={{
              headerShown: false,
              drawerLabel: "Pagos",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="card-outline" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="profile"
            options={{
              headerShown: true,
              header: () => <CustomDrawerHeader title="Perfil" />,
              drawerLabel: "Perfil",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Drawer>
      </DrawerWithModal>
    );
  }

  // Para móvil, usa Tabs
  return (
    <DrawerWithModal>
      <Tabs
        key={selectedRole || 'no-role'}
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

        {isAdminOrOficina && (
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
          name="accesos"
          options={{
            title: "Accesos",
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
    </DrawerWithModal>
  );
}