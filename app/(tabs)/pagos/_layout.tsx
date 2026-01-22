// app/(tabs)/pagos/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Slot, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORES } from "@/util/colores";
import { useAuth } from "@/context/authContext";
import { CustomDrawerHeader } from "@/components/navigation/CustomDrawerHeader";

export default function PagosLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"recibidos" | "realizados">(
    "recibidos",
  );

  const isAlumno = selectedRole === "ALUMNO";

  useEffect(() => {
    if (pathname.includes("realizados")) {
      setActiveTab("realizados");
    } else if (pathname.includes("recibidos")) {
      setActiveTab("recibidos");
    }
  }, [pathname]);

  const handleTabChange = (tab: "recibidos" | "realizados") => {
    setActiveTab(tab);
    router.push(`/pagos/${tab}`);
  };

  if (selectedRole == null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos de usuario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Header unificado */}
      <CustomDrawerHeader title="Pagos" />

      {/* Tabs */}
      {!isAlumno && (
        <View style={styles.tabsContainer}>
          {/* Solo muestra tab Recibidos si NO es alumno */}
          <TouchableOpacity
            style={[styles.tab, activeTab === "recibidos" && styles.activeTab]}
            onPress={() => handleTabChange("recibidos")}
          >
            <Ionicons
              name="wallet-outline"
              size={18}
              color={activeTab === "recibidos" ? "#ffffff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "recibidos" && styles.activeTabText,
              ]}
            >
              Recibidos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "realizados" && styles.activeTab,
              isAlumno && styles.tabFullWidth,
            ]}
            onPress={() => handleTabChange("realizados")}
          >
            <Ionicons
              name="card-outline"
              size={18}
              color={activeTab === "realizados" ? "#ffffff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "realizados" && styles.activeTabText,
              ]}
            >
              Realizados
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#6b7280",
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
  tabFullWidth: {
    flex: 1,
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
