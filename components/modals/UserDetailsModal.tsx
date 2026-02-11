import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "../ui/Card";
import { Tag } from "../ui/Tag";
import { UsuarioDetails, Rol, Curso, Estado } from "@/model/model";
import { usuarioService } from "@/services/usuario.service";
import Toast from "react-native-toast-message";
import {
  estadoPagoToTagVariant,
  estadoUsuarioToTagVariant,
  formatEstadoPago,
  rolToTagVariant,
} from "@/helper/funciones";
import { useAuth } from "@/context/authContext";
import { Button } from "../ui/Button";
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import * as Sharing from "expo-sharing"; // Para compartir en móvil
// @ts-ignore
import { captureRef } from "react-native-view-shot"; // Para capturar la vista como imagen
import { AdultoResponsableModal } from "./AdultoResponsableModal";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface UserDetailModalProps {
  visible: boolean;
  onClose: () => void;
  idUsuario: number;
  fetchUsers: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  visible,
  onClose,
  idUsuario,
  fetchUsers,
}) => {
  const { usuario } = useAuth();
  const [user, setUsuario] = useState<UsuarioDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [downloadingQR, setDownloadingQR] = useState(false);

  // Estados para modales de confirmación
  const [showConfirmAsignar, setShowConfirmAsignar] = useState(false);
  const [showConfirmRemover, setShowConfirmRemover] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [showAdultoResponsableModal, setShowAdultoResponsableModal] =
    useState(false);

  // Ref para capturar el QR
  const qrRef = useRef<any>(null);

  const esAdmin = usuario!.listaRol.includes(Rol.ADMINISTRADOR);

  useEffect(() => {
    if (visible && idUsuario) {
      fetchUserDetails();
    }
  }, [visible, idUsuario]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await usuarioService.getUserDetail(idUsuario);
      setUsuario(response);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo obtener el usuario.",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsuario(null);
    setShowRoleSelector(false);
    onClose();
  };

  const handleAsignarRol = async (rol: Rol) => {
    if (!user) return;
    try {
      await usuarioService.asignarRol(user.id, rol);
      Toast.show({
        type: "success",
        text1: "Rol Asignado",
        text2: `Rol de ${rol} asignado correctamente`,
        position: "bottom",
      });
      fetchUserDetails();
      fetchUsers();
      setShowConfirmAsignar(false);
      setRolSeleccionado(null);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo asignar el rol",
        position: "bottom",
      });
    }
  };

  const confirmarAsignarRol = (rol: Rol) => {
    setRolSeleccionado(rol);
    setShowConfirmAsignar(true);
  };

  const handleRemoverRol = async (rol: Rol) => {
    if (!user) return;

    // Validar que no se quite el último rol
    if (user.listaRol.length === 1) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se puede quitar el último rol del usuario",
        position: "bottom",
      });
      return;
    }

    try {
      await usuarioService.removerRol(user.id, rol);
      Toast.show({
        type: "success",
        text1: "Rol Removido",
        text2: `Rol de ${rol} removido correctamente`,
        position: "bottom",
      });
      fetchUserDetails();
      fetchUsers();
      setShowConfirmRemover(false);
      setRolSeleccionado(null);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo remover el rol",
        position: "bottom",
      });
    }
  };

  const confirmarRemoverRol = (rol: Rol) => {
    setRolSeleccionado(rol);
    setShowConfirmRemover(true);
  };

  const handleDownloadQR = async () => {
    if (!user) return;

    setDownloadingQR(true);

    try {
      if (Platform.OS === "web") {
        // En web: usar html2canvas o capturar el SVG
        try {
          // Intentar capturar el contenedor del QR
          const qrElement = qrRef.current;

          if (qrElement) {
            // Buscar el SVG dentro del contenedor
            const svgElement = qrElement.querySelector("svg");

            if (svgElement) {
              // Obtener el tamaño real del SVG
              const svgWidth = svgElement.width.baseVal.value || 180;
              const svgHeight = svgElement.height.baseVal.value || 180;

              // Crear un canvas con el tamaño exacto del QR
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const svgData = new XMLSerializer().serializeToString(svgElement);
              const img = new Image();

              // Usar el tamaño real del SVG
              canvas.width = svgWidth;
              canvas.height = svgHeight;

              img.onload = () => {
                if (ctx) {
                  // Fondo blanco
                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);

                  // Dibujar el QR
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                  // Descargar
                  const link = document.createElement("a");
                  link.href = canvas.toDataURL("image/png");
                  link.download = `QR_${user.nombre}_${user.apellido}_${user.dni}.png`;
                  link.click();

                  Toast.show({
                    type: "success",
                    text1: "QR Descargado",
                    text2: "El código QR se descargó correctamente",
                    position: "bottom",
                  });
                }
              };

              img.src =
                "data:image/svg+xml;base64," +
                btoa(unescape(encodeURIComponent(svgData)));
            } else {
              throw new Error("No se encontró el SVG");
            }
          } else {
            throw new Error("No se encontró el elemento QR");
          }
        } catch (webError) {
          console.error("Error en web:", webError);
          Toast.show({
            type: "error",
            text1: "Error",
            text2:
              "No se pudo descargar el QR en web. Intenta hacer captura de pantalla.",
            position: "bottom",
          });
        }
      } else {
        // En móvil: capturar y compartir directamente
        const uri = await captureRef(qrRef, {
          format: "png",
          quality: 1,
        });

        // Compartir directamente sin guardar
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: `QR de ${user.nombre} ${user.apellido}`,
          });

          Toast.show({
            type: "success",
            text1: "QR Generado",
            text2: "El código QR está listo para compartir",
            position: "bottom",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No se puede compartir archivos en este dispositivo",
            position: "bottom",
          });
        }
      }
    } catch (error) {
      console.error("Error descargando QR:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo generar el código QR",
        position: "bottom",
      });
    } finally {
      setDownloadingQR(false);
    }
  };

  if (!user) {
    return null;
  }

  const esMenorDeEdad = (fechaNacimiento: string | undefined) => {
    if (!fechaNacimiento) return false;
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth() - fechaNac.getMonth();

    if (
      mesActual < 0 ||
      (mesActual === 0 && hoy.getDate() < fechaNac.getDate())
    ) {
      return edad - 1 < 18;
    }
    return edad < 18;
  };

  const esAlumno = user.listaRol.includes(Rol.ALUMNO);
  const esProfesor = user.listaRol.includes(Rol.PROFESOR);
  const esAdminUsuario = user.listaRol.includes(Rol.ADMINISTRADOR);
  const esOficina = user.listaRol.includes(Rol.OFICINA);

  const rolesDisponibles = Object.values(Rol).filter(
    (rol) => !user.listaRol.includes(rol),
  );

  const handleViewCourseDetails = (course: Curso) => {
    router.push(`/curso/${course.id}/alumnos`);
    onClose();
  };

  // Data del QR (igual que en mi-qr)
  const qrData = {
    usuarioId: user.id,
    tipo: "PERMANENTE",
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>
                {user.nombre} {user.apellido}
              </Text>
              <View style={styles.rolesContainer}>
                {user.listaRol.map((rol) => (
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
                  value={user.email}
                />
                <InfoRow
                  icon="card-outline"
                  iconColor="#10b981"
                  label="DNI"
                  value={user.dni}
                />
                <InfoRow
                  icon="call-outline"
                  iconColor="#f59e0b"
                  label="Celular"
                  value={user.celular}
                />
                <InfoRow
                  icon="calendar-outline"
                  iconColor="#A72703"
                  label="Fecha de Nacimiento"
                  value={user.fechaNacimiento}
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
                    label={user.estado}
                    variant={estadoUsuarioToTagVariant(user.estado)}
                  />
                </View>
              </Card>
              {esMenorDeEdad(user.fechaNacimiento) &&
                user.adultoResponsable && (
                  <TouchableOpacity
                    style={styles.adultoResponsableCard}
                    onPress={() => setShowAdultoResponsableModal(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.adultoResponsableHeader}>
                      <View style={styles.adultoResponsableIconCircle}>
                        <Ionicons name="people" size={20} color="#f59e0b" />
                      </View>
                      <View style={styles.adultoResponsableInfo}>
                        <Text style={styles.adultoResponsableTitle}>
                          Adulto Responsable
                        </Text>
                        <Text style={styles.adultoResponsableName}>
                          {user.adultoResponsable.nombre}{" "}
                          {user.adultoResponsable.apellido}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                      />
                    </View>
                  </TouchableOpacity>
                )}
            </View>

            {/* SECCIÓN DE CÓDIGO QR (solo para admins) y usuario que no esten de baja */}
            {(esAdmin || esOficina) && user.estado !== Estado.BAJA && (
              <View style={styles.section}>
                <Card style={styles.qrCard}>
                  <View style={styles.qrHeader}>
                    <Ionicons name="qr-code" size={20} color="#3b82f6" />
                    <Text style={styles.qrTitle}>Código QR del Usuario</Text>
                  </View>

                  <View style={styles.qrContainer}>
                    {/* QR Code con ref para captura */}
                    <View ref={qrRef} style={styles.qrWrapper}>
                      <QRCode
                        value={JSON.stringify(qrData)}
                        size={Platform.OS === "web" ? 260 : 180}
                        backgroundColor="white"
                        color="black"
                        // @ts-ignore
                        getRef={(ref) => (qrRef.current = ref)}
                      />
                    </View>

                    <Text style={styles.qrSubtext}>
                      ID: {user.id} • DNI: {user.dni}
                    </Text>

                    <Button
                      variant="primary"
                      onPress={handleDownloadQR}
                      loading={downloadingQR}
                      style={styles.downloadButton}
                      title={downloadingQR ? "Generando..." : "Descargar QR"}
                    />
                  </View>
                </Card>
              </View>
            )}

            {/* Gestion de roles (asignar + desasignar) */}
            {esAdmin && user.estado !== Estado.BAJA && (
              <View style={styles.section}>
                <Card style={styles.roleManagementCard}>
                  <View style={styles.roleManagementHeader}>
                    <Ionicons name="people-outline" size={20} color="#8b5cf6" />
                    <Text style={styles.roleManagementTitle}>
                      Gestión de Roles
                    </Text>
                  </View>

                  {/* Roles Actuales */}
                  {user.listaRol.length > 0 && (
                    <View style={styles.rolesActualesSection}>
                      <Text style={styles.rolesSubtitle}>Roles Actuales:</Text>
                      <View style={styles.rolesActualesList}>
                        {user.listaRol.map((rol) => (
                          <View key={rol} style={styles.rolActualItem}>
                            <Tag label={rol} variant={rolToTagVariant(rol)} />
                            <TouchableOpacity
                              onPress={() => confirmarRemoverRol(rol)}
                              style={styles.removeRolButton}
                            >
                              <Ionicons
                                name="close-circle"
                                size={20}
                                color="#ef4444"
                              />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Roles Disponibles para Asignar */}
                  {rolesDisponibles.length > 0 && (
                    <View style={styles.rolesDisponiblesSection}>
                      <Text style={styles.rolesSubtitle}>
                        Asignar Nuevo Rol:
                      </Text>
                      <View style={styles.roleOptionsContainer}>
                        {rolesDisponibles.map((rol) => (
                          <TouchableOpacity
                            key={rol}
                            style={styles.roleOption}
                            onPress={() => confirmarAsignarRol(rol)}
                          >
                            <Tag label={rol} variant={rolToTagVariant(rol)} />
                            <Ionicons
                              name="add-circle"
                              size={20}
                              color="#10b981"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {rolesDisponibles.length === 0 && (
                    <View style={styles.allRolesAssigned}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#10b981"
                      />
                      <Text style={styles.allRolesText}>
                        Todos los roles están asignados
                      </Text>
                    </View>
                  )}
                </Card>
              </View>
            )}

            {/* Información de Alumno */}
            {esAlumno && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="school-outline" size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Información de Alumno</Text>
                </View>

                <Card style={styles.alumnoCard}>
                  <Text style={styles.subsectionTitle}>
                    Cursos Inscriptos ({user.cursosInscriptos?.length || 0})
                  </Text>

                  {user.cursosInscriptos && user.cursosInscriptos.length > 0 ? (
                    user.cursosInscriptos.map((curso) => (
                      <TouchableOpacity
                        key={curso.id}
                        onPress={() => handleViewCourseDetails(curso)}
                      >
                        <View style={styles.cursoItem}>
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

                            {curso.horarios && curso.horarios.length > 0 && (
                              <View style={styles.horariosChips}>
                                {curso.horarios
                                  .slice(0, 3)
                                  .map((horario, index) => (
                                    <Text
                                      key={index}
                                      style={styles.horarioChip}
                                    >
                                      {horario.dia.substring(0, 2)}{" "}
                                      {horario.horaInicio}
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
                                {curso.tipoPagoElegido?.tipo || "N/A"} - $
                                {curso.tipoPagoElegido?.monto?.toLocaleString() ||
                                  0}
                                {curso.tipoPagoElegido?.cuotas > 1 &&
                                  ` (${curso.tipoPagoElegido.cuotas} cuotas)`}
                              </Text>
                            </View>

                            <Tag
                              label={formatEstadoPago(curso.estadoPago)}
                              variant={estadoPagoToTagVariant(curso.estadoPago)}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons
                        name="folder-open-outline"
                        size={40}
                        color="#9ca3af"
                      />
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
                  <Text style={styles.sectionTitle}>
                    Información de Profesor
                  </Text>
                </View>

                <Card style={styles.profesorCard}>
                  <Text style={styles.subsectionTitle}>
                    Cursos Dictados ({user.cursosDictados?.length || 0})
                  </Text>

                  {user.cursosDictados && user.cursosDictados.length > 0 ? (
                    user.cursosDictados.map((curso) => (
                      <TouchableOpacity
                        key={curso.id}
                        onPress={() => handleViewCourseDetails(curso)}
                      >
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
                              {formatEstadoPago(curso.estado)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons
                        name="folder-open-outline"
                        size={40}
                        color="#9ca3af"
                      />
                      <Text style={styles.emptyText}>
                        No hay cursos dictados
                      </Text>
                    </View>
                  )}
                </Card>
              </View>
            )}

            {/* Solo roles administrativos sin info adicional */}
            {(esAdminUsuario || esOficina) && !esAlumno && !esProfesor && (
              <View style={styles.section}>
                <Card style={styles.adminCard}>
                  <View style={styles.adminInfo}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={48}
                      color="#8b5cf6"
                    />
                    <Text style={styles.adminText}>
                      {esAdminUsuario
                        ? "Usuario Administrador"
                        : "Usuario de Oficina"}
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

      {/* MODAL DE CONFIRMACIÓN - ASIGNAR ROL */}
      <Modal
        visible={showConfirmAsignar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmAsignar(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIconContainer}>
              <Ionicons name="add-circle" size={56} color="#10b981" />
            </View>

            <Text style={styles.confirmTitle}>Asignar Rol</Text>

            <Text style={styles.confirmMessage}>
              ¿Estás seguro que deseas asignar el rol de{" "}
              <Text style={styles.confirmRolText}>{rolSeleccionado}</Text> a{" "}
              <Text style={styles.confirmUserText}>
                {user?.nombre} {user?.apellido}
              </Text>
              ?
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonCancel]}
                onPress={() => {
                  setShowConfirmAsignar(false);
                  setRolSeleccionado(null);
                }}
              >
                <Text style={styles.confirmButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonConfirm]}
                onPress={() => handleAsignarRol(rolSeleccionado!)}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.confirmButtonConfirmText}>Sí, Asignar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN - REMOVER ROL */}
      <Modal
        visible={showConfirmRemover}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmRemover(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <View
              style={[styles.confirmIconContainer, styles.confirmIconDanger]}
            >
              <Ionicons name="alert-circle" size={56} color="#ef4444" />
            </View>

            <Text style={styles.confirmTitle}>Remover Rol</Text>

            <Text style={styles.confirmMessage}>
              ¿Estás seguro que deseas remover el rol de{" "}
              <Text style={styles.confirmRolText}>{rolSeleccionado}</Text> a{" "}
              <Text style={styles.confirmUserText}>
                {user?.nombre} {user?.apellido}
              </Text>
              ?
            </Text>

            <View style={styles.confirmWarning}>
              <Ionicons name="warning" size={18} color="#f59e0b" />
              <Text style={styles.confirmWarningText}>
                Esta acción modificará los permisos del usuario
              </Text>
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonCancel]}
                onPress={() => {
                  setShowConfirmRemover(false);
                  setRolSeleccionado(null);
                }}
              >
                <Text style={styles.confirmButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonDanger]}
                onPress={() => handleRemoverRol(rolSeleccionado!)}
              >
                <Ionicons name="trash" size={20} color="#ffffff" />
                <Text style={styles.confirmButtonDangerText}>Sí, Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {user?.adultoResponsable && (
        <AdultoResponsableModal
          visible={showAdultoResponsableModal}
          onClose={() => setShowAdultoResponsableModal(false)}
          adultoResponsable={user.adultoResponsable}
        />
      )}
    </Modal>
  );
};

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
    height: Platform.select({
      ios: 650,
      android: 700,
      default: 650,
    }),
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
  qrCard: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
    padding: 20,
  },
  qrHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
  },
  qrContainer: {
    alignItems: "center",
    gap: 12,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrSubtext: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  downloadButton: {
    minWidth: 200,
  },
  roleManagementCard: {
    backgroundColor: "#faf5ff",
    borderColor: "#8b5cf6",
    borderWidth: 1,
    padding: 16,
  },
  roleManagementHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  roleManagementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b21a8",
  },
  rolesActualesSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9d5ff",
  },
  rolesSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b21a8",
    marginBottom: 10,
  },
  rolesActualesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rolActualItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  removeRolButton: {
    padding: 2,
  },
  rolesDisponiblesSection: {
    marginBottom: 12,
  },
  roleOptionsContainer: {
    gap: 10,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  allRolesAssigned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  allRolesText: {
    fontSize: 13,
    color: "#15803d",
    fontWeight: "500",
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmModal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  confirmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  confirmIconDanger: {
    backgroundColor: "#fef2f2",
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  confirmRolText: {
    fontWeight: "700",
    color: "#8b5cf6",
  },
  confirmUserText: {
    fontWeight: "700",
    color: "#1f2937",
  },
  confirmWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  confirmWarningText: {
    fontSize: 13,
    color: "#92400e",
    fontWeight: "500",
    flex: 1,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 8,
  },
  confirmButtonCancel: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  confirmButtonCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  confirmButtonConfirm: {
    backgroundColor: "#10b981",
  },
  confirmButtonConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  confirmButtonDanger: {
    backgroundColor: "#ef4444",
  },
  confirmButtonDangerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  adultoResponsableCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  adultoResponsableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adultoResponsableIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  adultoResponsableInfo: {
    flex: 1,
  },
  adultoResponsableTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 2,
  },
  adultoResponsableName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#78350f",
  },
});
