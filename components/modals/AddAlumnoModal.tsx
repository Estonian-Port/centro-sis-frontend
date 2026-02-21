import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Curso, Usuario, TipoPago, NuevaInscripcion } from "@/model/model";
import { usuarioService } from "@/services/usuario.service";
import { inscripcionService } from "@/services/inscripcion.service";
import Toast from "react-native-toast-message";
import { Button } from "../ui/Button";
import { getErrorMessage } from "@/helper/auth.interceptor";

interface AddAlumnoModalProps {
  visible: boolean;
  onClose: () => void;
  curso: Curso;
  onSuccess: () => void;
}

export const AddAlumnoModal: React.FC<AddAlumnoModalProps> = ({
  visible,
  onClose,
  curso,
  onSuccess,
}) => {
  // Estados de búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados de selección
  const [selectedAlumno, setSelectedAlumno] = useState<Usuario | null>(null);
  const [selectedTipoPago, setSelectedTipoPago] = useState<TipoPago | null>(
    null
  );
  const [beneficio, setBeneficio] = useState("");

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce para búsqueda
  useEffect(() => {
    if (!visible) return;

    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, visible]);

  // Limpiar al abrir/cerrar
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedAlumno(null);
    setSelectedTipoPago(null);
    setBeneficio("");
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // Llamar al endpoint de búsqueda que ya filtra en el backend
      const alumnos = await usuarioService.searchByRol(query, "ALUMNO", curso.id);

      setSearchResults(alumnos);
    } catch (error) {
      console.error("Error al buscar alumnos:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudieron cargar los alumnos",
        position: "bottom",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAlumno = (alumno: Usuario) => {
    setSelectedAlumno(alumno);
    setSearchQuery(`${alumno.nombre} ${alumno.apellido}`);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!selectedAlumno) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes seleccionar un alumno",
        position: "bottom",
      });
      return;
    }

    if (!selectedTipoPago) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes seleccionar un tipo de pago",
        position: "bottom",
      });
      return;
    }

    // Validar beneficio
    const beneficioNum = beneficio ? parseFloat(beneficio) : 0;
    if (beneficioNum < 0 || beneficioNum > 100) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El beneficio debe estar entre 0 y 100",
        position: "bottom",
      });
      return;
    }

    setIsSubmitting(true);

    const inscripcion: NuevaInscripcion = {
      tipoPagoSeleccionado: selectedTipoPago.tipo,
      beneficio: beneficioNum,
    };

    try {
      await inscripcionService.inscribirAlumno(
        curso.id,
        selectedAlumno.id,
        inscripcion
      );

      Toast.show({
        type: "success",
        text1: "¡Inscripción exitosa!",
        text2: `${selectedAlumno.nombre} ${selectedAlumno.apellido} fue inscripto al curso`,
        position: "bottom",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al inscribir alumno:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(error) || "No se pudo inscribir al alumno",
        position: "bottom",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="person-add" size={24} color="#3b82f6" />
              <View>
                <Text style={styles.title}>Inscribir Alumno</Text>
                <Text style={styles.subtitle}>{curso.nombre}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Búsqueda de Alumno */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Buscar Alumno</Text>

              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#6b7280"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="words"
                />
                {isSearching && (
                  <ActivityIndicator
                    size="small"
                    color="#3b82f6"
                    style={styles.searchLoader}
                  />
                )}
              </View>

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <View style={styles.resultsContainer}>
                  <Text style={styles.resultsTitle}>
                    {searchResults.length} resultado
                    {searchResults.length !== 1 ? "s" : ""}
                  </Text>
                  {searchResults.map((alumno) => (
                    <TouchableOpacity
                      key={alumno.id}
                      style={styles.resultItem}
                      onPress={() => handleSelectAlumno(alumno)}
                    >
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>
                          {alumno.nombre} {alumno.apellido}
                        </Text>
                        <Text style={styles.resultDni}>DNI: {alumno.dni}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Alumno seleccionado */}
              {selectedAlumno && searchResults.length === 0 && (
                <View style={styles.selectedAlumnoCard}>
                  <View style={styles.selectedAlumnoHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10b981"
                    />
                    <Text style={styles.selectedAlumnoTitle}>
                      Alumno seleccionado
                    </Text>
                  </View>
                  <View style={styles.selectedAlumnoInfo}>
                    <Text style={styles.selectedAlumnoName}>
                      {selectedAlumno.nombre} {selectedAlumno.apellido}
                    </Text>
                    <Text style={styles.selectedAlumnoDni}>
                      DNI: {selectedAlumno.dni}
                    </Text>
                    <Text style={styles.selectedAlumnoEmail}>
                      {selectedAlumno.email}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={() => {
                      setSelectedAlumno(null);
                      setSearchQuery("");
                    }}
                  >
                    <Text style={styles.changeButtonText}>Cambiar alumno</Text>
                  </TouchableOpacity>
                </View>
              )}

              {searchQuery.length >= 2 &&
                searchResults.length === 0 &&
                selectedAlumno == null && (
                  <View style={styles.emptyState}>
                    {isSearching ? (
                      <>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.emptyStateText}>
                          Buscando alumnos...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="search" size={48} color="#d1d5db" />
                        <Text style={styles.emptyStateText}>
                          No se encontraron alumnos
                        </Text>
                      </>
                    )}
                  </View>
                )}

              {searchQuery.length === 0 && !selectedAlumno && (
                <View style={styles.helpText}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.helpTextLabel}>
                    Ingresa al menos 2 caracteres para buscar
                  </Text>
                </View>
              )}
            </View>

            {/* Tipo de Pago */}
            {selectedAlumno && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Tipo de Pago</Text>

                {curso.tiposPago && curso.tiposPago.length > 0 ? (
                  <View style={styles.tiposPagoContainer}>
                    {curso.tiposPago.map((tipoPago) => (
                      <TouchableOpacity
                        key={tipoPago.tipo}
                        style={[
                          styles.tipoPagoOption,
                          selectedTipoPago?.tipo === tipoPago.tipo &&
                            styles.tipoPagoOptionSelected,
                        ]}
                        onPress={() => setSelectedTipoPago(tipoPago)}
                      >
                        <View style={styles.tipoPagoRadio}>
                          {selectedTipoPago?.tipo === tipoPago.tipo ? (
                            <View style={styles.tipoPagoRadioSelected} />
                          ) : null}
                        </View>
                        <View style={styles.tipoPagoInfo}>
                          <Text style={styles.tipoPagoTipo}>
                            {tipoPago.tipo}
                          </Text>
                          <Text style={styles.tipoPagoMonto}>
                            ${tipoPago.monto.toLocaleString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noTiposPagoText}>
                    Este curso no tiene tipos de pago configurados
                  </Text>
                )}
              </View>
            )}

            {/* Beneficio (Descuento) */}
            {selectedAlumno && selectedTipoPago && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Beneficio (Opcional)</Text>
                <Text style={styles.sectionDescription}>
                  Porcentaje de descuento a aplicar (0-100)
                </Text>

                <View style={styles.beneficioContainer}>
                  <TextInput
                    style={styles.beneficioInput}
                    placeholder="0"
                    value={beneficio}
                    onChangeText={setBeneficio}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.beneficioSymbol}>%</Text>
                </View>

                {/* Cálculo del monto final */}
                {beneficio && parseFloat(beneficio) > 0 && (
                  <View style={styles.calculoContainer}>
                    <View style={styles.calculoRow}>
                      <Text style={styles.calculoLabel}>Monto original:</Text>
                      <Text style={styles.calculoValue}>
                        ${selectedTipoPago.monto.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.calculoRow}>
                      <Text style={styles.calculoLabel}>
                        Descuento ({beneficio}%):
                      </Text>
                      <Text
                        style={[styles.calculoValue, styles.calculoDescuento]}
                      >
                        -$
                        {(
                          (selectedTipoPago.monto * parseFloat(beneficio)) /
                          100
                        ).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.calculoRow, styles.calculoTotal]}>
                      <Text style={styles.calculoLabelTotal}>Monto final:</Text>
                      <Text style={styles.calculoValueTotal}>
                        $
                        {(
                          selectedTipoPago.monto *
                          (1 - parseFloat(beneficio) / 100)
                        ).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
              disabled={isSubmitting}
            />
            <Button
              title={isSubmitting ? "Inscribiendo..." : "Inscribir Alumno"}
              variant="primary"
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={isSubmitting || !selectedAlumno || !selectedTipoPago}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    maxWidth: 600,
    height: 500,
    ...Platform.select({
      web: {
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1f2937",
  },
  searchLoader: {
    marginLeft: 8,
  },
  resultsContainer: {
    marginTop: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxHeight: 240,
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 2,
  },
  resultDni: {
    fontSize: 12,
    color: "#6b7280",
  },
  selectedAlumnoCard: {
    marginTop: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86efac",
    padding: 16,
  },
  selectedAlumnoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  selectedAlumnoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#16a34a",
  },
  selectedAlumnoInfo: {
    marginBottom: 12,
  },
  selectedAlumnoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  selectedAlumnoDni: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  selectedAlumnoEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  changeButton: {
    alignSelf: "flex-start",
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 12,
  },
  helpText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
  },
  helpTextLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  tiposPagoContainer: {
    gap: 12,
  },
  tipoPagoOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  tipoPagoOptionSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  tipoPagoRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipoPagoRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
  },
  tipoPagoInfo: {
    flex: 1,
  },
  tipoPagoTipo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  tipoPagoMonto: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  noTiposPagoText: {
    fontSize: 14,
    color: "#ef4444",
    fontStyle: "italic",
  },
  beneficioContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  beneficioInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1f2937",
  },
  beneficioSymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 8,
  },
  calculoContainer: {
    marginTop: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 16,
  },
  calculoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calculoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  calculoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  calculoDescuento: {
    color: "#ef4444",
  },
  calculoTotal: {
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#bfdbfe",
    marginBottom: 0,
  },
  calculoLabelTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  calculoValueTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
