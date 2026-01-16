// components/ui/Tag.tsx
import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

type TagVariant = "primary" | "success" | "warning" | "danger" | "info" | "default";
type TagSize = "default" | "small";

interface TagProps {
  label: string;
  variant?: TagVariant;
  size?: TagSize;
  style?: ViewStyle;
}

export const Tag: React.FC<TagProps> = ({ 
  label, 
  variant = "default", 
  size = "default",
  style 
}) => {
  // ✅ Validar y sanitizar el variant
  const validVariants: TagVariant[] = ["primary", "success", "warning", "danger", "info", "default"];
  const safeVariant = validVariants.includes(variant) ? variant : "default";
  
  const variantStyles = {
    primary: {
      container: styles.primaryContainer,
      text: styles.primaryText,
    },
    success: {
      container: styles.successContainer,
      text: styles.successText,
    },
    warning: {
      container: styles.warningContainer,
      text: styles.warningText,
    },
    danger: {
      container: styles.dangerContainer,
      text: styles.dangerText,
    },
    info: {
      container: styles.infoContainer,
      text: styles.infoText,
    },
    default: {
      container: styles.defaultContainer,
      text: styles.defaultText,
    },
  };

  const sizeStyles = {
    default: {
      container: styles.containerDefault,
      text: styles.textDefault,
    },
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
    },
  };

  return (
    <View
      pointerEvents="none" // ✅ No intercepta clicks
      style={[
        styles.container,
        sizeStyles[size].container,
        variantStyles[safeVariant].container, // ✅ Usa safeVariant
        style,
      ]}
    >
      <Text style={[sizeStyles[size].text, variantStyles[safeVariant].text]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  containerDefault: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  textDefault: {
    fontSize: 12,
    fontWeight: "600",
  },
  textSmall: {
    fontSize: 10,
    fontWeight: "600",
  },
  // Primary (Azul)
  primaryContainer: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
  },
  primaryText: {
    color: "#1e40af",
  },
  // Success (Verde)
  successContainer: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  successText: {
    color: "#065f46",
  },
  // Warning (Amarillo)
  warningContainer: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  warningText: {
    color: "#92400e",
  },
  // Danger (Rojo)
  dangerContainer: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
  },
  dangerText: {
    color: "#991b1b",
  },
  // Info (Gris)
  infoContainer: {
    backgroundColor: "#f3f4f6",
    borderColor: "#9ca3af",
  },
  infoText: {
    color: "#374151",
  },
  // Default
  defaultContainer: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
  },
  defaultText: {
    color: "#6b7280",
  },
});