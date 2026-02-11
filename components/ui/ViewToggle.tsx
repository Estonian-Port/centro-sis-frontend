import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORES } from "@/util/colores";

export type ViewMode = "lista" | "calendario" | "grid" | "table";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableViews?: ViewMode[];
  activeColor?: string;
  inactiveColor?: string;
  style?: any;
}

const viewIcons: Record<ViewMode, keyof typeof Ionicons.glyphMap> = {
  lista: "list",
  calendario: "calendar",
  grid: "grid",
  table: "albums",
};

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  availableViews = ["lista", "calendario"],
  activeColor = COLORES.violeta,
  inactiveColor = "#6b7280",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {availableViews.map((view) => (
        <TouchableOpacity
          key={view}
          style={[
            styles.button,
            currentView === view && [
              styles.buttonActive,
              { backgroundColor: activeColor },
            ],
          ]}
          onPress={() => onViewChange(view)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={viewIcons[view]}
            size={20}
            color={currentView === view ? "#ffffff" : inactiveColor}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
  },
  button: {
    padding: 8,
    borderRadius: 6,
  },
  buttonActive: {
    backgroundColor: "#3b82f6",
  },
});