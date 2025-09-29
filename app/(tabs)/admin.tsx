import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Course, User } from '@/model/model';
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
  View,
} from 'react-native';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Map roles.nombre to the allowed string literals
      const mappedContent = response.content.map((user: any) => ({
        ...user,
        roles: user.roles.map((role: any) => ({
          ...role,
          nombre: role.nombre as 'ALUMNO' | 'PROFESOR' | 'ADMINISTRADOR',
        })),
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
      // Map each course's profesor to a full User object (add missing fields with defaults)
      const mappedCourses = response.content.map((course: any) => ({
        ...course,
        profesor: course.profesor
          ? {
              ...course.profesor,
              email: course.profesor.email ?? '',
              roles: course.profesor.roles ?? [],
              estado: course.profesor.estado ?? 'ALTA',
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
          variant={user.estado === 'ALTA' ? 'success' : 'error'}
        />
      </View>

      <View style={styles.rolesContainer}>
        {user.roles.map((role) => (
          <Tag
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
          onPress={() => {}}
        />
        <Button
          title={user.estado === 'ALTA' ? 'Dar de Baja' : 'Dar de Alta'}
          variant={user.estado === 'ALTA' ? 'danger' : 'primary'}
          size="small"
          onPress={() => {}}
        />
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
          variant={course.estado === 'ALTA' ? 'success' : 'error'}
        />
      </View>

      <View style={styles.itemActions}>
        <Button
          title="Ver Detalles"
          variant="outline"
          size="small"
          onPress={() => {}}
        />
        <Button
          title="Gestionar Alumnos"
          variant="secondary"
          size="small"
          onPress={() => {}}
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
          onPress={() => {}}
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
