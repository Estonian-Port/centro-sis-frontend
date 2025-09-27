import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
  const { user, logout, hasMultipleRoles } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: logout },
      ]
    );
  };

  type ProfileSectionItem = {
    label: string;
    value: string | undefined;
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
        { label: 'Nombre completo', value: `${user?.nombre} ${user?.apellido}` },
        { label: 'Email', value: user?.email },
        { label: 'DNI', value: user?.dni },
        { label: 'Teléfono', value: user?.telefono },
      ],
    },
    {
      title: 'Información de Cuenta',
      items: [
        { label: 'Estado', value: user?.estado, isTag: true },
        { 
          label: 'Roles', 
          value: user?.roles.map(r => r.nombre).join(', '),
          isTag: true,
          multiple: true 
        },
      ],
    },
  ];

  const actionItems = [
    {
      icon: 'person-outline',
      title: 'Editar Perfil',
      subtitle: 'Actualizar información personal',
      onPress: () => {},
    },
    {
      icon: 'key-outline',
      title: 'Cambiar Contraseña',
      subtitle: 'Actualizar credenciales de acceso',
      onPress: () => {},
    },
    {
      icon: 'time-outline',
      title: 'Historial de Accesos',
      subtitle: 'Ver últimos inicios de sesión',
      onPress: () => {},
    },
    {
      icon: 'download-outline',
      title: 'Descargar Información',
      subtitle: 'Exportar datos personales',
      onPress: () => {
        const userData = {
          nombre: user?.nombre,
          apellido: user?.apellido,
          dni: user?.dni,
          email: user?.email,
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
          {user?.nombre} {user?.apellido}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        {user?.beneficios && user.beneficios.length > 0 && (
          <View style={styles.beneficiosContainer}>
            {user.beneficios.map((beneficio, index) => (
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
                    <View style={styles.tagsContainer}>
                      {user?.roles.map((role) => (
                        <Tag 
                          key={role.id} 
                          label={role.nombre} 
                          variant="info"
                          style={styles.roleTag}
                        />
                      ))}
                    </View>
                  ) : (
                    <Tag 
                      label={item.value || ''} 
                      variant={item.value === 'ALTA' ? 'success' : 'error'} 
                    />
                  )
                ) : (
                  <Text style={styles.infoValue}>{item.value || 'No disponible'}</Text>
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
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#9ca3af" 
              />
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
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
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
  },
  roleTag: {
    marginLeft: 4,
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