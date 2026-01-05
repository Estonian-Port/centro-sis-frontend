import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../ui/Button";

interface DatePickerWrapperProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  title: string;
  initialDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({
  visible,
  onClose,
  onSelect,
  title,
  initialDate = new Date(),
  minimumDate,
  maximumDate,
}) => {
  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible) {
      setTempDate(initialDate);
      // En web, abrir el picker nativo directamente
      if (Platform.OS === "web" && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.showPicker?.();
        }, 100);
      }
    }
  }, [visible, initialDate]);

  const handleConfirm = () => {
    onSelect(tempDate);
    onClose();
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      onClose();
      if (event.type === "set" && selectedDate) {
        onSelect(selectedDate);
      }
    } else if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  // Android: mostrar picker nativo
  if (Platform.OS === "android") {
    return visible ? (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="default"
        onChange={handleChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    ) : null;
  }

  // Web: usar input type="date" nativo SIN modal wrapper
  if (Platform.OS === "web") {
    const formatDateForInput = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formatMinDate = minimumDate
      ? formatDateForInput(minimumDate)
      : undefined;
    const formatMaxDate = maximumDate
      ? formatDateForInput(maximumDate)
      : undefined;

    if (!visible) return null;

    // Renderizar un input invisible que se abre automáticamente
    return (
      <>
        <input
          ref={inputRef as any}
          type="date"
          value={formatDateForInput(tempDate)}
          onChange={(e) => {
            const newDate = new Date(e.target.value + "T12:00:00");
            if (!isNaN(newDate.getTime())) {
              setTempDate(newDate);
              onSelect(newDate);
              onClose();
            }
          }}
          onBlur={() => {
            // Cerrar si el usuario cancela o hace click fuera
            setTimeout(() => onClose(), 100);
          }}
          min={formatMinDate}
          max={formatMaxDate}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "auto",
          }}
        />
      </>
    );
  }

  // iOS: usar picker nativo
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlayBottom}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={styles.picker}
            />
          </View>
          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={onClose}
              style={styles.button}
            />
            <Button
              title="Confirmar"
              onPress={handleConfirm}
              style={styles.button}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayWeb: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    width: "100%",
  },
  modalContentWeb: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 10000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  pickerContainer: {
    padding: 20,
    alignItems: "center",
  },
  pickerContainerWeb: {
    padding: 20,
  },
  picker: {
    width: "100%",
    height: 200,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
