import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORES } from "@/util/colores";
import { CreateUserModal } from "@/components/modals/CreateUserModal";
import { TIPOGRAFIA } from "@/util/tipografia";
import { Estadistica, NuevoUsuario } from "@/model/model";
import { usuarioService } from "@/services/usuario.service";
import Toast from "react-native-toast-message";
import { CreateCourseModal } from "@/components/modals/CreateCourseModal";
import { useNavigation } from "expo-router";

const DasboardAdmin = ({ estadisticas }: { estadisticas: Estadistica }) => {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const navigation = useNavigation();

  const handleCrearUsuario = () => {
    setShowCreateUserModal(true);
  };

  const handleCrearCurso = () => {
    setShowCreateCourseModal(true);
  };

  const handleGestionarUsuarios = () => {
    // @ts-ignore - Navigation types
    navigation.navigate("Admin");
  };

  const altaUsuario = async (nuevoUsuario: NuevoUsuario) => {
    try {
      const response = await usuarioService.altaUsuario(nuevoUsuario);
      Toast.show({
        type: "success",
        text1: "Invitación enviada",
        text2: `La invitación ha sido enviada a ${nuevoUsuario.email}.`,
        position: "bottom",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo crear el usuario.",
        position: "bottom",
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{estadisticas.alumnosActivos}</Text>
            <Text style={styles.statLabel}>Alumnos Activos</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{estadisticas.cursos}</Text>
            <Text style={styles.statLabel}>Cursos Activos</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{estadisticas.profesores}</Text>
            <Text style={styles.statLabel}>Profesores</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>
              ${estadisticas.ingresosMensuales}
            </Text>
            <Text style={styles.statLabel}>Ingresos Mes</Text>
          </Card>
        </View>
        <Card>
          <Text style={styles.cardTitle}>Acciones Rápidas</Text>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleCrearUsuario}
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color={COLORES.resaltado}
            />
            <Text style={styles.actionText}>Crear Usuario</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORES.resaltado}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleCrearCurso}
          >
            <Ionicons
              name="library-outline"
              size={20}
              color={COLORES.resaltado}
            />
            <Text style={styles.actionText}>Crear Curso</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORES.resaltado}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleGestionarUsuarios}
          >
            <Ionicons name="apps-outline" size={20} color={COLORES.resaltado} />
            <Text style={styles.actionText}>Ver Usuarios y Cursos</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORES.resaltado}
            />
          </TouchableOpacity>
        </Card>
        <CreateUserModal
          visible={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={(nuevoUsuario: NuevoUsuario) => altaUsuario(nuevoUsuario)}
        />
        <CreateCourseModal
          visible={showCreateCourseModal}
          onClose={() => setShowCreateCourseModal(false)}
        />
      </SafeAreaView>
    </ScrollView>
  );
};

export default DasboardAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.background,
    padding: 16,
  },
  title: {
    ...TIPOGRAFIA.titleL,
    color: COLORES.textPrimary,
    marginBottom: 20,
  },
  cardTitle: {
    ...TIPOGRAFIA.titleL,
    color: COLORES.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    alignItems: "center",
    paddingVertical: 20,
  },
  statNumber: {
    ...TIPOGRAFIA.titleL,
    color: COLORES.resaltado,
    marginBottom: 4,
  },
  statLabel: {
    ...TIPOGRAFIA.titleM,
    color: COLORES.resaltado,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    ...TIPOGRAFIA.subtitle,
    color: COLORES.textPrimary,
  },
});
