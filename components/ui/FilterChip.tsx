import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface FilterOption<T> {
  value: T;
  label: string;
  color?: string;
}

interface FilterChipsProps<T> {
  options: FilterOption<T>[];
  selectedValues: T[];
  onToggle: (value: T) => void;
  style?: any;
}

export function FilterChips<T>({
  options,
  selectedValues,
  onToggle,
  style,
}: FilterChipsProps<T>) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Filtrar: </Text>
      <View style={styles.chipsContainer}>
        {options.map((option, index) => {
          const isActive = selectedValues.includes(option.value);
          const color = option.color || "#3b82f6";

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.chip,
                isActive && {
                  borderColor: color,
                  backgroundColor: `${color}15`,
                },
              ]}
              onPress={() => onToggle(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && { color: color, fontWeight: "600" },
                ]}
              >
                {option.label}
              </Text>
              {isActive && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={color}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginLeft: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  checkIcon: {
    marginLeft: 2,
  },
});