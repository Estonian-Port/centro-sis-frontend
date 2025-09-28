import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

//MOCK
const useAuth = () => {
  return {
    user: { nombre: 'Juan', apellido: 'Pérez' },
    selectedRole: 'ADMINISTRADOR',
    logout: () => alert('Sesión cerrada'),
  };
};

export const DrawerContent = (props: any) => {
  const { user, selectedRole, logout } = useAuth();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'home-outline',
      onPress: () => props.navigation.navigate('Dashboard'),
    },
    {
      label: 'Administración',
      icon: 'settings-outline',
      onPress: () => props.navigation.navigate('Admin'),
      roles: ['ADMINISTRADOR'],
    },
    {
      label: 'Pagos',
      icon: 'card-outline',
      onPress: () => props.navigation.navigate('Payments'),
    },
    {
      label: 'Perfil',
      icon: 'person-outline',
      onPress: () => props.navigation.navigate('Profile'),
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(selectedRole || '')
  );

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={24} color="#ffffff" />
        </View>
        <Text style={styles.userName}>
          {user?.nombre} {user?.apellido}
        </Text>
        <Text style={styles.userRole}>{selectedRole}</Text>
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
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#dbeafe',
  },
  menu: {
    flex: 1,
    paddingTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});
