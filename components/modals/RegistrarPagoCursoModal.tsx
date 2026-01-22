// components/modals/RegistrarPagoCursoModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import {
  Curso,
  PagoAlquilerPreview,
  PagoComisionPreview,
  TipoCurso,
} from "@/model/model";
import { Button } from "@/components/ui/Button";
import Toast from "react-native-toast-message";
import { pagoService } from "@/services/pago.service";

interface RegistrarPagoCursoModalProps {
  visible: boolean;
  onClose: () => void;
  curso: Curso;
  usuarioId: number;
  onPagoRegistrado?: () => void;
}

export const RegistrarPagoCursoModal: React.FC<
  RegistrarPagoCursoModalProps
> = ({ visible, onClose, curso, usuarioId, onPagoRegistrado }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para ALQUILER
  const [previewAlquiler, setPreviewAlquiler] =
    useState<PagoAlquilerPreview | null>(null);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<number | null>(
    null,
  );

  // Estados para COMISION
  const [previewComision, setPreviewComision] =
    useState<PagoComisionPreview | null>(null);

  const esAlquiler = curso.tipoCurso === TipoCurso.ALQUILER;

  const profesorId = curso.profesores.length > 0 ? curso.profesores[0].id : null;

  // ✅ Cargar preview al abrir modal
  useEffect(() => {
    if (visible) {
      loadPreview();
    } else {
      // Reset al cerrar
      setPreviewAlquiler(null);
      setPreviewComision(null);
      setCuotaSeleccionada(null);
      setError(null);
    }
  }, [visible]);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      if (esAlquiler) {
        console.log("Calculando preview alquiler...");

        const preview = await pagoService.calcularPreviewAlquiler(
          usuarioId,
          curso.id,
          curso.profesores[0].id || 0,
        );
        console.log("Preview alquiler:", preview);
        setPreviewAlquiler(preview);

        // Auto-seleccionar primera cuota pendiente
        if (preview.cuotasPendientes.length > 0) {
          setCuotaSeleccionada(preview.cuotasPendientes[0]);
        }
      } else {
        console.log("Calculando preview comisión...");
        if (!profesorId) {
          throw new Error("Profesor ID es requerido para comisión");
        }
        const preview = await pagoService.calcularPreviewComision(
          usuarioId,
          curso.id,
          profesorId,
        );
        setPreviewComision(preview);

        if (!preview.puedeRegistrar && preview.mensajeError) {
          setError(preview.mensajeError);
        }
      }
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || "No se pudo cargar la información";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPago = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (esAlquiler) {
        if (!cuotaSeleccionada || !previewAlquiler) {
          throw new Error("Selecciona una cuota");
        }

        await pagoService.registrarPagoAlquiler(curso.profesores[0].id, {
          cursoId: curso.id,
          numeroCuota: cuotaSeleccionada,
        });

        Toast.show({
          type: "success",
          text1: "Pago Registrado",
          text2: `Cuota ${cuotaSeleccionada}/${previewAlquiler.totalCuotas} - $${previewAlquiler.montoPorCuota.toLocaleString()}`,
          position: "bottom",
        });
      } else {
        if (!previewComision || !profesorId) {
          throw new Error("No se pudo calcular el período");
        }

        await pagoService.registrarPagoComision(usuarioId, {
          cursoId: curso.id,
          profesorId: profesorId,
        });

        const formatearFecha = (fecha: string) => {
          const [y, m, d] = fecha.split("-");
          return `${d}/${m}/${y}`;
        };

        Toast.show({
          type: "success",
          text1: "Comisión Registrada",
          text2: `${formatearFecha(previewComision.fechaInicio)} - ${formatearFecha(previewComision.fechaFin)}: $${previewComision.montoComision.toLocaleString()}`,
          position: "bottom",
        });
      }

      if (onPagoRegistrado) {
        onPagoRegistrado();
      }
      onClose();
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || "No se pudo registrar el pago";
      setError(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  const renderAlquilerContent = () => {
    if (!previewAlquiler) return null;

    return (
      <>
        {/* Información del Curso */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Curso:</Text>
            <Text style={styles.infoValue}>{previewAlquiler.cursoNombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Profesores:</Text>
            <Text style={styles.infoValue}>
              {previewAlquiler.profesores.join(", ")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monto por cuota:</Text>
            <Text style={[styles.infoValue, styles.montoDestacado]}>
              ${previewAlquiler.montoPorCuota.toLocaleString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cuotas pagadas:</Text>
            <Text style={styles.infoValue}>
              {previewAlquiler.cuotasPagadas.length} /{" "}
              {previewAlquiler.totalCuotas}
            </Text>
          </View>
        </View>

        {/* Selector de Cuotas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar Cuota a Registrar</Text>
          <ScrollView
            style={styles.cuotasGrid}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cuotasContainer}>
              {previewAlquiler.cuotasPendientes.map((numCuota) => (
                <TouchableOpacity
                  key={numCuota}
                  style={[
                    styles.cuotaChip,
                    cuotaSeleccionada === numCuota && styles.cuotaChipSelected,
                  ]}
                  onPress={() => {
                    setCuotaSeleccionada(numCuota);
                    setError(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cuotaChipText,
                      cuotaSeleccionada === numCuota &&
                        styles.cuotaChipTextSelected,
                    ]}
                  >
                    Cuota {numCuota}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Mostrar cuotas pagadas (deshabilitadas) */}
          {previewAlquiler.cuotasPagadas.length > 0 && (
            <View style={styles.cuotasPagadasInfo}>
              <Text style={styles.cuotasPagadasLabel}>
                Cuotas ya pagadas: {previewAlquiler.cuotasPagadas.join(", ")}
              </Text>
            </View>
          )}
        </View>

        {/* Resumen */}
        {cuotaSeleccionada && (
          <View style={styles.resumenContainer}>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Cuota seleccionada:</Text>
              <Text style={styles.resumenValue}>
                {cuotaSeleccionada} de {previewAlquiler.totalCuotas}
              </Text>
            </View>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Monto a pagar:</Text>
              <Text style={[styles.resumenValue, styles.resumenMonto]}>
                ${previewAlquiler.montoPorCuota.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </>
    );
  };

  const renderComisionContent = () => {
    if (!previewComision) return null;

    const formatearFecha = (fecha: string) => {
      const [y, m, d] = fecha.split("-");
      return `${d}/${m}/${y}`;
    };

    return (
      <>
        {/* Información del Curso */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Curso:</Text>
            <Text style={styles.infoValue}>{previewComision.cursoNombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Profesor:</Text>
            <Text style={styles.infoValue}>
              {previewComision.profesorNombre}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Comisión:</Text>
            <Text style={[styles.infoValue, styles.montoDestacado]}>
              {(previewComision.porcentajeComision * 100).toFixed(0)}% de lo
              recaudado
            </Text>
          </View>
        </View>

        {/* Información del Período */}
        <View style={styles.periodoSection}>
          <View style={styles.periodoHeader}>
            <Ionicons name="calendar" size={20} color="#10b981" />
            <Text style={styles.periodoTitle}>Período a Liquidar</Text>
          </View>
          <View style={styles.periodoContent}>
            <View style={styles.periodoRow}>
              <Text style={styles.periodoLabel}>Desde:</Text>
              <Text style={styles.periodoValue}>
                {formatearFecha(previewComision.fechaInicio)}
              </Text>
            </View>
            <View style={styles.periodoDivider} />
            <View style={styles.periodoRow}>
              <Text style={styles.periodoLabel}>Hasta:</Text>
              <Text style={styles.periodoValue}>
                {formatearFecha(previewComision.fechaFin)}
              </Text>
            </View>
            <View style={styles.periodoDivider} />
            <View style={styles.periodoRow}>
              <Text style={styles.periodoLabel}>Días:</Text>
              <Text style={styles.periodoValue}>
                {previewComision.diasPeriodo} días
              </Text>
            </View>
          </View>
        </View>

        {/* Resumen */}
        <View style={styles.resumenContainer}>
          <View style={styles.resumenHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.resumenTitle}>Resumen de Comisión</Text>
          </View>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Recaudación del período:</Text>
            <Text style={styles.resumenValue}>
              ${previewComision.recaudacionPeriodo.toLocaleString()}
            </Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>
              Comisión ({(previewComision.porcentajeComision * 100).toFixed(0)}
              %):
            </Text>
            <Text style={[styles.resumenValue, styles.resumenMonto]}>
              ${previewComision.montoComision.toLocaleString()}
            </Text>
          </View>
        </View>
      </>
    );
  };

  const puedeRegistrar = esAlquiler
    ? cuotaSeleccionada !== null && previewAlquiler?.puedeRegistrar
    : previewComision?.puedeRegistrar && !error;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons
                name="cash"
                size={28}
                color={esAlquiler ? "#3b82f6" : "#10b981"}
              />
              <View>
                <Text style={styles.title}>
                  {esAlquiler
                    ? "Registrar Pago de Alquiler"
                    : "Registrar Comisión"}
                </Text>
                <Text style={styles.subtitle}>
                  {esAlquiler ? "Profesor → Instituto" : "Instituto → Profesor"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Loading */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={esAlquiler ? "#3b82f6" : "#10b981"}
                />
                <Text style={styles.loadingText}>Calculando...</Text>
              </View>
            )}

            {/* Error */}
            {error && !loading && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Content */}
            {!loading && !error && (
              <>
                {esAlquiler ? renderAlquilerContent() : renderComisionContent()}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          {!loading && (
            <View style={styles.footer}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={styles.footerButton}
              />
              <Button
                title={submitting ? "Registrando..." : "Registrar Pago"}
                variant="primary"
                onPress={handleRegistrarPago}
                disabled={!puedeRegistrar || submitting}
                style={{
                  flex: 1,
                  backgroundColor: esAlquiler ? "#3b82f6" : "#10b981",
                }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
    lineHeight: 20,
  },
  cuotasPagadasInfo: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  cuotasPagadasLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  infoSection: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  montoDestacado: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "700",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  cuotasGrid: {
    maxHeight: 200,
  },
  cuotasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cuotaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    minWidth: 100,
  },
  cuotaChipSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#dbeafe",
  },
  cuotaChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  cuotaChipTextSelected: {
    color: "#1e40af",
  },
  periodoSection: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#86efac",
  },
  periodoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  periodoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
  },
  periodoContent: {
    gap: 8,
  },
  periodoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  periodoLabel: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "500",
  },
  periodoValue: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "700",
  },
  periodoDivider: {
    height: 1,
    backgroundColor: "#86efac",
  },
  resumenContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#86efac",
    gap: 12,
  },
  resumenHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  resumenTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
  },
  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resumenLabel: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "500",
  },
  resumenValue: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "600",
  },
  resumenDivider: {
    height: 1,
    backgroundColor: "#86efac",
    marginVertical: 4,
  },
  resumenMonto: {
    fontSize: 20,
    color: "#10b981",
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
