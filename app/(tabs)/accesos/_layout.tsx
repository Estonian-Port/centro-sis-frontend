import { Ionicons } from "@expo/vector-icons";
import { useRouter, Slot, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORES } from "@/util/colores";
import { useAuth } from "@/context/authContext";
import { CustomDrawerHeader } from "@/components/navigation/CustomDrawerHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccesosLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"mis-accesos" | "todos-accesos">("mis-accesos");
  const isAdmin = selectedRole === "ADMINISTRADOR";

  useEffect(() => {
    if (pathname.includes('todos-accesos')) {
      setActiveTab('todos-accesos');
    } else if (pathname.includes('mis-accesos')) {
      setActiveTab('mis-accesos');
    }
  }, [pathname]);

  const handleTabChange = (tab: "mis-accesos" | "todos-accesos") => {
    setActiveTab(tab);
    router.push(`/accesos/${tab}`);
  };

  if (selectedRole == null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos de usuario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ✅ Header unificado */}
      <CustomDrawerHeader title="Accesos" />

      {/* Tabs (solo admin) */}
      {isAdmin && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "mis-accesos" && styles.activeTab]}
            onPress={() => handleTabChange("mis-accesos")}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={activeTab === "mis-accesos" ? "#ffffff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "mis-accesos" && styles.activeTabText,
              ]}
            >
              Mis Accesos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "todos-accesos" && styles.activeTab]}
            onPress={() => handleTabChange("todos-accesos")}
          >
            <Ionicons
              name="people-outline"
              size={18}
              color={activeTab === "todos-accesos" ? "#ffffff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "todos-accesos" && styles.activeTabText,
              ]}
            >
              Todos los Accesos
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  activeTab: {
    backgroundColor: COLORES.violeta,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
  },
});