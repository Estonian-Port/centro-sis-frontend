// components/ui/MultiSelect.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface MultiSelectOption<T> {
  value: T;
  label: string;
  color?: string;
}

interface MultiSelectProps<T> {
  options: MultiSelectOption<T>[];
  selectedValues: T[];
  onToggle: (value: T) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function MultiSelect<T>({
  options,
  selectedValues,
  onToggle,
  placeholder = "Seleccionar...",
  style,
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabels = options
    .filter((opt) => selectedValues.includes(opt.value))
    .map((opt) => opt.label);

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
      ? selectedLabels[0]
      : `${selectedValues.length} seleccionados`;

  const handleClearAll = () => {
    selectedValues.forEach((value) => onToggle(value));
  };

  return (
    <View style={[styles.container, style]}>
      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerText,
            selectedValues.length === 0 && styles.triggerTextPlaceholder,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>

      {/* Selected Tags */}
      {selectedValues.length > 0 && (
        <View style={styles.tagsContainer}>
          {selectedLabels.map((label, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{label}</Text>
              <TouchableOpacity
                onPress={() => onToggle(selectedValues[index])}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Modal Dropdown */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdown}>
            {/* Header */}
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>
                {placeholder} ({selectedValues.length})
              </Text>
              <View style={styles.headerActions}>
                {selectedValues.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearAll}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>Limpiar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Options List */}
            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => onToggle(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      {option.color && (
                        <View
                          style={[
                            styles.colorIndicator,
                            { backgroundColor: option.color },
                          ]}
                        />
                      )}
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#3b82f6"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer */}
            <View style={styles.dropdownFooter}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setIsOpen(false)}
              >
                <Text style={styles.doneButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  triggerText: {
    fontSize: 14,
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  triggerTextPlaceholder: {
    color: "#9ca3af",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tagText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdown: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionSelected: {
    backgroundColor: "#eff6ff",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 14,
    color: "#374151",
  },
  optionTextSelected: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  dropdownFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  doneButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});