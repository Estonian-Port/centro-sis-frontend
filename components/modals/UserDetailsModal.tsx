import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "../ui/Card";
import { Tag } from "../ui/Tag";
import { UsuarioDetails, Rol } from "@/model/model";
import { usuarioService } from "@/services/usuario.service";
import Toast from "react-native-toast-message";
import { estadoPagoToTagVariant, estadoUsuarioToTagVariant, rolToTagVariant } from "@/helper/funciones";

interface UserDetailModalProps {
  visible: boolean;
  onClose: () => void;
  idUsuario: number;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  visible,
  onClose,
  idUsuario,
}) => {
  const [usuario, setUsuario] = useState<UsuarioDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && idUsuario) {
      fetchUserDetails();
    }
  }, [visible, idUsuario]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await usuarioService.getUserDetail(idUsuario);
      console.log(response);
      setUsuario(response);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo obtener el usuario.",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsuario(null);
    onClose();
  };

  if (!usuario) {
    return null;
  }

  // Verificar roles
  const esAlumno = usuario.listaRol.includes(Rol.ALUMNO);
  const esProfesor = usuario.listaRol.includes(Rol.PROFESOR);
  const esAdmin = usuario.listaRol.includes(Rol.ADMINISTRADOR);
  const esOficina = usuario.listaRol.includes(Rol.OFICINA);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>
                {usuario.nombre} {usuario.apellido}
              </Text>
              <View style={styles.rolesContainer}>
                {usuario.listaRol.map((rol) => (
                  <Tag
                    key={rol}
                    label={rol}
                    variant={rolToTagVariant(rol)}
                    style={styles.roleTag}
                  />
                ))}
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Información Personal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Personal</Text>
              <Card style={styles.infoCard}>
                <InfoRow
                  icon="mail-outline"
                  iconColor="#3b82f6"
                  label="Email"
                  value={usuario.email}
                />
                <InfoRow
                  icon="card-outline"
                  iconColor="#10b981"
                  label="DNI"
                  value={usuario.dni}
                />
                <InfoRow
                  icon="call-outline"
                  iconColor="#f59e0b"
                  label="Celular"
                  value={usuario.celular}
                />
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#8b5cf6"
                    />
                    <Text style={styles.infoLabel}>Estado</Text>
                  </View>
                  <Tag
                    label={usuario.estado}
                    variant={estadoUsuarioToTagVariant(usuario.estado)}
                  />
                </View>
              </Card>
            </View>

            {/* Información de Alumno */}
            {esAlumno && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="school-outline" size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Información de Alumno</Text>
                </View>
                
                <Card style={styles.alumnoCard}>
                  <Text style={styles.subsectionTitle}>
                    Cursos Inscriptos ({usuario.cursosInscriptos?.length || 0})
                  </Text>
                  
                  {usuario.cursosInscriptos &&
                  usuario.cursosInscriptos.length > 0 ? (
                    usuario.cursosInscriptos.map((curso) => (
                      <View key={curso.id} style={styles.cursoItem}>
                        <View style={styles.cursoMainInfo}>
                          <View style={styles.cursoHeader}>
                            <Ionicons
                              name="book-outline"
                              size={18}
                              color="#3b82f6"
                            />
                            <Text style={styles.cursoNombre}>
                              {curso.nombre}
                            </Text>
                          </View>
                          
                          {/* Horarios */}
                          {curso.horarios && curso.horarios.length > 0 && (
                            <View style={styles.horariosChips}>
                              {curso.horarios.slice(0, 3).map((horario, index) => (
                                <Text key={index} style={styles.horarioChip}>
                                  {horario.dia.substring(0, 2)} {horario.horaInicio}
                                </Text>
                              ))}
                              {curso.horarios.length > 3 && (
                                <Text style={styles.horarioChip}>
                                  +{curso.horarios.length - 3}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>

                        <View style={styles.cursoMetaInfo}>
                          <View style={styles.pagoInfo}>
                            <Ionicons
                              name="cash-outline"
                              size={16}
                              color="#10b981"
                            />
                            <Text style={styles.pagoText}>
                              Pago elegido: {curso.tipoPagoElegido}
                            </Text>
                          </View>
                          
                          <Tag
                            label={curso.estadoPago}
                            variant={estadoPagoToTagVariant(curso.estadoPago)}
                          />
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="folder-open-outline" size={40} color="#9ca3af" />
                      <Text style={styles.emptyText}>
                        No hay cursos inscritos
                      </Text>
                    </View>
                  )}
                </Card>
              </View>
            )}

            {/* Información de Profesor */}
            {esProfesor && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={20} color="#10b981" />
                  <Text style={styles.sectionTitle}>Información de Profesor</Text>
                </View>
                
                <Card style={styles.profesorCard}>
                  <Text style={styles.subsectionTitle}>
                    Cursos Dictados ({usuario.cursosDictados?.length || 0})
                  </Text>
                  
                  {usuario.cursosDictados &&
                  usuario.cursosDictados.length > 0 ? (
                    usuario.cursosDictados.map((curso) => (
                      <View key={curso.id} style={styles.cursoDictadoItem}>
                        <View style={styles.cursoDictadoMain}>
                          <Ionicons
                            name="easel-outline"
                            size={18}
                            color="#10b981"
                          />
                          <Text style={styles.cursoDictadoNombre}>
                            {curso.nombre}
                          </Text>
                        </View>
                        
                        <View style={styles.cursoDictadoInfo}>
                          <View style={styles.fechaInfo}>
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color="#6b7280"
                            />
                            <Text style={styles.fechaText}>
                              {curso.fechaInicio}
                            </Text>
                            <Ionicons
                              name="arrow-forward"
                              size={12}
                              color="#9ca3af"
                            />
                            <Text style={styles.fechaText}>
                              {curso.fechaFin}
                            </Text>
                          </View>
                          
                          <Text style={styles.estadoCursoText}>
                            {curso.estado}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="folder-open-outline" size={40} color="#9ca3af" />
                      <Text style={styles.emptyText}>
                        No hay cursos dictados
                      </Text>
                    </View>
                  )}
                </Card>
              </View>
            )}

            {/* Solo roles administrativos sin info adicional */}
            {(esAdmin || esOficina) && !esAlumno && !esProfesor && (
              <View style={styles.section}>
                <Card style={styles.adminCard}>
                  <View style={styles.adminInfo}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={48}
                      color="#8b5cf6"
                    />
                    <Text style={styles.adminText}>
                      {esAdmin ? "Usuario Administrador" : "Usuario de Oficina"}
                    </Text>
                    <Text style={styles.adminSubtext}>
                      Con permisos de gestión del sistema
                    </Text>
                  </View>
                </Card>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Componente helper para filas de información
const InfoRow = ({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelContainer}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 700,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  roleTag: {
    marginRight: 0,
    marginBottom: 0,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  alumnoCard: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
    padding: 16,
  },
  cursoItem: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cursoMainInfo: {
    marginBottom: 10,
  },
  cursoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cursoNombre: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  horariosChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  horarioChip: {
    fontSize: 11,
    color: "#3b82f6",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontWeight: "500",
  },
  cursoMetaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  pagoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pagoText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  profesorCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
    borderWidth: 1,
    padding: 16,
  },
  cursoDictadoItem: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cursoDictadoMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cursoDictadoNombre: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  cursoDictadoInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fechaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fechaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  estadoCursoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
    textTransform: "uppercase",
  },
  adminCard: {
    backgroundColor: "#faf5ff",
    borderColor: "#8b5cf6",
    borderWidth: 1,
    padding: 24,
  },
  adminInfo: {
    alignItems: "center",
    gap: 12,
  },
  adminText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b21a8",
    textAlign: "center",
  },
  adminSubtext: {
    fontSize: 14,
    color: "#9333ea",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});