import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Curso } from "@/model/model";
import { useAuth } from "@/context/authContext";

const CourseItem = ({
  course,
  handleCourseDetails,
}: {
  course: Curso;
  handleCourseDetails: (course: any) => void;
}) => {
  const {selectedRole} = useAuth();

  return (
    <TouchableOpacity
      key={course.id}
      style={styles.courseRow}
      onPress={() => {
        handleCourseDetails(course);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.courseMainInfo}>
        <Text style={styles.courseName}>{course.nombre}</Text>
        <View style={styles.courseHorarios}>
          {course.horarios.slice(0, 2).map((horario, index) => (
            <Text key={index} style={styles.horarioChip}>
              {horario.dia.substring(0, 3)} {horario.horaInicio}
            </Text>
          ))}
          {course.horarios.length > 2 && (
            <Text style={styles.horarioChip}>
              +{course.horarios.length - 2}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.courseMetaInfo}>
        <Text style={styles.profesorName}>
          {course.profesores.length > 0 ? course.profesores[0].nombre + " " + course.profesores[0].apellido : "Sin profesor"}
        </Text>
        {selectedRole != "ALUMNO" && (
          <Text style={styles.alumnosCount}>
            {course.alumnosInscriptos.length}{" "}
            {course.alumnosInscriptos.length === 1 ? "alumno" : "alumnos"}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
export default CourseItem;

const styles = StyleSheet.create({
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  courseMainInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  courseHorarios: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  horarioChip: {
    fontSize: 12,
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontWeight: "500",
  },
  courseMetaInfo: {
    alignItems: "flex-end",
  },
  profesorName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 4,
  },
  alumnosCount: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
