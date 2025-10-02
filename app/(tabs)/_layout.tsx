import { useAuth } from '@/context/authContext';
import { Role } from '@/model/model';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { RoleSelectionModal } from '../../components/modals/RoleSelectionModal';
import { DrawerContent } from '../../components/navigation/DrawerContent';
import AccessesScreen from './accesses';
import AdminScreen from './admin';
import HomeScreen from './index';
import PaymentsScreen from './payments';
import ProfessorEarningsScreen from './professor-earnings';
import ProfileScreen from './profile';
import StudentPaymentsScreen from './student-payments';

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const { selectedRole } = useAuth();

  return (
    <Drawer.Navigator 
      drawerContent={(props) => <DrawerContent {...props} />}
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
          title: 'Dashboard',
        }}
      />
      
      {selectedRole === 'ADMINISTRADOR' && (
        <>
          <Drawer.Screen name="Admin" component={AdminScreen} />
          <Drawer.Screen name="Payments" component={PaymentsScreen} />
        </>
      )}
      {selectedRole === 'ALUMNO' && (
        <Drawer.Screen 
          name="StudentPayments" 
          component={StudentPaymentsScreen} 
          options={{ title: 'Mis Pagos' }} />
      )}
      {selectedRole === 'PROFESOR' && (
        <Drawer.Screen 
          name="ProfessorEarnings" 
          component={ProfessorEarningsScreen} 
          options={{ title: 'Mis Cobros' }} />
      )}

      <Drawer.Screen 
        name="Accesses" 
        component={AccessesScreen}
        options={{
          title: 'Accesos',
        }}
      />
      
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Drawer.Navigator>
  );
}

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

  // Para web, usa el Drawer
  if (Platform.OS === 'web') {
    return (
      <>
        <DrawerNavigator />
        <RoleSelectionModal
          visible={showRoleModal}
          roles={user?.roles || []}
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
        
        {selectedRole === Role.ADMINISTRADOR && (
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