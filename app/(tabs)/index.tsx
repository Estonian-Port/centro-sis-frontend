import { useAuth } from "@/context/authContext";
import { CursoAlumno, Curso, Rol, Estadistica } from "@/model/model";
import { useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { administracionService } from "@/services/administracion.service";
import { usuarioService } from "@/services/usuario.service";
import { DashboardProfesor } from "@/components/dashboard/DashboardProfesor";
import { DashboardAlumno } from "@/components/dashboard/DashboardAlumno";
import DashboardAdmin from "@/components/dashboard/DashboardAdmin";
import DashboardPorteria from "@/components/dashboard/DashboardPorteria";

export default function HomeScreen() {
  const { selectedRole, usuario } = useAuth();
  const [cursosAlumno, setCursosAlumno] = useState<CursoAlumno[]>([]);
  const [cursosProfesor, setCursosProfesor] = useState<Curso[]>([]);
  const [stats, setStats] = useState<Estadistica>({
    alumnosActivos: 0,
    cursos: 0,
    profesores: 0,
    ingresosMensuales: 0,
  });

  const fetchData = async () => {
    if (usuario != null && selectedRole === Rol.ALUMNO) {
      let listaCursos = await usuarioService.getAllCoursesByAlumno(usuario.id);
      setCursosAlumno(listaCursos);
    }
    if (usuario != null && selectedRole === Rol.PROFESOR) {
      let listaCursos = await usuarioService.getAllCoursesByProfesor(
        usuario.id,
      );
      setCursosProfesor(listaCursos);
    }
    if (selectedRole === Rol.ADMINISTRADOR || selectedRole === Rol.OFICINA) {
      const stats = await administracionService.getEstadisticas();
      setStats(stats);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRole, usuario]);

  const renderContent = () => {
    switch (selectedRole) {
      case Rol.ALUMNO:
        return <DashboardAlumno cursos={cursosAlumno} />;
      case Rol.PROFESOR:
        return (
          <DashboardProfesor cursos={cursosProfesor} onRefresh={fetchData} />
        );
      case Rol.ADMINISTRADOR:
        return <DashboardAdmin estadisticas={stats} />;
      case Rol.OFICINA:
        return <DashboardAdmin estadisticas={stats} />;
      case Rol.PORTERIA:
        return <DashboardPorteria />;
      default:
        return (
          <View style={styles.emptyState}>
            <Text>Selecciona un rol</Text>
          </View>
        );
    }
  };

  return (
    <>
      {Platform.OS !== "web" && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#f9fafb"
        />
      )}
      {renderContent()}
    </>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
