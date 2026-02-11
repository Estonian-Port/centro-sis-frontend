// components/navigation/CustomDrawerHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

interface CustomDrawerHeaderProps {
  title: string;
  showMenu?: boolean;
}

export const CustomDrawerHeader = ({ 
  title, 
  showMenu = true 
}: CustomDrawerHeaderProps) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const isWeb = Platform.OS === "web";

  const toggleDrawer = () => {
    if (navigation?.toggleDrawer) {
      navigation.toggleDrawer();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {showMenu && isWeb && (
          <TouchableOpacity 
            onPress={toggleDrawer}
            style={styles.menuButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={24} color="#1f2937" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    // Sombra sutil (igual al header default del Drawer)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    minHeight: 60, // Altura consistente
  },
  menuButton: {
    padding: 4,
    marginRight: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    letterSpacing: -0.3,
  },
});