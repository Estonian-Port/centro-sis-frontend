import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { RoleSelectionModal } from '../../components/modals/RoleSelectionModal';
import { DrawerContent } from '../../components/navigation/DrawerContent';
import HomeScreen from './index';
import AdminScreen from './admin';
import PaymentsScreen from './payments';
import ProfileScreen from './profile';
import type { Role } from '../../types';

const Drawer = createDrawerNavigator();

// ------------------- MOCK useAuth -------------------
const useAuth = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const user = {
    firstLogin: false,
    roles: [
      { id: 1, nombre: 'ALUMNO' },
      { id: 2, nombre: 'ADMINISTRADOR' },
    ] as Role[],
    nombre: 'Juan',
    apellido: 'Pérez',
  };

  const hasMultipleRoles = () => user.roles.length > 1;

  return { user, selectedRole, setSelectedRole, hasMultipleRoles };
};

// ------------------- Drawer Navigator -------------------
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: true }}
    >
      <Drawer.Screen name="Dashboard" component={HomeScreen} />
      <Drawer.Screen name="Admin" component={AdminScreen} />
      <Drawer.Screen name="Payments" component={PaymentsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

// ------------------- Tab Layout -------------------
export default function TabLayout() {
  const { user, selectedRole, setSelectedRole, hasMultipleRoles } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (hasMultipleRoles() && !selectedRole) {
      setShowRoleModal(true);
    }
  }, [hasMultipleRoles, selectedRole]);

  const handleRoleSelection = (role: Role) => {
    setSelectedRole(role);
    setShowRoleModal(false);
  };

  if (Platform.OS === 'web') {
    return <DrawerNavigator />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3b82f6',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        {selectedRole?.nombre === 'ADMINISTRADOR' && (
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Admin',
              tabBarIcon: ({ size, color }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        )}
        <Tabs.Screen
          name="payments"
          options={{
            title: 'Pagos',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="card-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <RoleSelectionModal
        visible={showRoleModal}
        roles={user?.roles || []}
        onSelectRole={handleRoleSelection}
      />
    </>
  );
}
