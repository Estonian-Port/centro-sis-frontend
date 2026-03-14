import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Modal,
} from "react-native";
import {
  Curso,
  Rol,
  TipoCurso,
  Estado,
  CursoAlumno,
  EstadoPago,
} from "@/model/model";
import { useAuth } from "@/context/authContext";
import { Tag } from "@/components/ui/Tag";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  estadoCursoToTagVariant,
  estadoToTagVariant,
  formatEstadoCurso,
} from "@/helper/funciones";
import { BajaTotalCurso } from "../modals/BajaTotalCursoModal";
import { RegistrarPagoCursoModal } from "../modals/RegistrarPagoCursoModal";

interface CourseItemProps {
  course: Curso | CursoAlumno;
  handleCourseDetails: (course: Curso | CursoAlumno) => void;
  onEditPendingCourse?: (course: Curso) => void;
  onDarDeBaja?: (courseId: number) => void;
}

const CourseItem = ({
  course,
  handleCourseDetails,
  onEditPendingCourse,
  onDarDeBaja,
}: CourseItemProps) => {
  const { selectedRole, usuario } = useAuth();
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showBajaModal, setShowBajaModal] = useState(false);
  const [showRegistrarPagoModal, setShowRegistrarPagoModal] = useState(false);

  const esCursoAlumno = (curso: Curso | CursoAlumno): curso is CursoAlumno => {
    return "estadoPago" in curso;
  };

  const esPendiente = course.estadoAlta === Estado.PENDIENTE;

  const tieneDeuda =
    esCursoAlumno(course) && course.estadoPago === EstadoPago.ATRASADO;

  const getEstilosCurso = () => {
    if (selectedRole === Rol.ALUMNO) {
      if (tieneDeuda) {
        return {
          bg: "#fee2e2",
          border: "#ef4444",
          text: "#991b1b",
          borderWidth: 2,
        };
      }
      return {
        bg: "#ffffff",
        border: "#e5e7eb",
        text: "#111827",
        borderWidth: 1,
      };
    }

    const coloresTipo = {
      [TipoCurso.ALQUILER]: {
        bg: "#dbeafe",
        border: "#3b82f6",
        text: "#1e40af",
        borderWidth: 1,
      },
      [TipoCurso.COMISION]: {
        bg: "#d1fae5",
        border: "#10b981",
        text: "#065f46",
        borderWidth: 1,
      },
    };

    return coloresTipo[course.tipoCurso];
  };

  const estilos = getEstilosCurso();

  const estilosPendiente =
    esPendiente && selectedRole !== Rol.ALUMNO
      ? {
          backgroundColor: "#fef3c7",
          borderColor: "#f59e0b",
          borderWidth: 2,
        }
      : {};

  const estilosBaja =
    course.estadoAlta === Estado.BAJA
      ? {
          backgroundColor: "#f3f4f6",
          borderColor: "#9ca3af",
          opacity: 0.8,
        }
      : {};

  const handlePress = () => {
    if (esPendiente && selectedRole !== Rol.ALUMNO) {
      if (selectedRole === Rol.PROFESOR && onEditPendingCourse) {
        onEditPendingCourse(course);
      } else if (
        selectedRole === Rol.ADMINISTRADOR ||
        selectedRole === Rol.OFICINA
      ) {
        setShowPendingModal(true);
      }
    } else {
      handleCourseDetails(course);
    }
  };

  const mostrarBotonesAccion =
    (selectedRole === Rol.ADMINISTRADOR || selectedRole === Rol.OFICINA) &&
    !esCursoAlumno(course);

  const getTextoPago = () => {
    if (course.tipoCurso === TipoCurso.ALQUILER) {
      return "Alquiler";
    } else {
      return "Comisión";
    }
  };

  const handleRegistrarPago = (e: any) => {
    e.stopPropagation();
    setShowRegistrarPagoModal(true);
  };

  const handleDarDeBaja = (e: any) => {
    e.stopPropagation();
    setShowBajaModal(true);
  };

  const confirmarBaja = async (cursoId: number) => {
    if (onDarDeBaja) {
      onDarDeBaja(cursoId);
    }
  };

  if (!course || !usuario) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        key={course.id}
        style={[
          styles.courseRow,
          {
            backgroundColor: estilos.bg,
            borderColor: estilos.border,
            borderWidth: estilos.borderWidth,
          },
          estilosPendiente,
          estilosBaja,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {esPendiente && selectedRole !== Rol.ALUMNO && (
          <View style={styles.pendingIndicator} />
        )}

        {tieneDeuda && selectedRole === Rol.ALUMNO && (
          <View style={styles.deudaIndicator} />
        )}

        <View style={styles.courseContent}>
          {/* COLUMNA IZQUIERDA */}
          <View style={styles.courseLeftColumn}>
            {/* FILA 1: Nombre del Curso */}
            <View style={styles.courseHeader}>
              <Text 
                style={[styles.courseName, { color: estilos.text }]}
                numberOfLines={1}  
                ellipsizeMode="tail"
              >
                {course.nombre}
              </Text>

              {esPendiente && selectedRole !== Rol.ALUMNO && (
                <Ionicons name="alert-circle" size={20} color="#f59e0b" />
              )}

              {tieneDeuda && selectedRole === Rol.ALUMNO && (
                <View style={styles.deudaBadge}>
                  <Ionicons name="warning" size={16} color="#ef4444" />
                  <Text style={styles.deudaText}>DEUDA</Text>
                </View>
              )}
            </View>

            {/* FILA 2: Profesores */}
            <View style={styles.profesoresRow}>
              <Ionicons name="person-outline" size={14} color="#6b7280" />
              {course.profesores.length > 0 ? (
                <Text 
                  style={styles.profesoresText}
                  numberOfLines={1}  
                  ellipsizeMode="tail"
                >
                  {course.profesores
                    .map((p) => `${p.nombre} ${p.apellido}`)
                    .join(", ")}
                </Text>
              ) : (
                <Text style={[styles.profesoresText, { color: "#9ca3af" }]}>
                  Sin profesor
                </Text>
              )}
            </View>

            {/* FILA 3: Horarios */}
            <View style={styles.horariosRow}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <View style={styles.horariosChips}>
                {course.horarios.length === 0 && (
                  <Text style={[styles.horarioChip]}>
                    Sin horarios asignados
                  </Text>
                )}
                {course.horarios.slice(0, 3).map((horario, index) => (
                  <Text key={index} style={styles.horarioChip}>
                    {horario.dia.substring(0, 3)} {horario.horaInicio}
                  </Text>
                ))}
                {course.horarios.length > 3 && (
                  <Text style={styles.horarioChip}>
                    +{course.horarios.length - 3}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* COLUMNA DERECHA */}
          <View style={styles.courseRightColumn}>
            {/* FILA 1: Tags */}
            <View style={styles.tagsRow}>
              {selectedRole === Rol.ALUMNO &&
              esCursoAlumno(course) &&
              tieneDeuda ? (
                <Tag label={course.estadoPago} variant="danger" size="small" />
              ) : (
                <>
                  {selectedRole !== Rol.ALUMNO && (
                    <Tag
                      label={formatEstadoCurso(course.estado)}
                      variant={estadoCursoToTagVariant(course.estado)}
                      size="small"
                    />
                  )}

                  {selectedRole !== Rol.ALUMNO &&
                    (course.estadoAlta === Estado.PENDIENTE ||
                      course.estadoAlta === Estado.BAJA) && (
                      <Tag
                        label={course.estadoAlta}
                        variant={estadoToTagVariant(course.estadoAlta)}
                        size="small"
                      />
                    )}
                </>
              )}
            </View>

            {/* FILA 2: Alumnos */}
            {selectedRole !== Rol.ALUMNO && (
              <View style={styles.alumnosRow}>
                <Ionicons name="people" size={16} color="#6b7280" />
                <Text style={styles.alumnosCount}>
                  {course.alumnosInscriptos.length}{" "}
                  {course.alumnosInscriptos.length === 1 ? "alumno" : "alumnos"}
                </Text>
              </View>
            )}

            {/* FILA 3: Botones de Acción */}
            {mostrarBotonesAccion &&
              course.estadoAlta !== Estado.PENDIENTE &&
              course.estadoAlta !== Estado.BAJA && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.pagoButton,
                      {
                        backgroundColor:
                          course.tipoCurso === TipoCurso.ALQUILER
                            ? "#dbeafe"
                            : "#d1fae5",
                      },
                    ]}
                    onPress={handleRegistrarPago}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="cash"
                      size={16}
                      color={
                        course.tipoCurso === TipoCurso.ALQUILER
                          ? "#3b82f6"
                          : "#10b981"
                      }
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        {
                          color:
                            course.tipoCurso === TipoCurso.ALQUILER
                              ? "#1e40af"
                              : "#065f46",
                        },
                      ]}
                    >
                      {getTextoPago()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.bajaButton]}
                    onPress={handleDarDeBaja}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showPendingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPendingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="information-circle" size={48} color="#f59e0b" />
              <Text style={styles.modalTitle}>Curso Pendiente</Text>
            </View>

            <Text style={styles.modalMessage}>
              El curso{" "}
              <Text style={styles.modalCourseName}>"{course.nombre}"</Text> está
              en estado PENDIENTE.
            </Text>

            <Text style={styles.modalInfo}>
              El profesor{" "}
              <Text style={styles.modalProfesorName}>
                {course.profesores.length > 0
                  ? course.profesores[0].nombre +
                    " " +
                    course.profesores[0].apellido
                  : "asignado"}
              </Text>{" "}
              debe completar la información del curso para activarlo.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowPendingModal(false)}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BajaTotalCurso
        visible={showBajaModal}
        onClose={() => setShowBajaModal(false)}
        curso={course as Curso}
        onConfirmar={async (cursoId: number) => confirmarBaja(cursoId)}
      />

      <RegistrarPagoCursoModal
        visible={showRegistrarPagoModal}
        onClose={() => {
          setShowRegistrarPagoModal(false);
        }}
        curso={course as Curso}
        usuarioId={usuario.id}
      />
    </>
  );
};

export default CourseItem;

const styles = StyleSheet.create({
  courseRow: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  pendingIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#f59e0b",
  },
  deudaIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#ef4444",
  },
  courseContent: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  courseLeftColumn: {
    flex: 1,
    gap: 8,
    minWidth: 0, 
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    minWidth: 0,
  },
  deudaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef4444",
    flexShrink: 0, 
  },
  deudaText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ef4444",
  },
  profesoresRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  profesoresText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    flex: 1,
    lineHeight: 18,
    minWidth: 0, 
  },
  horariosRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  horariosChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  horarioChip: {
    fontSize: 11,
    color: "#374151",
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontWeight: "500",
  },
  courseRightColumn: {
    gap: 10,
    alignItems: "flex-end",
    minWidth: 140,
    flexShrink: 0, 
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  alumnosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexShrink: 0, 
  },
  alumnosCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 0,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  pagoButton: {
    borderColor: "transparent",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bajaButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  modalHeader: {
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    lineHeight: 22,
  },
  modalCourseName: {
    fontWeight: "700",
    color: "#111827",
  },
  modalInfo: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  modalProfesorName: {
    fontWeight: "600",
    color: "#374151",
  },
  modalButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
});