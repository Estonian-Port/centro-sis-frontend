import { EditarHorariosModal } from "@/components/curso/modals/EditarHorariosModal";
import { EditarModalidadesPagoModal } from "@/components/curso/modals/EditarModalidadPagoModal";
import { EditarNombreCursoModal } from "@/components/curso/modals/EditarNombreCursoModal";
import { EditarProfesoresModal } from "@/components/curso/modals/EditarProfesoresModal";
import { formatDateToDDMMYYYY, formatEstadoCurso, pagoToDisplay } from "@/helper/funciones";
import { Pago } from "@/model/model";
import { cursoService } from "@/services/curso.service";
import { usuarioService } from "@/services/usuario.service";
import { useCurso } from "@/context/cursoContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/authContext";
import { pagoService } from "@/services/pago.service";
import { useEffect } from "react";

export default function InformacionTab() {
  const { cursoId } = useLocalSearchParams();
  const { selectedRole } = useAuth();
  const { curso, fetchCurso } = useCurso();
  const [showEditarNombreModal, setShowEditarNombreModal] = useState(false);
  const [showEditarProfesoresModal, setShowEditarProfesoresModal] =
    useState(false);
  const [showEditarHorariosModal, setShowEditarHorariosModal] = useState(false);
  const [showEditarModalidadesModal, setShowEditarModalidadesModal] =
    useState(false);
  const [pagosCurso, setPagosCurso] = useState<Pago[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Agregar este useEffect para cargar pagos
  useEffect(() => {
    if (curso && cursoId) {
      loadPagos();
    }
  }, [curso, cursoId]);

  // Cargar todos los pagos
  const loadPagos = async () => {
    setLoadingPagos(true);
    try {
      const pagos = await pagoService.getPagosPorCurso(Number(cursoId));
      setPagosCurso(pagos);
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setLoadingPagos(false);
    }
  };

  const evaluarPorRol =
    (curso?.tipoCurso === "COMISION" &&
      selectedRole !== null &&
      (selectedRole === "ADMINISTRADOR" || selectedRole === "OFICINA")) ||
    (curso?.tipoCurso === "ALQUILER" &&
      selectedRole !== null &&
      (selectedRole === "ADMINISTRADOR" || selectedRole === "PROFESOR"));

  const puedeEditar =
    (curso?.estado === "EN_CURSO" || curso?.estado === "POR_COMENZAR") &&
    curso?.estadoAlta === "ACTIVO" &&
    evaluarPorRol;

  if (!curso) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró el curso</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Información General */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>Información General</Text>
          {puedeEditar && (
            <TouchableOpacity onPress={() => setShowEditarNombreModal(true)}>
              <Ionicons name="pencil" size={20} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardContent}>
          <InfoRow label="Estado" value={formatEstadoCurso(curso.estado)} />
          <InfoRow
            label="Fecha Inicio"
            value={formatDateToDDMMYYYY(curso.fechaInicio)}
          />
          <InfoRow
            label="Fecha Fin"
            value={formatDateToDDMMYYYY(curso.fechaFin)}
          />
          <InfoRow
            label="Alumnos Inscriptos"
            value={`${curso.inscripciones?.length || 0}`}
          />
        </View>
      </View>

      {/* Profesores */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="school" size={24} color="#10b981" />
          <Text style={styles.cardTitle}>
            Profesores ({curso.profesores.length})
          </Text>
          {puedeEditar && (
            <TouchableOpacity
              onPress={() => setShowEditarProfesoresModal(true)}
            >
              <Ionicons name="pencil" size={20} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardContent}>
          {curso.profesores.map((profesor, index) => (
            <View
              key={index}
              style={[
                styles.listItem,
                index === curso.profesores.length - 1 && styles.listItemLast,
              ]}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color="#3b82f6"
              />
              <Text style={styles.listItemText}>
                {profesor.nombre} {profesor.apellido}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Horarios */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={24} color="#8b5cf6" />
          <Text style={styles.cardTitle}>
            Horarios ({curso.horarios.length})
          </Text>
          {puedeEditar && (
            <TouchableOpacity onPress={() => setShowEditarHorariosModal(true)}>
              <Ionicons name="pencil" size={20} color="#8b5cf6" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardContent}>
          {curso.horarios.map((horario, index) => (
            <View
              key={index}
              style={[
                styles.horarioItem,
                index === curso.horarios.length - 1 && styles.listItemLast,
              ]}
            >
              <View style={styles.horarioDia}>
                <Ionicons name="calendar-outline" size={18} color="#10b981" />
                <Text style={styles.horarioDiaText}>{horario.dia}</Text>
              </View>
              <View style={styles.horarioHoras}>
                <Ionicons name="time-outline" size={18} color="#6b7280" />
                <Text style={styles.horarioHorasText}>
                  {horario.horaInicio} - {horario.horaFin}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Tipos de Pago */}
      {curso.tiposPago && curso.tiposPago.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash" size={24} color="#f59e0b" />
            <Text style={styles.cardTitle}>
              Modalidades de Pago ({curso.tiposPago.length})
            </Text>
            {puedeEditar && (
              <TouchableOpacity
                onPress={() => setShowEditarModalidadesModal(true)}
              >
                <Ionicons name="pencil" size={20} color="#f59e0b" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.cardContent}>
            {curso.tiposPago.map((tipoPago, index) => (
              <View
                key={index}
                style={[
                  styles.tipoPagoItem,
                  index === curso.tiposPago!.length - 1 && styles.listItemLast,
                ]}
              >
                <View style={styles.tipoPagoInfo}>
                  <Ionicons name="cash-outline" size={18} color="#f59e0b" />
                  <Text style={styles.tipoPagoTipo}>
                    {tipoPago.tipo}{" "}
                    {tipoPago.tipo === "MENSUAL"
                      ? `- ${tipoPago.cuotas} cuotas`
                      : ""}
                  </Text>
                </View>
                <Text style={styles.tipoPagoMonto}>
                  ${tipoPago.monto.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Pagos del Curso */}
      {(curso.tipoCurso === "ALQUILER" || curso.tipoCurso === "COMISION") && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="wallet"
              size={24}
              color={curso.tipoCurso === "ALQUILER" ? "#3b82f6" : "#10b981"}
            />
            <Text style={styles.cardTitle}>
              {curso.tipoCurso === "ALQUILER"
                ? "Pagos de Alquiler"
                : "Pagos de Comisión"}
            </Text>
            {pagosCurso.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pagosCurso.length}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            {loadingPagos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.loadingText}>Cargando pagos...</Text>
              </View>
            ) : pagosCurso.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  No hay pagos registrados aún
                </Text>
              </View>
            ) : (
              <>
                {/* Mostrar últimos 5 o todos si son menos */}
                {pagosCurso
                  .slice(0, mostrarTodos ? pagosCurso.length : 5)
                  .map((pago, index, array) => {
                    const pagoDisplay = pagoToDisplay(pago);
                    return (
                      <View
                        key={pago.id}
                        style={[
                          styles.pagoItem,
                          index === array.length - 1 &&
                            (mostrarTodos || pagosCurso.length <= 5) &&
                            styles.listItemLast,
                        ]}
                      >
                        <View style={styles.pagoInfo}>
                          <View style={styles.pagoHeader}>
                            <Ionicons
                              name="calendar-outline"
                              size={16}
                              color="#6b7280"
                            />
                            <Text style={styles.pagoFecha}>
                              {formatDateToDDMMYYYY(pago.fecha)}
                            </Text>
                          </View>
                          <Text style={styles.pagoDescripcion}>
                            {curso.tipoCurso === "ALQUILER"
                              ? `${pagoDisplay.usuarioPago} → Instituto`
                              : `Instituto → ${pagoDisplay.usuarioRecibe}`}
                          </Text>
                        </View>
                        <View style={styles.pagoMonto}>
                          <Text
                            style={[
                              styles.pagoMontoText,
                              {
                                color:
                                  curso.tipoCurso === "ALQUILER"
                                    ? "#3b82f6"
                                    : "#10b981",
                              },
                            ]}
                          >
                            ${pago.monto.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                {/* Botón Expandir/Contraer (solo si hay más de 5) */}
                {pagosCurso.length > 5 && (
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setMostrarTodos(!mostrarTodos)}
                  >
                    <Text style={styles.expandText}>
                      {mostrarTodos
                        ? "Mostrar menos"
                        : `Ver ${pagosCurso.length - 5} más`}
                    </Text>
                    <Ionicons
                      name={mostrarTodos ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#3b82f6"
                    />
                  </TouchableOpacity>
                )}

                {/* Resumen total */}
                <View style={styles.resumenTotal}>
                  <Text style={styles.resumenLabel}>
                    Total{" "}
                    {curso.tipoCurso === "ALQUILER" ? "pagado" : "liquidado"}:
                  </Text>
                  <Text
                    style={[
                      styles.resumenMonto,
                      {
                        color:
                          curso.tipoCurso === "ALQUILER"
                            ? "#3b82f6"
                            : "#10b981",
                      },
                    ]}
                  >
                    $
                    {pagosCurso
                      .reduce((sum, p) => sum + p.monto, 0)
                      .toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      <EditarNombreCursoModal
        visible={showEditarNombreModal}
        onClose={() => setShowEditarNombreModal(false)}
        nombreActual={curso.nombre}
        onGuardar={async (nombre) => {
          await cursoService.updateNombre(Number(cursoId), nombre);
          await fetchCurso(false);
        }}
      />

      <EditarProfesoresModal
        visible={showEditarProfesoresModal}
        onClose={() => setShowEditarProfesoresModal(false)}
        profesoresActuales={curso.profesores}
        onGuardar={async (ids) => {
          await cursoService.updateProfesores(Number(cursoId), ids);
          await fetchCurso(false);
        }}
        onBuscarProfesores={async (query) => {
          return await usuarioService.searchByRol(query, "PROFESOR");
        }}
      />

      <EditarHorariosModal
        visible={showEditarHorariosModal}
        onClose={() => setShowEditarHorariosModal(false)}
        horariosActuales={curso.horarios}
        onGuardar={async (horarios) => {
          await cursoService.updateHorarios(Number(cursoId), horarios);
          await fetchCurso(false);
        }}
      />

      <EditarModalidadesPagoModal
        visible={showEditarModalidadesModal}
        onClose={() => setShowEditarModalidadesModal(false)}
        modalidadesActuales={curso.tiposPago}
        onGuardar={async (modalidades) => {
          await cursoService.updateModalidadesPago(
            Number(cursoId),
            modalidades,
          );
          await fetchCurso(false);
        }}
      />
    </ScrollView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  cardContent: {
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  horarioItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  horarioDia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  horarioDiaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  horarioHoras: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  horarioHorasText: {
    fontSize: 14,
    color: "#6b7280",
  },
  tipoPagoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tipoPagoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipoPagoTipo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  tipoPagoMonto: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  badge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: "auto",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e40af",
  },
  pagoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pagoInfo: {
    flex: 1,
    gap: 4,
  },
  pagoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pagoFecha: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  pagoDescripcion: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  pagoMonto: {
    marginLeft: 12,
  },
  pagoMontoText: {
    fontSize: 16,
    fontWeight: "700",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
  },
  expandText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  resumenTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
  },
  resumenLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  resumenMonto: {
    fontSize: 18,
    fontWeight: "700",
  },
});
