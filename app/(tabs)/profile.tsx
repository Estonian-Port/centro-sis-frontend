import { ModalLogout } from '@/components/modals/ModalLogout';
import { useAuth } from '@/context/authContext';
import { EstadoUsuario, Rol } from '@/model/model';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';

// Configuración de roles
const ROLE_CONFIG = {
  [Rol.ALUMNO]: {
    variant: 'info' as const,
    label: 'Alumno',
  },
  [Rol.PROFESOR]: {
    variant: 'success' as const,
    label: 'Profesor',
  },
  [Rol.ADMINISTRADOR]: {
    variant: 'warning' as const,
    label: 'Administrador',
  },
} as const;

// Helper para obtener configuración del rol
const getRoleConfig = (roleName: Rol) => {
  return ROLE_CONFIG[roleName] || { variant: 'info' as const, label: roleName };
};

export default function ProfileScreen() {
  const { usuario, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  type ProfileSectionItem = {
    label: string;
    value?: string;
    isTag?: boolean;
    multiple?: boolean;
  };

  type ProfileSection = {
    title: string;
    items: ProfileSectionItem[];
  };

  const profileSections: ProfileSection[] = [
    {
      title: 'Información Personal',
      items: [
        {
          label: 'Nombre completo',
          value: `${usuario?.nombre} ${usuario?.apellido}`,
        },
        { label: 'Email', value: usuario?.email },
        { label: 'DNI', value: usuario?.dni },
        { label: 'Teléfono', value: usuario?.telefono },
      ],
    },
    {
      title: 'Información de Cuenta',
      items: [
        { label: 'Estado', value: usuario?.estado, isTag: true },
        {
          label: 'Roles',
          value: undefined,
          isTag: true,
          multiple: true,
        },
      ],
    },
  ];

  const actionItems = [
    {
      icon: 'person-outline',
      title: 'Editar Perfil',
      subtitle: 'Actualizar información personal',
      onPress: () => {
        Alert.alert('Editar Perfil', 'Funcionalidad en desarrollo');
      },
    },
    {
      icon: 'key-outline',
      title: 'Cambiar Contraseña',
      subtitle: 'Actualizar credenciales de acceso',
      onPress: () => {
        Alert.alert('Cambiar Contraseña', 'Funcionalidad en desarrollo');
      },
    },
    {
      icon: 'time-outline',
      title: 'Historial de Accesos',
      subtitle: 'Ver últimos inicios de sesión',
      onPress: () => {
        Alert.alert('Historial de Accesos', 'Funcionalidad en desarrollo');
      },
    },
    {
      icon: 'download-outline',
      title: 'Descargar Información',
      subtitle: 'Exportar datos personales',
      onPress: () => {
        const userData = {
          nombre: usuario?.nombre,
          apellido: usuario?.apellido,
          dni: usuario?.dni,
          email: usuario?.email,
          roles: usuario?.listaRol.map(r => r),
        };

        Alert.alert(
          'Descarga de Información',
          `Datos exportados:\n${JSON.stringify(userData, null, 2)}`,
          [{ text: 'OK' }]
        );
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={32} color="#ffffff" />
        </View>
        <Text style={styles.userName}>
          {usuario?.nombre} {usuario?.apellido}
        </Text>
        <Text style={styles.userEmail}>{usuario?.email}</Text>

        {usuario?.beneficios && usuario.beneficios.length > 0 && (
          <View style={styles.beneficiosContainer}>
            {usuario.beneficios.map((beneficio, index) => (
              <Tag key={index} label={beneficio} variant="info" />
            ))}
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {profileSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}:</Text>
                
                {item.isTag ? (
                  item.multiple ? (
                    // Múltiples roles
                    <View style={styles.tagsContainer}>
                      {usuario?.listaRol.map((role) => {
                        const config = getRoleConfig(role);
                        return (
                          <Tag
                            key={role}
                            label={config.label}
                            variant={config.variant}
                            style={styles.roleTag}
                          />
                        );
                      })}
                    </View>
                  ) : (
                    // Tag único (Estado)
                    <Tag
                      label={item.value || ''}
                      variant={item.value === EstadoUsuario.ALTA ? 'success' : 'error'}
                    />
                  )
                ) : (
                  // Texto normal
                  <Text style={styles.infoValue}>
                    {item.value || 'No disponible'}
                  </Text>
                )}
              </View>
            ))}
          </Card>
        ))}

        <Card style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones</Text>

          {actionItems.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionItem}
              onPress={action.onPress}
            >
              <Ionicons
                name={action.icon as any}
                size={24}
                color="#3b82f6"
                style={styles.actionIcon}
              />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.dangerSection}>
          <Button
            title="Cerrar Sesión"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </Card>
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#dbeafe',
    marginBottom: 12,
  },
  beneficiosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
  },
  tagsContainer: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  roleTag: {
    marginBottom: 4,
  },
  actionsSection: {
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dangerSection: {
    marginBottom: 32,
  },
  logoutButton: {
    width: '100%',
  },
});