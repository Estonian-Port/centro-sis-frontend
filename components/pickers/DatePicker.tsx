// components/pickers/DatePicker.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DatePickerProps {
  label?: string;
  value: string; // Formato: "YYYY-MM-DD"
  onChange: (date: string) => void;
  error?: string;
  maximumDate?: Date;
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const DatePicker: React.FC<DatePickerProps> = ({
  label = "Fecha de Nacimiento",
  value,
  onChange,
  error,
  maximumDate = new Date(),
}) => {
  const [dia, setDia] = useState<number | null>(null);
  const [mes, setMes] = useState<number | null>(null);
  const [anio, setAnio] = useState<number | null>(null);

  const [showPicker, setShowPicker] = useState<
    "dia" | "mes" | "anio" | null
  >(null);

  // Parsear fecha inicial
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      setDia(d);
      setMes(m);
      setAnio(y);
    }
  }, [value]);

  // Actualizar cuando cambie algún valor
  useEffect(() => {
    if (dia && mes && anio) {
      const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(
        dia
      ).padStart(2, "0")}`;
      onChange(fecha);
    }
  }, [dia, mes, anio]);

  // Generar array de días según el mes/año
  const getDiasDelMes = () => {
    if (!mes || !anio) return Array.from({ length: 31 }, (_, i) => i + 1);

    const diasEnMes = new Date(anio, mes, 0).getDate();
    return Array.from({ length: diasEnMes }, (_, i) => i + 1);
  };

  // Generar array de años (desde 1900 hasta año actual)
  const getAnios = () => {
    const anioActual = maximumDate.getFullYear();
    const anios = [];
    for (let i = anioActual; i >= 1900; i--) {
      anios.push(i);
    }
    return anios;
  };

  const diasDisponibles = getDiasDelMes();
  const aniosDisponibles = getAnios();

  const handleSelect = (type: "dia" | "mes" | "anio", value: number) => {
    if (type === "dia") setDia(value);
    if (type === "mes") setMes(value);
    if (type === "anio") setAnio(value);
    setShowPicker(null);
  };

  const renderPickerModal = () => {
    if (!showPicker) return null;

    let items: Array<{ label: string; value: number }> = [];
    let selectedValue = 0;
    let title = "";

    switch (showPicker) {
      case "dia":
        items = diasDisponibles.map((d) => ({ label: String(d), value: d }));
        selectedValue = dia || 0;
        title = "Día";
        break;
      case "mes":
        items = MESES.map((m, i) => ({ label: m, value: i + 1 }));
        selectedValue = mes || 0;
        title = "Mes";
        break;
      case "anio":
        items = aniosDisponibles.map((a) => ({ label: String(a), value: a }));
        selectedValue = anio || 0;
        title = "Año";
        break;
    }

    return (
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(null)}
        >
          <View style={styles.pickerContainer}>
            {/* Header Compacto */}
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setShowPicker(null)}>
                <Ionicons name="close-circle" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Lista Compacta con Scroll */}
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={true}
            >
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.option,
                    item.value === selectedValue && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(showPicker!, item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedValue && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && <Text style={styles.label}>{label} *</Text>}

      {/* Inputs */}
      <View style={styles.inputsRow}>
        {/* Día */}
        <TouchableOpacity
          style={[styles.input, styles.inputSmall, error && styles.inputError]}
          onPress={() => setShowPicker("dia")}
          activeOpacity={0.7}
        >
          <Text style={[styles.inputText, !dia && styles.placeholder]}>
            {dia || "DD"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#9ca3af" />
        </TouchableOpacity>

        {/* Mes */}
        <TouchableOpacity
          style={[styles.input, styles.inputMedium, error && styles.inputError]}
          onPress={() => setShowPicker("mes")}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.inputText, !mes && styles.placeholder]}
            numberOfLines={1}
          >
            {mes ? MESES[mes - 1] : "Mes"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#9ca3af" />
        </TouchableOpacity>

        {/* Año */}
        <TouchableOpacity
          style={[styles.input, styles.inputMedium, error && styles.inputError]}
          onPress={() => setShowPicker("anio")}
          activeOpacity={0.7}
        >
          <Text style={[styles.inputText, !anio && styles.placeholder]}>
            {anio || "AAAA"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Picker Modal */}
      {renderPickerModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputsRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  inputSmall: {
    flex: 1,
  },
  inputMedium: {
    flex: 2,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  inputText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  placeholder: {
    color: "#9ca3af",
    fontWeight: "400",
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 4,
  },

  // Modal Compacto
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 400, // ← Altura máxima compacta
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
  },
  scrollView: {
    maxHeight: 350, // ← Scroll compacto
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14, // ← Reducido de 16 a 14
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionSelected: {
    backgroundColor: "#eff6ff",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  optionTextSelected: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});