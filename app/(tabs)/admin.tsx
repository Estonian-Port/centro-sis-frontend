import { CreateCourseModal } from '@/components/modals/CreateCourseModal';
import { CreateUserModal } from '@/components/modals/CreateUserModal';
import { PayProfessorModal } from '@/components/modals/PayProfessorModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Course, EstadoUsuario, Role, User } from '@/model/model';
import { apiMock } from '@/services/apiMock.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showPayProfessorModal, setShowPayProfessorModal] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<User | null>(null);

  const handleCreateUser = () => {
    setShowCreateUserModal(true);
  };

  const handleCreateCourse = () => {
    setShowCreateCourseModal(true);
  };

  const handlePayProfessor = (professor: User) => {
    setSelectedProfessor(professor);
    setShowPayProfessorModal(true);
  };

  const handleViewUserDetails = (user: User) => {
    Alert.alert(
      'Ver Detalles de Usuario',
      `Funcionalidad pendiente para: ${user.nombre} ${user.apellido}`
    );
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.estado === EstadoUsuario.ALTA ? EstadoUsuario.BAJA : EstadoUsuario.ALTA;
    Alert.alert(
      'Cambiar Estado',
      `¿Estás seguro de ${newStatus === EstadoUsuario.ALTA ? 'dar de alta' : 'dar de baja'} a ${user.nombre} ${user.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              // Aquí llamarías a tu API para cambiar el estado
              // await apiMock.updateUserStatus(user.id, newStatus);
              Alert.alert('Éxito', 'Estado actualizado correctamente');
              loadUsers();
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          }
        }
      ]
    );
  };

  const handleViewCourseDetails = (course: Course) => {
    Alert.alert(
      'Ver Detalles de Curso',
      `Funcionalidad pendiente para: ${course.nombre}`
    );
  };

  const handleManageStudents = (course: Course) => {
    Alert.alert(
      'Gestionar Alumnos',
      `Funcionalidad pendiente para: ${course.nombre}`
    );
  };

  const handleModalSuccess = () => {
    console.log('Modal success, reloading data');
    // Reload data after successful creation
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadCourses();
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadCourses();
    }
  }, [activeTab, searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiMock.getUsers({
        q: searchQuery,
      });

      const mappedContent: User[] = response.content.map((user: any) => ({
        ...user,
        roles: user.roles as Role[],
      }));

      setUsers(mappedContent);
    } catch (error) {
      Alert.alert('Error', 'Error al cargar usuarios');
    }
    setLoading(false);
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await apiMock.getCourses({
        q: searchQuery,
      });

      const mappedCourses = response.content.map((course: any) => ({
        ...course,
        profesor: course.profesor
          ? {
              ...course.profesor,
              email: course.profesor.email ?? '',
              roles: (course.profesor.roles as Role[]) ?? [],
              estado: course.profesor.estado ?? EstadoUsuario.ALTA,
            }
          : undefined,
      }));

      setCourses(mappedCourses);
    } catch (error) {
      Alert.alert('Error', 'Error al cargar cursos');
    }
    setLoading(false);
  };

  const renderUserItem = (user: User) => (
    <Card key={user.id} style={styles.listItem}>
      <View style={styles.itemHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.nombre} {user.apellido}
          </Text>
          <Text style={styles.userDetail}>{user.email}</Text>
          <Text style={styles.userDetail}>DNI: {user.dni}</Text>
        </View>
        <Tag
          label={user.estado}
          variant={user.estado === EstadoUsuario.ALTA ? 'success' : 'error'}
        />
      </View>

      <View style={styles.rolesContainer}>
        {user.roles.map((role) => (
          <Tag
            key={role}
            label={role}
            variant="info"
            style={styles.roleTag}
          />
        ))}
      </View>

      <View style={styles.itemActions}>
        <Button
          title="Ver Detalles"
          variant="outline"
          size="small"
          onPress={() => handleViewUserDetails(user)}
        />
        <Button
          title={user.estado === EstadoUsuario.ALTA ? 'Dar de Baja' : 'Dar de Alta'}
          variant={user.estado === EstadoUsuario.ALTA ? 'danger' : 'primary'}
          size="small"
          onPress={() => handleToggleUserStatus(user)}
        />

        {user.roles.some(role => role === Role.PROFESOR) && (
          <Button
            title="Pagar"
            variant="secondary"
            size="small"
            onPress={() => handlePayProfessor(user)}
          />
        )}
      </View>
    </Card>
  );

  const renderCourseItem = (course: Course) => (
    <Card key={course.id} style={styles.listItem}>
      <View style={styles.itemHeader}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{course.nombre}</Text>
          <Text style={styles.courseDetail}>
            {course.dias.join(', ')} - {course.horario}
          </Text>
          <Text style={styles.courseDetail}>
            Profesor: {course.profesor?.nombre} {course.profesor?.apellido}
          </Text>
          <Text style={styles.courseDetail}>
            Arancel: ${course.arancel.toLocaleString()}
          </Text>
        </View>
        <Tag
          label={course.estado}
          variant={course.estado === EstadoUsuario.ALTA ? 'success' : 'error'}
        />
      </View>

      <View style={styles.itemActions}>
        <Button
          title="Ver Detalles"
          variant="outline"
          size="small"
          onPress={() => handleViewCourseDetails(course)}
        />
        <Button
          title="Gestionar Alumnos"
          variant="secondary"
          size="small"
          onPress={() => handleManageStudents(course)}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administración</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'users' && styles.activeTabText,
              ]}
            >
              Usuarios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'courses' && styles.activeTab]}
            onPress={() => setActiveTab('courses')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'courses' && styles.activeTabText,
              ]}
            >
              Cursos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar ${activeTab === 'users' ? 'usuarios' : 'cursos'}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Button
          title={`Crear ${activeTab === 'users' ? 'Usuario' : 'Curso'}`}
          variant="primary"
          size="small"
          onPress={activeTab === 'users' ? handleCreateUser : handleCreateCourse}
        />
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'users' && users.map(renderUserItem)}
        {activeTab === 'courses' && courses.map(renderCourseItem)}

        {((activeTab === 'users' && users.length === 0) ||
          (activeTab === 'courses' && courses.length === 0)) && (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                activeTab === 'users' ? 'people-outline' : 'library-outline'
              }
              size={48}
              color="#9ca3af"
            />
            <Text style={styles.emptyText}>
              No se encontraron {activeTab === 'users' ? 'usuarios' : 'cursos'}
            </Text>
          </View>
        )}
      </ScrollView>
      
      <CreateUserModal
        visible={showCreateUserModal}
        onClose={() => {
          console.log('Closing create user modal');
          setShowCreateUserModal(false);
        }}
        onSuccess={handleModalSuccess}
      />

      <CreateCourseModal
        visible={showCreateCourseModal}
        onClose={() => {
          console.log('Closing create course modal');
          setShowCreateCourseModal(false);
        }}
        onSuccess={handleModalSuccess}
      />

      {selectedProfessor && (
        <PayProfessorModal
          visible={showPayProfessorModal}
          onClose={() => {
            console.log('Closing pay professor modal');
            setShowPayProfessorModal(false);
            setSelectedProfessor(null);
          }}
          onSuccess={handleModalSuccess}
          professor={selectedProfessor}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listItem: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  courseInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  courseDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  roleTag: {
    marginRight: 6,
    marginBottom: 6,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});