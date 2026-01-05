import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../ui/Button";

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  title: string;
  selectedTime?: string;
}

// Generar horas de 00 a 23
const generateHours = (): string[] => {
  return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
};

// Minutos en intervalos de 15
const MINUTES = ["00", "15", "30", "45"];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  title,
  selectedTime,
}) => {
  const [selectedHour, setSelectedHour] = useState<string>("14");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [showHourPicker, setShowHourPicker] = useState(false);

  const hours = generateHours();

  useEffect(() => {
    if (visible && selectedTime) {
      const [hour, minute] = selectedTime.split(":");
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [visible, selectedTime]);

  const handleConfirm = () => {
    onSelect(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  const toggleMinute = () => {
    const currentIndex = MINUTES.indexOf(selectedMinute);
    const nextIndex = (currentIndex + 1) % MINUTES.length;
    setSelectedMinute(MINUTES[nextIndex]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
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
            <Text style={styles.label}>Seleccionar Hora</Text>

            <View style={styles.timeDisplay}>
              {/* Selector de Hora */}
              <TouchableOpacity
                style={styles.timeSegment}
                onPress={() => setShowHourPicker(!showHourPicker)}
              >
                <Text style={styles.timeText}>{selectedHour}</Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="#6b7280"
                  style={[styles.chevron, showHourPicker && styles.chevronUp]}
                />
              </TouchableOpacity>

              <Text style={styles.timeSeparator}>:</Text>

              {/* Selector de Minutos */}
              <TouchableOpacity
                style={styles.timeSegment}
                onPress={toggleMinute}
              >
                <Text style={styles.timeText}>{selectedMinute}</Text>
                <Ionicons name="swap-vertical" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Picker de Horas expandible */}
            {showHourPicker && (
              <View style={styles.hourPickerContainer}>
                <ScrollView
                  style={styles.hourPicker}
                  showsVerticalScrollIndicator={true}
                >
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.hourOption,
                        selectedHour === hour && styles.hourOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedHour(hour);
                        setShowHourPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.hourText,
                          selectedHour === hour && styles.hourTextSelected,
                        ]}
                      >
                        {hour}
                      </Text>
                      {selectedHour === hour && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#3b82f6"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.hint}>
              Toca la hora para cambiarla. Toca los minutos para ciclar entre
              :00, :15, :30 y :45
            </Text>
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "center",
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  timeSegment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 90,
    justifyContent: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#1f2937",
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: "600",
    color: "#9ca3af",
    marginHorizontal: 8,
  },
  chevron: {
    // Rotación se maneja con transform
  },
  chevronUp: {
    transform: [{ rotate: "180deg" }],
  },
  hourPickerContainer: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  hourPicker: {
    maxHeight: 200,
    backgroundColor: "#ffffff",
  },
  hourOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  hourOptionSelected: {
    backgroundColor: "#eff6ff",
  },
  hourText: {
    fontSize: 16,
    color: "#374151",
  },
  hourTextSelected: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
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
