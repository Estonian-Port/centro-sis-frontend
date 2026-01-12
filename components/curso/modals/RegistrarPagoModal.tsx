// components/modals/RegistrarPagoModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Usuario, PagoType, TipoPago, Alumno, Curso } from "@/model/model";

interface RegistrarPagoModalProps {
  visible: boolean;
  onClose: () => void;
  alumno: Alumno;
  curso: string;
  tipoPago: TipoPago;
  beneficio: number;
  onRegistrar: (data: {
    fecha: string;
    aplicarRecargo: boolean;
    medioPago: string;
  }) => Promise<void>;
  recargoPorAtraso: number;
}

export const RegistrarPagoModal: React.FC<RegistrarPagoModalProps> = ({
  visible,
  onClose,
  alumno,
  curso,
  tipoPago,
  beneficio,
  onRegistrar,
    recargoPorAtraso,
}) => {
  const [fecha, setFecha] = useState("");
  const [medioPago, setMedioPago] = useState<string | null>(null);
  const [aplicarRecargo, setAplicarRecargo] = useState(true);
  const [loading, setLoading] = useState(false);

  // Calcular si hay retraso y si aplica recargo
  const esPagoMensual = tipoPago.tipo === PagoType.MENSUAL;
  const fechaActual = new Date();
  const fechaPago = fecha ? new Date(fecha) : fechaActual;
  const diaDelMes = fechaPago.getDate();
  const hayRetraso = esPagoMensual && diaDelMes > 10;

  useEffect(() => {
    if (visible) {
      // Setear fecha actual
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, "0");
      const day = String(hoy.getDate()).padStart(2, "0");
      setFecha(`${year}-${month}-${day}`);
      setMedioPago(null);
      setAplicarRecargo(true);
    }
  }, [visible]);

  // Calcular montos
  const montoBase = tipoPago.monto;
  const descuento = (montoBase * beneficio) / 100;
  const montoConDescuento = montoBase - descuento;
  const recargo = hayRetraso && aplicarRecargo 
    ? (montoConDescuento * recargoPorAtraso) / 100 
    : 0;
  const montoFinal = montoConDescuento + recargo;

  const handleRegistrar = async () => {
    if (!fecha) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Selecciona una fecha de pago",
        position: "bottom",
      });
      return;
    }

    if (!medioPago) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Selecciona un medio de pago",
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      await onRegistrar({
        fecha,
        aplicarRecargo: hayRetraso && aplicarRecargo,
        medioPago,
      });
      Toast.show({
        type: "success",
        text1: "Pago registrado",
        text2: `Pago de $${montoFinal.toLocaleString("es-AR")} registrado`,
        position: "bottom",
      });
      onClose();
    } catch (error) {
      console.error("Error registrando pago:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo registrar el pago",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFecha("");
    setMedioPago(null);
    setAplicarRecargo(true);
    onClose();
  };

  const mediosPago = [
    { id: "efectivo", label: "Efectivo", icon: "cash" },
    { id: "transferencia", label: "Transferencia", icon: "swap-horizontal" },
    { id: "tarjeta", label: "Tarjeta", icon: "card" },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="card" size={24} color="#10b981" />
              </View>
              <Text style={styles.title}>Registrar Pago</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Info del alumno y curso */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={18} color="#6b7280" />
                <Text style={styles.infoText}>
                  {alumno.nombre} {alumno.apellido}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="school" size={18} color="#6b7280" />
                <Text style={styles.infoText}>{curso}</Text>
              </View>
            </View>

            {/* Tipo de pago (informativo) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de pago seleccionado</Text>
              <View style={styles.tipoPagoCard}>
                <Text style={styles.tipoPagoLabel}>
                  {tipoPago.tipo === PagoType.MENSUAL
                    ? "Pago Mensual"
                    : "Pago Total"}
                </Text>
                <Text style={styles.tipoPagoMonto}>
                  ${montoBase.toLocaleString("es-AR")}
                </Text>
              </View>
            </View>

            {/* Fecha de pago */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fecha de pago</Text>
              <TextInput
                style={styles.dateInput}
                value={fecha}
                onChangeText={setFecha}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Advertencia de recargo */}
            {esPagoMensual && (
              <View style={styles.recargoSection}>
                <View
                  style={[
                    styles.recargoInfo,
                    hayRetraso ? styles.recargoWarning : styles.recargoOk,
                  ]}
                >
                  <Ionicons
                    name={hayRetraso ? "alert-circle" : "checkmark-circle"}
                    size={20}
                    color={hayRetraso ? "#f59e0b" : "#10b981"}
                  />
                  <Text
                    style={[
                      styles.recargoText,
                      hayRetraso ? styles.recargoTextWarning : null,
                    ]}
                  >
                    {hayRetraso
                      ? `Pago fuera de fecha (después del día 10). Se aplicará ${recargoPorAtraso}% de recargo.`
                      : "Pago dentro del plazo. Sin recargo."}
                  </Text>
                </View>

                {/* Checkbox para omitir recargo */}
                {hayRetraso && (
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAplicarRecargo(!aplicarRecargo)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        !aplicarRecargo && styles.checkboxChecked,
                      ]}
                    >
                      {!aplicarRecargo && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      No aplicar recargo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Medio de pago */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medio de pago</Text>
              <View style={styles.mediosPagoContainer}>
                {mediosPago.map((medio) => (
                  <TouchableOpacity
                    key={medio.id}
                    style={[
                      styles.medioPagoButton,
                      medioPago === medio.id && styles.medioPagoButtonActive,
                    ]}
                    onPress={() => setMedioPago(medio.id)}
                  >
                    <Ionicons
                      name={medio.icon as any}
                      size={24}
                      color={
                        medioPago === medio.id ? "#10b981" : "#6b7280"
                      }
                    />
                    <Text
                      style={[
                        styles.medioPagoLabel,
                        medioPago === medio.id && styles.medioPagoLabelActive,
                      ]}
                    >
                      {medio.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Resumen del pago */}
            <View style={styles.resumen}>
              <Text style={styles.resumenTitle}>Resumen del pago</Text>
              
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Monto base:</Text>
                <Text style={styles.resumenValue}>
                  ${montoBase.toLocaleString("es-AR")}
                </Text>
              </View>

              {beneficio > 0 && (
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>
                    Descuento ({beneficio}%):
                  </Text>
                  <Text style={[styles.resumenValue, styles.descuentoText]}>
                    -${descuento.toLocaleString("es-AR")}
                  </Text>
                </View>
              )}

              {recargo > 0 && (
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>
                    Recargo ({recargoPorAtraso}%):
                  </Text>
                  <Text style={[styles.resumenValue, styles.recargoText]}>
                    +${recargo.toLocaleString("es-AR")}
                  </Text>
                </View>
              )}

              <View style={[styles.resumenRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total a pagar:</Text>
                <Text style={styles.totalValue}>
                  ${montoFinal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleRegistrar}
                disabled={loading || !fecha || !medioPago}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Registrar Pago</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  infoSection: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  tipoPagoCard: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  tipoPagoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  tipoPagoMonto: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  recargoSection: {
    marginBottom: 20,
  },
  recargoInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  recargoOk: {
    backgroundColor: "#d1fae5",
  },
  recargoWarning: {
    backgroundColor: "#fef3c7",
  },
  recargoText: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
    lineHeight: 18,
  },
  recargoTextWarning: {
    color: "#92400e",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
  },
  mediosPagoContainer: {
    flexDirection: "row",
    gap: 12,
  },
  medioPagoButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  medioPagoButtonActive: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  medioPagoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  medioPagoLabelActive: {
    color: "#10b981",
  },
  resumen: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  resumenTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resumenLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  resumenValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  descuentoText: {
    color: "#f59e0b",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#bbf7d0",
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10b981",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  confirmButton: {
    backgroundColor: "#10b981",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});