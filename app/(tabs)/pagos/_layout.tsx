// app/(tabs)/pagos/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Slot } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORES } from "@/util/colores";
import { useAuth } from "@/context/authContext";

export default function PagosLayout() {
  const router = useRouter();
  const { selectedRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"recibidos" | "realizados">("recibidos");

  // Alumno solo ve "Realizados"
  const isAlumno = selectedRole === "ALUMNO";

  const handleTabChange = (tab: "recibidos" | "realizados") => {
    setActiveTab(tab);
    router.push(`/pagos/${tab}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pagos</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {/* Solo muestra tab Recibidos si NO es alumno */}
        {!isAlumno && (
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
        )}

        <TouchableOpacity
          style={[
            styles.tab, 
            activeTab === "realizados" && styles.activeTab,
            isAlumno && styles.tabFullWidth
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
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
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